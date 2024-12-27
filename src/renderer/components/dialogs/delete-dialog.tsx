import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@renderer/components/ui/alert-dialog"
import { Loader2, Trash } from "lucide-react"
import { DropdownMenuItem } from "../ui/dropdown-menu"

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => Promise<void>
  isDeleting: boolean
}

export function DeleteDialog({ open, onOpenChange, onDelete, isDeleting }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-500"
        >
          <Trash /> Delete
        </DropdownMenuItem>
      </AlertDialogTrigger>
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
              isDeleting ? "cursor-not-allowed opacity-50" : ""
            }`}
            disabled={isDeleting}
            onClick={onDelete}
          >
            {isDeleting ? (
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