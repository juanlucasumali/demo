import { useQuery } from '@tanstack/react-query';
import { DemoNotification } from '@renderer/types/notifications';
import * as notificationsService from '@renderer/services/notifications-service';

export function useNotifications() {
  return useQuery<DemoNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
    // For development, disable refetching
    refetchInterval: false,
    refetchOnWindowFocus: false
  });
} 