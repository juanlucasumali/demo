import { redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/renderer/stores/authStore'

export async function protectedLoader() {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    console.log('Protected route check:', { isAuthenticated })
    if (!isAuthenticated) {
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
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    console.log('Public route check:', { isAuthenticated })
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to dashboard')
      throw redirect({
        to: '/dashboard',
      })
    }
  }
  