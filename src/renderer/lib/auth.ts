import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/renderer/stores/useAuthStore'
import { useNavigationStore } from '../stores/useNavigationStore'

export async function protectedLoader() {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    const hasProfile = useAuthStore.getState().hasProfile
    const currentPath = useNavigationStore.getState().getCurrentPath()
    console.log("Current path:", currentPath)
    console.log('Protected route check:', { isAuthenticated, hasProfile })
    if (!isAuthenticated || !hasProfile) {
      console.log('Not authenticated, redirecting to sign-in')
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }
}

export async function publicOnlyLoader() {
  const hasProfile = useAuthStore.getState().hasProfile
  const isAuthenticated = useAuthStore.getState().isAuthenticated
  const lastVisitedPath = useNavigationStore.getState().getLastVisitedPath()
  
  console.log("Last visited path:", lastVisitedPath)
  console.log('Public route check:', { isAuthenticated, hasProfile })
  
  if (hasProfile && isAuthenticated) {
    console.log('Already has profile and is authenticated, redirecting to last visited path')
    throw redirect({
      to: lastVisitedPath || '/dashboard',
    })
  } 
}
