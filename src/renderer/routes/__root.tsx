import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/renderer/components/ui/toaster'
import GeneralError from '@/renderer/features/errors/general-error'
import NotFoundError from '@/renderer/features/errors/not-found-error'
import { useNavigationShortcuts } from '../hooks/use-navigation-shortcuts'
import { useEffect } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import { navigation } from '../services/navigation'
import { useNavigationStore } from '../stores/useNavigationStore'
import { router } from '../main'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    useNavigationShortcuts()
    const navigate = useNavigate()
    const { setLastVisitedPath } = useNavigationStore()

    useEffect(() => {
      // Track path changes
      const currentPath = navigation.getCurrentPath()
      setLastVisitedPath(currentPath)

      // Subscribe to route changes
      const unsubscribe = router.subscribe('onBeforeRouteMount', () => {
        const newPath = navigation.getCurrentPath()
        setLastVisitedPath(newPath)
      })

      return () => {
        unsubscribe()
      }
    }, [])

    useEffect(() => {
      const verifyAuthentication = async () => {
        // Check if current route is an auth route
        const currentPath = navigation.getCurrentPath()

        console.log("Verifying auth from __root...")
        const { verifyAuth } = useAuthStore.getState()
        await verifyAuth()

        const isAuthenticated = useAuthStore.getState().isAuthenticated
        const hasProfile = useAuthStore.getState().hasProfile

        if ((!isAuthenticated || !hasProfile) && currentPath !== '/sign-in') {
          console.log("Current path:", currentPath)
          console.log('Missing authentication or profile, redirecting to sign-in')
          navigate({ to: '/sign-in' })
        }
      }
      
      verifyAuthentication()
    }, [])

    return (
      <>
        <Outlet />
        <Toaster />
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
