import { useEffect } from 'react'
import { useNavigationStore } from '../stores/useNavigationStore'

const authPaths = ['/sign-in', '/sign-up', '/verify', '/otp', '/forgot-password']

export function useNavigationShortcuts() {
  const { getCurrentPath, goBack, goForward } = useNavigationStore()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const currentPath = getCurrentPath()
      
      // Disable shortcuts if we're on an auth page
      if (authPaths.includes(currentPath)) {
        return
      }

      // Command/Control + [ = Back
      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault()
        goBack()
      }
      // Command/Control + ] = Forward
      if ((event.metaKey || event.ctrlKey) && event.key === ']') {
        event.preventDefault()
        goForward()
      }
      // Command/Control + Left Arrow = Back (alternative)
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft') {
        event.preventDefault()
        goBack()
      }
      // Command/Control + Right Arrow = Forward (alternative)
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault()
        goForward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goBack, goForward, getCurrentPath])
}
