import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import '../index.css'
import { AuthContextType } from '@renderer/context/auth-context'

export interface MyRouterContext {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => <Outlet />
})