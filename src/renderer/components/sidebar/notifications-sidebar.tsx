import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { useNotifications } from "@renderer/hooks/use-notifications"
import { formatDistanceToNowStrict } from 'date-fns'
import { Box, File, Folder, HelpCircle, X } from "lucide-react"
import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"
import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar"

interface NotificationsSidebarProps {
  onSearch?: (term: string) => void
}

export function NotificationsSidebar({ onSearch }: NotificationsSidebarProps) {
  const { data: notifications = [], isLoading, removeNotification } = useNotifications()
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)

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
        onSearch?.(name)
      }
    }

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

  if (isLoading) {
    return null
  }

  return (
    <Sidebar side="right" className="border-l">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          You have {notifications.length} unread notifications
        </p>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
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
      </SidebarContent>
    </Sidebar>
  )
} 