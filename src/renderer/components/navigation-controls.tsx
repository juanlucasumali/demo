import { useRouter } from '@tanstack/react-router'
import { Button } from './ui/button'
import { useNavigationStore } from '../stores/useNavigationStore'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function NavigationControls() {
  const router = useRouter()
  const { goBack, goForward } = useNavigationStore()
  const canGoBack = router.history.length > 1

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-background/80 p-2 rounded-lg backdrop-blur">
      <Button
        variant="outline"
        size="sm"
        onClick={goBack}
        disabled={!canGoBack}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goForward}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
