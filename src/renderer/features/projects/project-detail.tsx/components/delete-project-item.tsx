import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/renderer/components/ui/dialog"
  import { Button } from "@/renderer/components/ui/button"
  import { useState } from "react"
  import { useProjectItemsStore } from '@/renderer/stores/useProjectItemsStore'
  import { useToast } from "@/renderer/hooks/use-toast"
  import { IconFolder, IconFile, IconAlertTriangle, IconLoader2, IconTrash } from "@tabler/icons-react"
import { ProjectItem } from "@/renderer/components/layout/types"
  
  interface DeleteProjectItemDialogProps {
    item: ProjectItem
    isOpen: boolean
    onClose: () => void
  }
  
  export function DeleteProjectItemDialog({ 
    item, 
    isOpen, 
    onClose 
  }: DeleteProjectItemDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const deleteItem = useProjectItemsStore((state) => state.deleteItem)
    const { toast } = useToast()
  
    const handleDelete = async () => {
      try {
        setIsDeleting(true)
        await deleteItem(item.id)
        
        toast({
          title: "Success",
          description: `${item.type === 'folder' ? 'Folder' : 'File'} deleted successfully`,
        })
        
        onClose()
      } catch (error) {
        console.error('Error deleting item:', error)
        toast({
          title: "Error",
          description: `Failed to delete ${item.type === 'folder' ? 'folder' : 'file'}`,
          variant: "destructive"
        })
      } finally {
        setIsDeleting(false)
      }
    }
  
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="h-5 w-5" />
              Delete {item.type === 'folder' ? 'Folder' : 'File'}
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <div className="flex items-center gap-2 pt-2">
                {item.type === 'folder' ? (
                  <IconFolder className="h-5 w-5" />
                ) : (
                  <IconFile className="h-5 w-5" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
              
              {item.type === 'folder' ? (
                <p className="">
                  This will permanently delete this folder and all its contents. 
                  This action cannot be undone.
                </p>
              ) : (
                <p className="text-destructive">
                  This will permanently delete this file. 
                  This action cannot be undone.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
  
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <IconTrash className="h-4 w-4" />
                  Delete {item.type === 'folder' ? 'Folder' : 'File'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }
  