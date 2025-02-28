import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DemoNotification } from '@renderer/types/notifications';
import * as notificationsService from '@renderer/services/notifications-service';

export function useNotifications() {
  const queryClient = useQueryClient();

  // Query for fetching all notifications
  const query = useQuery<DemoNotification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications(),
    // For development, disable refetching
    refetchInterval: false,
    refetchOnWindowFocus: false
  });

  // Derived state for unread notifications
  const unreadNotifications = query.data?.filter(n => !n.isRead) || [];
  const allNotifications = query.data || [];

  // Mutation for adding a notification
  const addNotification = useMutation({
    mutationFn: (params: { 
      fromUserId: string, 
      toUserId: string, 
      sharedItemId: string, 
      sharedMessage?: string,
      itemType: 'file' | 'folder' | 'project'
    }) => notificationsService.createShareNotification(
      params.fromUserId,
      params.toUserId,
      params.sharedItemId,
      params.itemType,
      params.sharedMessage
    ),
    onSuccess: () => {
      // Invalidate and refetch notifications after adding
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error adding notification:', error);
    }
  });

  // Mutation for deleting a notification
  const deleteNotification = useMutation({
    mutationFn: notificationsService.deleteNotification,
    onSuccess: (_, notificationId) => {
      // Optimistically update the UI
      queryClient.setQueryData(['notifications'], (oldData: DemoNotification[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(notification => notification.id !== notificationId);
      });
      // Then invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      // Refetch to ensure UI is in sync with server
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mutation for marking a notification as read
  const markAsRead = useMutation({
    mutationFn: notificationsService.markNotificationAsRead,
    onSuccess: (_, notificationId) => {
      // Optimistically update the UI
      queryClient.setQueryData(['notifications'], (oldData: DemoNotification[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        );
      });
      // Then invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mutation for marking multiple notifications as read
  const markMultipleAsRead = useMutation({
    mutationFn: (notificationIds: string[]) => 
      Promise.all(notificationIds.map(id => notificationsService.markNotificationAsRead(id))),
    onSuccess: (_, notificationIds) => {
      queryClient.setQueryData(['notifications'], (oldData: DemoNotification[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(notification => 
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        );
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Add mark as unread mutation
  const markAsUnread = useMutation({
    mutationFn: notificationsService.markNotificationAsUnread,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications'], (oldData: DemoNotification[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: false }
            : notification
        );
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Add this mutation
  const addRequestNotification = useMutation({
    mutationFn: (params: { 
      fromUserId: string, 
      toUserId: string, 
      requestType: 'file' | 'folder' | 'project',
      requestDescription: string 
    }) => notificationsService.createRequestNotification(
      params.fromUserId,
      params.toUserId,
      params.requestType,
      params.requestDescription
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error adding request notification:', error);
    }
  });

  return {
    // Data and loading states
    notifications: allNotifications,
    unreadNotifications,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Mutations
    addNotification: addNotification.mutate,
    deleteNotification: deleteNotification.mutate,
    markAsRead: markAsRead.mutate,
    markMultipleAsRead: markMultipleAsRead.mutate,
    markAsUnread: markAsUnread.mutate,
    addRequestNotification: addRequestNotification.mutate,

    // Loading states for mutations
    isAddingNotification: addNotification.isPending,
    isDeletingNotification: deleteNotification.isPending,
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAsUnread: markAsUnread.isPending,
    isAddingRequestNotification: addRequestNotification.isPending,
  };
} 