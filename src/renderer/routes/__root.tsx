import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../index.css'
import { AppSidebar } from '@renderer/components/sidebar/app-sidebar'
import { SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppTopbar } from '@renderer/components/app-topbar'
import { cn } from '../lib/utils'

export const Route = createRootRoute({
  // Implement breadcrumbs, Sidebar toggle, back & forth button
  component: () => (
    <>
    <SidebarProvider>
      <AppSidebar />
      <div
          id='content'
          className={cn(
            'max-w-full w-full ml-auto',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] ease-linear duration-200',
            'h-svh flex flex-col'
          )}
        >
        <AppTopbar/>
        <Outlet/>
      </div>
    </SidebarProvider>
    </>
  ),
})