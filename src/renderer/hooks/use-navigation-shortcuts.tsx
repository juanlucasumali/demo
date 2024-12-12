import { useEffect } from 'react'
import { navigation } from '../services/navigation'

const authPaths = ['/sign-in', '/sign-up', '/verify', '/otp', '/forgot-password']

export function useNavigationShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const currentPath = navigation.getCurrentPath()
      
      // Disable shortcuts if we're on an auth page
      if (authPaths.includes(currentPath)) {
        return
      }

      // Command/Control + [ = Back
      if ((event.metaKey || event.ctrlKey) && event.key === '[') {
        event.preventDefault()
        navigation.goBack()
      }
      // Command/Control + ] = Forward
      if ((event.metaKey || event.ctrlKey) && event.key === ']') {
        event.preventDefault()
        navigation.goForward()
      }
      // Command/Control + Left Arrow = Back (alternative)
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowLeft') {
        event.preventDefault()
        navigation.goBack()
      }
      // Command/Control + Right Arrow = Forward (alternative)
      if ((event.metaKey || event.ctrlKey) && event.key === 'ArrowRight') {
        event.preventDefault()
        navigation.goForward()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}
