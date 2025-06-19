
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  company_id: string | null;
  username: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff' | 'guest';
  permissions: string[];
  is_active: boolean;
  company?: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

const AUTH_STORAGE_KEY = 'inventory-auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          company:companies(*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUserProfile(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUserProfile(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          setUserProfile(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isLoggingIn) {
      console.log('Login already in progress, ignoring duplicate request');
      return false;
    }

    setIsLoggingIn(true);
    console.log('Login attempt:', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login failed:', error.message);
        setIsLoggingIn(false);
        return false;
      }

      console.log('Login successful for:', data.user.email);
      setIsLoggingIn(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoggingIn(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setSession(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasPermission = (permission: string): boolean => {
    return userProfile?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return userProfile?.role === role;
  };

  return {
    user,
    userProfile,
    session,
    isLoading,
    isLoggingIn,
    login,
    signup,
    logout,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin' || userProfile?.role === 'super_admin',
    isSuperAdmin: userProfile?.role === 'super_admin',
    companyId: userProfile?.company_id,
    company: userProfile?.company
  };
};
