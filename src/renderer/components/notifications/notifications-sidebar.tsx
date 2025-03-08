import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { formatDistanceToNowStrict } from 'date-fns'
import { Box, File, Folder, HelpCircle, X, Mail } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"
import { useNotificationsStore } from "@renderer/stores/notifications-store"
import { Button } from "../ui/button"
import { Switch } from "@renderer/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger } from "@renderer/components/ui/tooltip"

export function NotificationsSidebar() {
  const { notifications, deleteNotification, markAsUnread } = useNotifications()
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)
  const { 
    close, 
    showOnStartup, 
    toggleShowOnStartup, 
    setSelectedItem,
    visuallyUnreadIds,
    clearVisuallyUnreadIds
  } = useNotificationsStore()
  const navigate = useNavigate()

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

  const handleItemClick = (name: string, type: ItemType, itemId?: string) => {
    close()
    setSelectedItem({ name, type, id: itemId })
    
    if (type === ItemType.PROJECT && itemId) {
      navigate({ to: `/projects/${itemId}` as any })
    } else {
      navigate({ to: '/home' as any })
    }
  }

  const getNotificationContent = (notification: DemoNotification) => {
    const typeIcon = notification.type === NotificationType.REQUEST ? 
      <HelpCircle className="h-4 w-4" /> :
      notification.sharedItem ? 
        getItemIcon(notification.sharedItem.type) :
        <File className="h-4 w-4" />

    return (
      <>
        <div className="flex items-center gap-2">
          {typeIcon}
          <span className="flex-1 break-words">
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
            <br />
            {notification.type === NotificationType.SHARE && notification.sharedItem && (
              notification.sharedItem.type === ItemType.PROJECT ? (
                <Link
                  to={`/projects/${notification.sharedItem.id}` as any}
                  className="font-normal hover:text-muted-foreground break-all"
                  onClick={() => handleItemClick(
                    notification.sharedItem!.name,
                    notification.sharedItem!.type,
                    notification.sharedItem!.id
                  )}
                >
                  {notification.sharedItem.name}
                </Link>
              ) : (
                <span 
                  onClick={() => handleItemClick(
                    notification.sharedItem!.name,
                    notification.sharedItem!.type
                  )}
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

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const handleClose = () => {
    clearVisuallyUnreadIds()
    close()
  }

  const handleMarkAsUnread = (notificationId: string) => {
    markAsUnread(notificationId);
    // Don't close the sidebar or do anything else
  }

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground border-l">
      <div className="p-4 flex items-center justify-between border-b">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            You have {notifications.length} notifications
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {sortedNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className="group relative p-2 rounded-lg transition-colors hover:bg-muted"
              onMouseEnter={() => setHoveredNotificationId(notification.id)}
              onMouseLeave={() => setHoveredNotificationId(null)}
            >
              <div className="grid grid-cols-[1fr,48px] gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex-none pt-1">
                    {(!notification.isRead || visuallyUnreadIds.includes(notification.id)) && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm break-words">
                      {getNotificationContent(notification)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNowStrict(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-1 pt-1 justify-end">
                  {hoveredNotificationId === notification.id && (
                    <>
                      {notification.isRead && !visuallyUnreadIds.includes(notification.id) && (
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleMarkAsUnread(notification.id)}
                              className="p-1 rounded-full hover:bg-accent"
                            >
                              <Mail className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Mark as unread</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 rounded-full hover:bg-accent"
                          >
                            <X className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Remove</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show on startup</span>
          <Switch 
            checked={showOnStartup}
            onCheckedChange={toggleShowOnStartup}
            className="focus-visible:ring-0 focus:ring-0"
            data-focus-visible="false"
          />
        </div>
      </div>
    </div>
  )
} 