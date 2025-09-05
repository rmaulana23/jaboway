import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { Profile, UserWarning } from '../types';
import { supabase } from '../utils/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Result types for form feedback
interface Result {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  currentUser: Profile | null;
  session: Session | null;
  users: Profile[]; // For admin user list
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<Result>;
  updateUsername: (userId: string, newUsername: string) => Promise<Result>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<Result>;
  isUserAdmin: (userId: string) => boolean;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  muteUser: (userId: string, untilDate: string | null) => Promise<void>;
  unmuteUser: (userId: string) => Promise<void>;
  warnUser: (userId: string, message: string, title?: string) => Promise<void>;
  acknowledgeWarning: (userId: string, warningId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [users, setUsers] = useState<Profile[]>([]); // For admin page

  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // PATCHED: Tambahan fallback bikin profil user otomatis jika belum ada
if (session?.user) {
  const user = session.user;
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    const fallbackUsername =
      (user.user_metadata && user.user_metadata.username) ||
      (user.email ? user.email.split('@')[0] : `user_${user.id.slice(0, 6)}`);

    const { data: newProfile, error: insertErr } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        username: fallbackUsername,
        role: 'user',
        status: 'active',
        warnings: null
      })
      .select('*')
      .single();

    if (!insertErr) {
      profile = newProfile;
    }
  }

  setCurrentUser(profile ?? null);
} else {
  setCurrentUser(null);
}

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all users for admin panel
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      supabase.from('profiles').select('*').then(({ data }) => {
        if (data) setUsers(data);
      });
    } else {
      setUsers([]);
    }
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<Result> => {
    // First, check if user is blocked
    const { data: profile } = await supabase.from('profiles').select('status').eq('email', email).single();
    if (profile?.status === 'blocked') {
        return { success: false, error: 'account_blocked_error' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: 'invalid_credentials_error' };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const register = async (username: string, password: string, email: string): Promise<Result> => {
    // Check if username is taken first
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (existingProfile) {
      return { success: false, error: 'username_exists_error' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      // Supabase returns a generic error for email exists, so we map it
      return { success: false, error: 'email_exists_error' };
    }
    return { success: true };
  };
  
  const updateUsername = async (userId: string, newUsername: string): Promise<Result> => {
    // Check if new username is already taken
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('username', newUsername).not('id', 'eq', userId).single();
    if (existingProfile) {
      return { success: false, error: 'username_taken' };
    }
    
    const { error } = await supabase.from('profiles').update({ username: newUsername }).eq('id', userId);
    if (error) {
      return { success: false, error: error.message };
    }
    // Re-fetch current user profile to update state everywhere
    if (currentUser?.id === userId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setCurrentUser(profile);
    }
    return { success: true };
  };
  
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<Result> => {
    if (!currentUser) return { success: false };

    // Supabase doesn't have a direct "verify current password" method.
    // The workaround is to try to reauthenticate.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: currentPassword
    });

    if (reauthError) {
        return { success: false, error: 'error_current_password_incorrect' };
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        return { success: false, error: error.message };
    }
    return { success: true };
  };

  const isUserAdmin = useCallback((userId: string): boolean => {
    return users.find(u => u.id === userId)?.role === 'admin';
  }, [users]);
  
  const updateUserStatus = async (userId: string, status: 'active' | 'blocked') => {
    if (currentUser?.role !== 'admin') return;
    const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
    if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    }
  };

  const blockUser = async (userId: string) => updateUserStatus(userId, 'blocked');
  const unblockUser = async (userId: string) => updateUserStatus(userId, 'active');

  const muteUser = async (userId: string, untilDate: string | null) => {
    if (currentUser?.role !== 'admin') return;
    const { error } = await supabase.from('profiles').update({ muted_until: untilDate }).eq('id', userId);
    if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, muted_until: untilDate } : u));
    }
  };
  const unmuteUser = async (userId: string) => muteUser(userId, null);


  const warnUser = async (userId: string, message: string, title?: string) => {
    const { data: userToWarn } = await supabase.from('profiles').select('warnings').eq('id', userId).single();
    if (!userToWarn) return;

    const newWarning: UserWarning = {
      id: `warning-${Date.now()}`,
      message,
      title,
      acknowledged: false,
    };
    const currentWarnings = (userToWarn.warnings as UserWarning[] | null) || [];
    const updatedWarnings = [...currentWarnings, newWarning];

    const { error } = await supabase.from('profiles').update({ warnings: updatedWarnings }).eq('id', userId);
     if (!error) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, warnings: updatedWarnings } : u));
    }
  };

  const acknowledgeWarning = async (userId: string, warningId: string) => {
    if (!currentUser) return;
    const currentWarnings = (currentUser.warnings as UserWarning[] | null) || [];
    const updatedWarnings = currentWarnings.map(w => w.id === warningId ? { ...w, acknowledged: true } : w);

    const { error } = await supabase.from('profiles').update({ warnings: updatedWarnings }).eq('id', userId);
    if (!error) {
      setCurrentUser(prev => prev ? { ...prev, warnings: updatedWarnings } : null);
    }
  };
  
  const value = useMemo(() => ({
      currentUser,
      session,
      users,
      login,
      logout,
      register,
      updateUsername,
      updatePassword,
      isUserAdmin,
      blockUser,
      unblockUser,
      muteUser,
      unmuteUser,
      warnUser,
      acknowledgeWarning
  }), [currentUser, session, users]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
