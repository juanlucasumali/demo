import * as React from "react"
import { useNotificationsStore } from "@renderer/stores/notifications-store"
import { NotificationsSidebar } from "./notifications-sidebar"
import { SidebarProvider } from "../ui/sidebar"
import { cn } from "@renderer/lib/utils"

interface NotificationsProviderProps {
  children: React.ReactNode
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const isOpen = useNotificationsStore((state) => state.isOpen)

  return (
    <SidebarProvider>
      <div 
        className="group/notifications-wrapper flex min-h-svh w-full"
        style={{
          "--notifications-width": "20rem"
        } as React.CSSProperties}
      >
        {children}
        <div
          data-state={isOpen ? "expanded" : "collapsed"}
          className={cn(
            "duration-200 fixed inset-y-0 right-0 z-50 flex w-[var(--notifications-width)] transition-[right,width] ease-linear",
            "data-[state=collapsed]:right-[calc(var(--notifications-width)*-1)]",
          )}
        >
          <NotificationsSidebar />
        </div>
      </div>
    </SidebarProvider>
  )
} 