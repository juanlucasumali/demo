import { Dialog, DialogContent } from "@renderer/components/ui/dialog"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { File, Folder, Box, HelpCircle, X } from "lucide-react"
import { Switch } from "@renderer/components/ui/switch"
import { Button } from "@renderer/components/ui/button"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { formatDistanceToNowStrict } from 'date-fns'
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"
import { Link } from "@tanstack/react-router"
import { useState } from "react"
import { useNotificationsStore } from '@renderer/stores/notifications-store'

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSearch?: (term: string) => void
}

export function NotificationsDialog({ open, onOpenChange, onSearch }: NotificationsDialogProps) {
  const { data: notifications = [], isLoading, removeNotification } = useNotifications()
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null);
  const { showOnStartup, toggleShowOnStartup } = useNotificationsStore()

  if (isLoading || notifications.length === 0) {
    return null;
  }

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.FILE:
        return <File className="h-4 w-4" />
      case ItemType.FOLDER:
        return <Folder className="h-4 w-4" />
      case ItemType.PROJECT:
        return <Box className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getNotificationContent = (notification: DemoNotification) => {
    const typeIcon = notification.type === NotificationType.REQUEST ? 
      <HelpCircle className="h-4 w-4" /> :
      notification.sharedItem ? 
        getItemIcon(notification.sharedItem.item.type) :
        <File className="h-4 w-4" />

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
          <span>
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
              notification.sharedItem.item.type === ItemType.PROJECT ? (
                <Link
                  to={`/projects/${notification.sharedItem.item.id}` as any}
                  className="font-normal hover:text-muted-foreground"
                  onClick={() => onOpenChange(false)}
                >
                  {notification.sharedItem.item.name}
                </Link>
              ) : (
                <span 
                  onClick={() => handleFileClick(notification.sharedItem!.item.name, notification.sharedItem!.item.type)}
                  className="font-normal hover:text-muted-foreground cursor-pointer"
                >
                  {notification.sharedItem.item.name}
                </span>
              )
            )}
          </span>
        </div>
        {(notification.description || notification.sharedItem?.message) && (
          <p className="text-sm text-muted-foreground mt-1">
            {notification.description || notification.sharedItem?.message}
          </p>
        )}
      </>
    )
  }

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            You have {notifications.length} unread notifications.
          </p>
        </div>

        <ScrollArea className="h-[300px] px-6">
          <div className="space-y-4">
            {sortedNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className="flex items-start gap-3 relative group p-2 rounded-lg transition-colors hover:bg-muted"
                onMouseEnter={() => setHoveredNotificationId(notification.id)}
                onMouseLeave={() => setHoveredNotificationId(null)}
              >
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                <div className="space-y-1 flex-1">
                  <div className="text-sm">
                    {getNotificationContent(notification)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {hoveredNotificationId === notification.id && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-accent"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Show on startup</span>
              <Switch 
                checked={showOnStartup} 
                onCheckedChange={toggleShowOnStartup}
                className="focus-visible:ring-0 focus:ring-0"
                data-focus-visible="false"
              />
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 