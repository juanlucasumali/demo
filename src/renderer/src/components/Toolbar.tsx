import React, { useRef, useState } from 'react';
import { Button } from "./ui/button";
import { ConversionDialog } from './ConversionDialog';
import { Folder, FolderPlus, Upload } from 'lucide-react';
import { audioFormats } from '@renderer/lib/files';
import { CreateFolderDialog } from './dialogs/CreateFolderDialog';


interface ToolbarProps {
  onFilesSelected: (files: FileList) => void;
  onFilterChange?: (value: string) => void;
  onCreateFolder: (folderName: string) => void;
}

// Create accept string for file input
const acceptedFormats = audioFormats
  .filter(format => format.value !== "all")
  .map(format => `.${format.value}`)
  .join(",");


const Toolbar: React.FC<ToolbarProps> = ({ 
  onFilesSelected,
  onCreateFolder,
}) => {
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-3.5">
        <Folder className="h-6 w-6" />
        <h1 className="text-2xl font-bold">My Files</h1>
      </div>
      {/* Right side */}
      <div className="flex items-center space-x-2">
        <div className="flex space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="default" onClick={handleUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
          <Button 
            variant="default" 
            onClick={() => setCreateFolderDialogOpen(true)}
          >
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Folder
          </Button>
          <ConversionDialog />
        </div>
      </div>
      <CreateFolderDialog
        isOpen={createFolderDialogOpen}
        onClose={() => setCreateFolderDialogOpen(false)}
        onConfirm={(folderName) => {
          onCreateFolder(folderName);
          setCreateFolderDialogOpen(false);
        }}
      />
    </div>
  );
};

export default Toolbar;
