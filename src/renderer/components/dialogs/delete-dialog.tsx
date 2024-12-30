import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@renderer/hooks/use-toast"
import { UseMutateFunction } from "@tanstack/react-query"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemId: string
  handleDialogClose: (value: boolean) => void,
  removeItem: UseMutateFunction<void, Error, string, unknown>
  isLoading: boolean
}

export function DeleteDialog({ open, onOpenChange, itemId, handleDialogClose, removeItem, isLoading }: DeleteDialogProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      await removeItem(itemId)
      onOpenChange(false)
      handleDialogClose(false)
      toast({
        title: "Success!",
        description: "Item was successfully deleted.",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(value) => {
      onOpenChange(value)
      handleDialogClose(value)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            the selected item from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`bg-red-500 text-primary hover:bg-red-500 ${
              isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isLoading}
            onClick={handleDelete}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4" /> Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}