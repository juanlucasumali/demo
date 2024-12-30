import { useQuery } from '@tanstack/react-query';
import { supabase } from '@renderer/lib/supabase';
import { DemoNotification } from '@renderer/types/notifications';
import { useUserStore } from '@renderer/stores/user-store';

export function useNotifications() {
  const user = useUserStore(state => state.user);

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select(` 
          *,
          from:from_user_id(*)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DemoNotification[];
    },
    enabled: !!user
  });
} 