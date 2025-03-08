import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { File, Folder, Box, HelpCircle, X } from "lucide-react"
import { Button } from "@renderer/components/ui/button"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { formatDistanceToNowStrict } from 'date-fns'
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"
import { Link } from "@tanstack/react-router"
import { useState } from "react"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch?: (term: string) => void
}

export function NotificationsDialog({ open, onOpenChange, onSearch }: NotificationsDialogProps) {
  const { unreadNotifications, deleteNotification } = useNotifications()
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null);

  if (unreadNotifications.length === 0) {
    return null;
  }

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.FILE:
        return <File className="h-4 w-4 flex-shrink-0" />
      case ItemType.FOLDER:
        return <Folder className="h-4 w-4 flex-shrink-0" />
      case ItemType.PROJECT:
        return <Box className="h-4 w-4 flex-shrink-0" />
      default:
        return <File className="h-4 w-4 flex-shrink-0" />
    }
  }

  const getNotificationContent = (notification: DemoNotification) => {
    const typeIcon = notification.type === NotificationType.REQUEST ? 
      <HelpCircle className="h-4 w-4 flex-shrink-0" /> :
      notification.sharedItem ? 
        getItemIcon(notification.sharedItem.type) :
        <File className="h-4 w-4 flex-shrink-0" />

    const handleFileClick = (name: string, type: ItemType, itemId?: string) => {
      if (type === ItemType.FILE || type === ItemType.FOLDER) {
        onOpenChange(false);
        onSearch?.(name);
      } else if (type === ItemType.PROJECT && itemId) {
        onOpenChange(false);
      }
    };

    return (
      <>
        <div className="flex items-center gap-2">
          {typeIcon}
          <span className="min-w-0 break-words">
            <Link 
              to={`/profiles/${notification.from?.id}` as any}
              className="font-semibold hover:text-muted-foreground"
            >
              @{notification.from?.username}
            </Link>
            <span className="font-normal">
              {notification.type === NotificationType.REQUEST ? (
                ` requested a ${notification.requestType?.toLowerCase()}`
              ) : (
                ' shared '
              )}
            </span>
            {notification.type === NotificationType.SHARE && notification.sharedItem && (
              notification.sharedItem.type === ItemType.PROJECT ? (
                <Link
                  to={`/projects/${notification.sharedItem.id}` as any}
                  className="font-normal hover:text-muted-foreground break-all"
                  onClick={() => onOpenChange(false)}
                >
                  {notification.sharedItem.name}
                </Link>
              ) : (
                <span 
                  onClick={() => handleFileClick(notification.sharedItem!.name, notification.sharedItem!.type)}
                  className="font-normal hover:text-muted-foreground cursor-pointer break-all"
                >
                  {notification.sharedItem.name}
                </span>
              )
            )}
          </span>
        </div>
        {(notification.requestDescription || notification.sharedMessage) && (
          <p className="text-sm text-muted-foreground mt-1 ml-6 break-words">
            {notification.requestDescription || notification.sharedMessage}
          </p>
        )}
      </>
    )
  }

  const sortedNotifications = [...unreadNotifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <DialogHeader className="p-6 space-y-4">
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You have {unreadNotifications.length} unread notifications.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea 
          className="px-6" 
          style={{ 
            height: `${Math.min(unreadNotifications.length * 80, 300)}px`
          }}
        >
          <div className="space-y-4 pr-2">
            {sortedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="grid grid-cols-[auto,1fr,auto] items-start gap-3 p-2 rounded-lg transition-colors hover:bg-muted relative"
                onMouseEnter={() => setHoveredNotificationId(notification.id)}
                onMouseLeave={() => setHoveredNotificationId(null)}
              >
                <div className="pt-2 flex-shrink-0">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                <div className="space-y-1 min-w-0 overflow-hidden">
                  <div className="text-sm break-words">
                    {getNotificationContent(notification)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="w-8 flex-shrink-0">
                  {hoveredNotificationId === notification.id && (
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 rounded-full hover:bg-accent"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-6 border-t">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 