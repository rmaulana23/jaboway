// Tambahan: lebih verbose logging
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      setUser(data?.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("🔑 Auth event:", _event, session);
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    console.log("🟢 Signup attempt:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      console.error("❌ Signup error:", error.message, error);
      alert(`Signup failed: ${error.message}`);
    } else {
      console.log("✅ Signup success:", data);
      alert("Signup success! Please check your email for confirmation.");
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    console.log("🟢 Login attempt:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error.message, error);
      alert(`Login failed: ${error.message}`);
    } else {
      console.log("✅ Login success:", data);
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Logout error:", error.message, error);
    } else {
      console.log("👋 Logged out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
