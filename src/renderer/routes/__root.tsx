import { AppSidebar } from '@renderer/components/sidebar/app-sidebar'
import { SidebarProvider } from '@renderer/components/ui/sidebar'
import { AppTopbar } from '@renderer/components/topbar/app-topbar'
import { cn } from '../lib/utils'
import { Outlet } from '@tanstack/react-router'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { AuthContextType } from '@renderer/context/auth-context'

export interface MyRouterContext {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Implement breadcrumbs, Sidebar toggle, back & forth button
  component: () => (
        <Outlet/>
  )
})
