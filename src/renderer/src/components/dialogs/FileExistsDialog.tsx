import React from 'react';
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
import { Button } from "../ui/button";

interface FileExistsDialogProps {
  isOpen: boolean;
  fileName: string;
  onReplace: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export const FileExistsDialog: React.FC<FileExistsDialogProps> = ({
  isOpen,
  fileName,
  onReplace,
  onKeepBoth,
  onCancel,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>File already exists</AlertDialogTitle>
          <AlertDialogDescription>
            A file named "{fileName}" already exists. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={onKeepBoth}>
            Keep both files
          </Button>
          <AlertDialogAction onClick={onReplace}>
            Replace existing file
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
