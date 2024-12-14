import { useEffect } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'

const authPaths = ['/sign-in', '/sign-up', '/verify', '/otp', '/forgot-password']

export function useNavigationShortcuts() {
  const { getCurrentPath, goBack, goForward, isNavigationBlocked } = useNavigationStore()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const currentPath = getCurrentPath()
      
      // Disable shortcuts if we're on an auth page or navigation is blocked
      if (authPaths.includes(currentPath) || isNavigationBlocked) {
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault()
        goBack()
      }
      if ((event.metaKey || event.ctrlKey) && event.key === ']') {
        event.preventDefault()
        goForward()
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft') {
        event.preventDefault()
        goBack()
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault()
        goForward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBack, goForward, getCurrentPath, isNavigationBlocked])
}
