import { Bell } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useNotifications } from '@renderer/hooks/use-notifications';
import { useNotificationsStore } from '@renderer/stores/notifications-store';

export function NotificationsBell() {
  const { data: notifications = [] } = useNotifications();
  const { toggle } = useNotificationsStore();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative h-8 w-8"
      onClick={toggle}
    >
      <Bell className="h-4 w-4" />
      {notifications.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-medium text-white">
          {notifications.length > 99 ? '99+' : notifications.length}
        </span>
      )}
    </Button>
  );
} 