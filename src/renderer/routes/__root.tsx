import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/renderer/components/ui/toaster'
import GeneralError from '@/renderer/features/errors/general-error'
import NotFoundError from '@/renderer/features/errors/not-found-error'
// import { NavigationControls } from '../components/navigation-controls'
import { useNavigationShortcuts } from '../hooks/use-navigation-shortcuts'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    useNavigationShortcuts()

    return (
      <>
        <Outlet />
        <Toaster />
        {/* <NavigationControls /> */}
        {import.meta.env.MODE === 'development' && (
          <>
            <ReactQueryDevtools buttonPosition='bottom-left' />
            <TanStackRouterDevtools position='bottom-right' />
          </>
        )}
      </>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
