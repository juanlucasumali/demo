import { useRouter } from '@tanstack/react-router'
import { Button } from './ui/button'
import { navigation } from '../services/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function NavigationControls() {
  const router = useRouter()
  const canGoBack = router.history.length > 1
//   const currentPath = navigation.getCurrentPath()

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-background/80 p-2 rounded-lg backdrop-blur">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigation.goBack()}
        disabled={!canGoBack}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigation.goForward()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* <div className="px-2 flex items-center text-sm text-muted-foreground">
        Current: {currentPath}
      </div> */}

      {/* Test navigation buttons */}
      {/* <Button
        variant="outline"
        size="sm"
        onClick={() => navigation.navigate('/dashboard')}
      >
        Dashboard
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigation.navigate('/settings')}
      >
        Settings
      </Button> */}
    </div>
  )
}
