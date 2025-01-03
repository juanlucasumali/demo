import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@renderer/hooks/use-toast"
import { UseMutateFunction } from "@tanstack/react-query"
import { DemoItem } from "@renderer/types/items"

interface RemoveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: DemoItem
  handleDialogClose: (value: boolean) => void
  deleteItem: UseMutateFunction<void, Error, string, unknown>
  isLoading: boolean
  location?: 'folder' | 'project' | 'collection'
}

export function RemoveDialog({ 
  open, 
  onOpenChange, 
  item, 
  handleDialogClose, 
  deleteItem, 
  isLoading,
  location = 'folder'
}: RemoveDialogProps) {
  const { toast } = useToast()

  const handleRemove = async () => {
    try {
      await deleteItem(item.id)
      onOpenChange(false)
      handleDialogClose(false)
      toast({
        title: "Success!",
        description: `Item was successfully removed from ${location}.`,
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to remove item from ${location}. Please try again.`,
        variant: "destructive"
      })
    }
  }

  const getLocationText = () => {
    switch (location) {
      case 'folder':
        return 'folder';
      case 'project':
        return 'project';
      case 'collection':
        return 'collection';
      default:
        return 'location';
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(value) => {
      onOpenChange(value)
      handleDialogClose(value)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from {getLocationText()}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove "{item.name}" from this {getLocationText()}. The item will still be available in {location === 'collection' ? 'your project' : 'your library'}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`bg-orange-500 text-primary hover:bg-orange-600 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isLoading}
            onClick={handleRemove}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Removing...
              </span>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
