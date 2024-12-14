import { Dialog } from '@/renderer/components/ui/dialog'
import { navigation, useNavigationStore } from '@/renderer/stores/useNavigationStore'
import { useState } from 'react'
import { Button } from './ui/button'

export function NavigationBlockerDialog() {
  const { unblockNavigation } = useNavigationStore()
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const handleConfirm = () => {
    if (pendingNavigation) {
      unblockNavigation()
      navigation.navigate(pendingNavigation)
      setPendingNavigation(null)
    }
  }

  return (
    <Dialog 
      open={Boolean(pendingNavigation)} 
      onOpenChange={() => setPendingNavigation(null)}
    >
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2">Unsaved Changes</h2>
        <p className="mb-4">
          You have unsaved changes. Are you sure you want to leave?
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPendingNavigation(null)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
          >
            Leave anyway
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
