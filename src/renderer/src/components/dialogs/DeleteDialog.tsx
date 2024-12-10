import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "../ui/alert-dialog";
  
  interface DeleteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    fileCount?: number;
    fileName?: string;
  }
  
  export function DeleteDialog({ 
    isOpen, 
    onClose, 
    onConfirm, 
    fileCount,
    fileName 
  }: DeleteDialogProps) {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {fileCount === 1 || !fileCount ? (
                <>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-semibold">{fileName}</span> from our servers.
                </>
              ) : (
                <>
                  This action cannot be undone. This will permanently delete{" "}
                  <span className="font-semibold">{fileCount} files</span> from our servers.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={onConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }