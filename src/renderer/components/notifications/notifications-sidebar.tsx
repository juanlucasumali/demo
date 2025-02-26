import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { formatDistanceToNowStrict } from 'date-fns'
import { Box, File, Folder, HelpCircle, X } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"
import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar"
import { useNotificationsStore } from "@renderer/stores/notifications-store"
import { Button } from "../ui/button"
import { Switch } from "@renderer/components/ui/switch"

export function NotificationsSidebar() {
  const { data: notifications = [], isLoading, removeNotification } = useNotifications()
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)
  const { close, showOnStartup, toggleShowOnStartup, setSelectedItem } = useNotificationsStore()
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
        getItemIcon(notification.sharedItem.item.type) :
        <File className="h-4 w-4" />

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
                  onClick={() => handleItemClick(
                    notification.sharedItem!.item.name,
                    notification.sharedItem!.item.type,
                    notification.sharedItem!.item.id
                  )}
                >
                  {notification.sharedItem.item.name}
                </Link>
              ) : (
                <span 
                  onClick={() => handleItemClick(
                    notification.sharedItem!.item.name,
                    notification.sharedItem!.item.type
                  )}
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

  if (isLoading) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground border-l">
      <div className="p-4 flex items-center justify-between border-b">
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            You have {notifications.length} unread notifications
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={close}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
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
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Show on startup</span>
          <Switch 
            checked={showOnStartup}
            onCheckedChange={toggleShowOnStartup}
          />
        </div>
      </div>
    </div>
  )
} 