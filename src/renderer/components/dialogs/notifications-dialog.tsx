import { Dialog, DialogContent } from "@renderer/components/ui/dialog"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { File, Folder, Box, HelpCircle } from "lucide-react"
import { Switch } from "@renderer/components/ui/switch"
import { Button } from "@renderer/components/ui/button"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { formatDistanceToNow } from 'date-fns'
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"

interface NotificationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationsDialog({ open, onOpenChange }: NotificationsDialogProps) {
  const { data: notifications = [], isLoading } = useNotifications()

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

    return (
      <>
        <div className="flex items-center gap-2">
            {typeIcon}
          <span>
            <span className="font-medium">@{notification.from?.username}</span>
            {notification.type === NotificationType.REQUEST ? ' requested ' : ' shared '}
            {notification.type === NotificationType.REQUEST ? (
              notification.itemsRequested?.map(item => (
                <span key={item.id} className="font-medium">{item.name}</span>
              ))
            ) : notification.sharedItem ? (
              <span className="font-medium">{notification.sharedItem.item.name}</span>
            ) : null}
          </span>
        </div>
        {(notification.description || notification.sharedItem?.message) && (
          <p className="text-sm text-muted-foreground mt-1">
            "{notification.description || notification.sharedItem?.message}"
          </p>
        )}
      </>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            You have {notifications.length} unread messages.
          </p>
        </div>

        <ScrollArea className="h-[300px] px-6">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                <div className="space-y-1 flex-1">
                  <div className="text-sm">
                    {getNotificationContent(notification)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Don't show this</span>
              <Switch />
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