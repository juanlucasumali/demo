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

  return {
    user: user || null,
    error,
    isLoading,
    setLocalPath,
    mutate
  };
}
