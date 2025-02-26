import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DemoNotification } from '@renderer/types/notifications';
import * as notificationsService from '@renderer/services/notifications-service';

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery<DemoNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
    // For development, disable refetching
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  const removeNotification = (notificationId: string) => {
    queryClient.setQueryData(['notifications'], (oldData: DemoNotification[] | undefined) => {
      if (!oldData) return [];
      return oldData.filter(notification => notification.id !== notificationId);
    });
  };

  return {
    ...query,
    removeNotification
  };
} 