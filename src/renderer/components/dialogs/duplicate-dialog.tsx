"use client";

import * as React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { File } from "lucide-react";

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void
  setMainFile?: React.Dispatch<React.SetStateAction<boolean>>;
  mainFile?: boolean;
}

export function DuplicateDialog({ open = true, onOpenChange }: DuplicateDialogProps) {
  // TODO: Implement success message (possibly undo button?)
  
  const [selectedFile, setSelectedFile] = React.useState<string>('file1.mp3');

  const handleSelect = (type) => {
    setSelectedFile(type);
  };

  const handleAction = (action: 'keep' | 'delete') => {
    console.log(`${action} file: ${selectedFile}`);
    onOpenChange(false);
  };

  const filenames = ["file1.mp3", "file2.mp3", "file3.mp3", "file4.mp3", "file5.mp3",] as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="mb-4">
            <DialogTitle className="text-base font-large">We found duplicate files</DialogTitle>
        </DialogHeader>

        <div className="flex gap-x-4 gap-y-4 justify-center pb-2 flex-wrap px-0">
            {filenames.map((file) => (
            <Button
                key={file}
                type="button"
                variant="outline"
                className={`aspect-square w-[calc(25%-0.75rem)] min-w-[100px] h-20 flex flex-col ${
                selectedFile === file ? "border-primary" : "border-2"
                }`}
                onClick={() => handleSelect(file)}
            >
                <File className="!h-5 !w-5" />
                {file.charAt(0).toUpperCase() + file.slice(1)}
            </Button>
            ))}
        </div>
            
        <div>
            <DialogDescription>What would you like to do?</DialogDescription>
            <div className="flex gap-2 mt-6">
            <Button className="mr-2" onClick={() => handleAction('keep')}>Keep</Button>
            <Button onClick={() => handleAction('delete')}>Delete</Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
