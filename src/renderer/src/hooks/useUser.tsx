import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';

interface User {
  user_id: string;
  created_at: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  local_path: string | null;
}

interface UseUserReturn {
  user: User | null;
  error: any;
  isLoading: boolean;
  setLocalPath: (path: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  signUp: (credentials: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => Promise<any>;
  signIn: (credentials: { email: string; password: string }) => Promise<any>;
  mutate: () => Promise<void | User | undefined>;
}

export function useUser(): UseUserReturn {
  const {
    data: user,
    error,
    isLoading,
    mutate
  } = useSWR<User>('userData', async () => {
    // Get the authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authUser) throw new Error('No authenticated user found');

    // Get the user's profile data
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError) throw profileError;
    if (!data) throw new Error('No user profile found');

    return data as User;
  });

  const setLocalPath = async (path: string) => {
    if (!user) throw new Error('No user found');

    const { error: updateError } = await supabase
      .from('users')
      .update({ local_path: path })
      .eq('user_id', user.user_id);

    if (updateError) throw updateError;

    // Revalidate the data
    await mutate();
  };

  const checkEmailExists = async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Error checking email availability');
    }
    return !!data;
  };

  const checkUsernameExists = async (username: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error('Error checking username availability');
    }
    return !!data;
  };

  const signUp = async (credentials: {
    email: string;
    password: string;
    username: string;
    displayName: string;
  }) => {
    const { email, password, username, displayName } = credentials;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
        emailRedirectTo: `${window.location.origin}`,
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  };

  return {
    user: user || null,
    error,
    isLoading,
    setLocalPath,
    checkEmailExists,
    checkUsernameExists,
    signUp,
    signIn,
    mutate,
  };
}