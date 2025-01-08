import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Loader2 } from "lucide-react"
import { useToast } from "@renderer/hooks/use-toast"
import { UseMutateFunction } from "@tanstack/react-query"
import { DemoItem } from "@renderer/types/items"
import { useState } from "react"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: DemoItem
  handleDialogClose: (value: boolean) => void,
  deleteItem: UseMutateFunction<void, Error, string, unknown>
  isLoading: boolean
}

export function DeleteDialog({ open, onOpenChange, item, handleDialogClose, deleteItem, isLoading }: DeleteDialogProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      toast({
        title: "Deleting...",
        description: "Your item is being deleted",
        variant: "default",
      })

      await deleteItem(item.id)
      
      setIsDeleting(false)
      onOpenChange(false)
      handleDialogClose(false)
      
      toast({
        title: "Success!",
        description: "Item was successfully deleted.",
        variant: "default"
      })
    } catch (error) {
      setIsDeleting(false)
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(value) => {
      if (!isDeleting) {
        onOpenChange(value)
        handleDialogClose(value)
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete
            "{item.name}" from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={`bg-red-500 text-primary hover:bg-red-500 ${
              isDeleting || isLoading ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isDeleting || isLoading}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
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