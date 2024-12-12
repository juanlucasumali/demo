// src/renderer/hooks/use-navigation-shortcuts.ts
import { useEffect } from 'react'
import { navigation } from '../services/navigation'

export function useNavigationShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
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
