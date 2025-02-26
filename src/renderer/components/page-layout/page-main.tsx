import { cn } from '@renderer/lib/utils'
import { ReactNode } from 'react'
import { SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../sidebar/app-sidebar'
import { AppTopbar } from '../topbar/app-topbar'
import { MediaPlayer } from '../media-player/media-player'
import { useMediaPlayerStore } from '@renderer/stores/use-media-player-store'
import { NotificationsProvider } from '../notifications/notifications-provider'
import { useNotificationsStore } from '@renderer/stores/notifications-store'

interface PageContentProps {
    children: ReactNode
    className?: string
}

export function PageMain({ children, className }: PageContentProps) {
    const isPlayerVisible = useMediaPlayerStore(state => state.isVisible)
    const isNotificationsOpen = useNotificationsStore(state => state.isOpen)

    return (
        <SidebarProvider>
            <NotificationsProvider>
                <AppSidebar />
                <div
                    id='content'
                    className={cn(
                        'max-w-full w-full ml-auto',
                        'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
                        'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
                        isNotificationsOpen && 'md:w-[calc(100%-var(--sidebar-width)-var(--notifications-width))]',
                        'transition-[width] ease-linear duration-200',
                        'h-svh flex flex-col',
                    )}
                >
                    <AppTopbar/>
                    <div className={cn("flex flex-1 flex-col gap-4 p-4 pt-0", className)}>
                        {children}
                    </div>
                    {isPlayerVisible && <MediaPlayer />}
                </div>
            </NotificationsProvider>
        </SidebarProvider>
    )
}
