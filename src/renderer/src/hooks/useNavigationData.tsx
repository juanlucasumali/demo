import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { buildTree } from '@renderer/utils/buildTree';

export function useNavigationData() {
  const { data, error, isLoading } = useSWR('navigationData', async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');

    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const treeData = buildTree(items);
    return treeData;
  });

  return { data, error, isLoading };
}
