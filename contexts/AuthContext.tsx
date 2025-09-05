import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabaseClient';

interface AuthContextType {
  session: Session | null;
  currentUser: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  currentUser: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil session pertama kali
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

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
              warnings: null,
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

      setLoading(false);
    });

    // Listener perubahan session
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

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
              warnings: null,
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
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
