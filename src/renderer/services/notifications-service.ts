import { supabase } from '@renderer/lib/supabase'
import { DemoItem } from '@renderer/types/items'
import { DemoNotification, NotificationType } from '@renderer/types/notifications'
import { UserProfile } from '@renderer/types/users'

export async function getNotifications(): Promise<DemoNotification[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No user found')

  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      from:from_id(id, username, name, avatar),
      shared_item:shared_item_id(*),
      shared_project:shared_project_id(*)
    `)
    .eq('to_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Transform the data to match DemoNotification type
  return data.map(notification => ({
    id: notification.id,
    createdAt: new Date(notification.created_at),
    from: notification.from as UserProfile,
    isRead: notification.is_read,
    type: notification.type as NotificationType,
    requestType: notification.request_type,
    requestDescription: notification.request_description,
    sharedItem: notification.shared_project 
      ? { ...notification.shared_project, type: 'project' }
      : notification.shared_item as DemoItem | null,
    sharedMessage: notification.shared_message
  }))
}

export async function createShareNotification(
  fromUserId: string,
  toUserId: string,
  itemId: string,
  itemType?: 'file' | 'folder' | 'project',
  sharedMessage?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: NotificationType.SHARE,
        from_id: fromUserId,
        to_id: toUserId,
        shared_item_id: itemType !== 'project' ? itemId : null,
        shared_project_id: itemType === 'project' ? itemId : null,
        shared_message: sharedMessage || null,
        request_type: null,
        request_description: null,
        is_read: false
      })

    if (error) {
      console.error('Error creating share notification:', error)
      throw new Error('Failed to create share notification')
    }
  } catch (error) {
    console.error('Error in createShareNotification:', error)
    throw new Error('Failed to create share notification')
  }
}

export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    if (error) {
      console.error('Error deleting notification:', error)
      throw new Error('Failed to delete notification')
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error)
    throw new Error('Failed to delete notification')
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      throw new Error('Failed to mark notification as read')
    }
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error)
    throw new Error('Failed to mark notification as read')
  }
}

export async function markNotificationAsUnread(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: false })
    .eq('id', notificationId)

  if (error) throw error
}

export async function deleteShareNotifications(
  itemId: string,
  userIds: string[],
  itemType: 'file' | 'folder' | 'project'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('to_id', userIds)
      .eq(itemType === 'project' ? 'shared_project_id' : 'shared_item_id', itemId)
      .eq('type', NotificationType.SHARE);

    if (error) {
      console.error('Error deleting share notifications:', error);
      throw new Error('Failed to delete share notifications');
    }
  } catch (error) {
    console.error('Error in deleteShareNotifications:', error);
    throw new Error('Failed to delete share notifications');
  }
}

export async function createRequestNotification(
  fromUserId: string,
  toUserId: string,
  requestType: 'file' | 'folder' | 'project',
  requestDescription: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        type: NotificationType.REQUEST,
        from_id: fromUserId,
        to_id: toUserId,
        request_type: requestType,
        request_description: requestDescription,
        shared_item_id: null,
        shared_project_id: null,
        shared_message: null,
        is_read: false
      });

    if (error) {
      console.error('Error creating request notification:', error);
      throw new Error('Failed to create request notification');
    }
  } catch (error) {
    console.error('Error in createRequestNotification:', error);
    throw new Error('Failed to create request notification');
  }
} 