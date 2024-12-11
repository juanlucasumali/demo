import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input"; // Make sure you have this component
import { useFileSystem } from '@renderer/contexts/FileSystemContext';

interface FileExistsDialogProps {
  isOpen: boolean;
  fileName: string;
  onReplace: () => void;
  onKeepBoth: (newFileName: string) => void;
  onCancel: () => void;
}

export const FileExistsDialog: React.FC<FileExistsDialogProps> = ({
  isOpen,
  fileName,
  onReplace,
  onKeepBoth,
  onCancel,
}) => {
  const [showNameInput, setShowNameInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { checkFileExists } = useFileSystem();

  useEffect(() => {
    if (isOpen && !showNameInput) {
      setNewFileName(fileName);
    }
  }, [isOpen, fileName]);

  const handleKeepBothClick = () => {
    setShowNameInput(true);
  };

  const handleSubmitNewName = async () => {
    if (!newFileName.trim()) {
      setError('File name cannot be empty');
      return;
    }

    const exists = await checkFileExists(newFileName);
    if (exists) {
      setError('A file with this name already exists');
      return;
    }

    setError(null);
    onKeepBoth(newFileName);
    setShowNameInput(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>File already exists</AlertDialogTitle>
          <AlertDialogDescription>
            A file named "{fileName}" already exists in this location. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showNameInput ? (
          <div className="space-y-4">
            <Input
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter new file name"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowNameInput(false)}>
                Back
              </Button>
              <Button onClick={handleSubmitNewName}>
                Save
              </Button>
            </AlertDialogFooter>
          </div>
        ) : (
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleKeepBothClick}>
              Keep both files
            </Button>
            <Button variant="destructive" onClick={onReplace}>
              Replace existing file
            </Button>
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};
