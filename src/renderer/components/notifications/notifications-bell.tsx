import { Bell } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useNotifications } from '@renderer/hooks/use-notifications';
import { useNotificationsStore } from '@renderer/stores/notifications-store';

export function NotificationsBell() {
  const { unreadNotifications, markMultipleAsRead } = useNotifications();
  const { toggle, setVisuallyUnreadIds } = useNotificationsStore();

  const handleClick = () => {
    if (unreadNotifications.length > 0) {
      const unreadIds = unreadNotifications.map(n => n.id);
      setVisuallyUnreadIds(unreadIds);
      markMultipleAsRead(unreadIds);
    }
    toggle();
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={handleClick}
    >
      <Bell className="h-5 w-5" />
      {unreadNotifications.length > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-medium text-white flex items-center justify-center">
          {unreadNotifications.length}
        </span>
      )}
    </Button>
  );
} 