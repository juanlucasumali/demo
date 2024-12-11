import React, { useState } from "react";
import Toolbar from "../../components/Toolbar";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { DataTable } from "./DataTable";
import { createColumns } from "./Columns";
import { FileExistsDialog } from "@renderer/components/dialogs/FileExistsDialog";
import { UploadProgress } from "@renderer/components/custom-ui/UploadProgress";
import { ErrorDialog } from "@renderer/components/dialogs/ErrorDialog";
import { DatabaseItem } from "@renderer/types/files";
import { DeleteDialog } from "@renderer/components/dialogs/DeleteDialog";
import { useToast } from "@renderer/hooks/use-toast";
import { useFileSystem } from "@renderer/contexts/FileSystemContext";

export type UploadStatus = {
  progress: number;
  conflict?: boolean;
  file?: File;
  error?: Error | string;
};

const FileExplorer: React.FC = () => {
  const {
    items,
    isLoading,
    error,
    uploadFile,
    checkFileExists,
    deleteFile,
    createFolder,
    refresh
  } = useFileSystem();

  const [filterFormat, setFilterFormat] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: UploadStatus}>({});
  const [fileExistsDialog, setFileExistsDialog] = useState<{ show: boolean; fileName: string; file?: File; }>({ show: false, fileName: '' });
  const [errorDialog, setErrorDialog] = useState<{ show: boolean; fileName: string; error: Error | string; }>({ show: false, fileName: '', error: '' });
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean; files: DatabaseItem[];}>({ isOpen: false, files: [] });

  const { toast } = useToast();

  const dismissAllUploads = () => {
    setUploadProgress({});
  };

  const handleUpload = async (file: File, replace: boolean = false) => {
    setUploadProgress((prev) => ({
      ...prev,
      [file.name]: { progress: 0 }
    }));
  
    try {
      await uploadFile(
        file,
        (progress) => {
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { ...prev[file.name], progress }
          }));
        },
        replace
      );
      await refresh();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: { 
          ...prev[file.name], 
          progress: -1,
          error: typeof err === 'object' && err !== null
            ? (err as any).message || JSON.stringify(err)
            : 'Unknown error occurred'
        }
      }));
    }
  };

  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      const exists = await checkFileExists(file.name);
      
      if (exists) {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { progress: -2, conflict: true, file }
        }));
      } else {
        handleUpload(file);
      }
    }
  };

  const handleResolveConflict = (fileName: string) => {
    const fileData = uploadProgress[fileName];
    if (fileData?.file) {
      setFileExistsDialog({ 
        show: true, 
        fileName,
        file: fileData.file 
      });
    }
  };

  const handleReplace = () => {
    if (fileExistsDialog.file) {
      handleUpload(fileExistsDialog.file, true);
    }
    setFileExistsDialog({ show: false, fileName: '' });
  };

  const handleKeepBoth = () => {
    if (fileExistsDialog.file) {
      handleUpload(fileExistsDialog.file, false);
    }
    setFileExistsDialog({ show: false, fileName: '' });
  };

  const dismissUpload = (fileName: string) => {
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const handleDeleteSelected = (selectedRows: DatabaseItem[]) => {
    setDeleteDialog({
      isOpen: true,
      files: selectedRows,
    });
  };

  const handleConfirmDelete = async () => {
    toast({
      title: deleteDialog.files.length === 1
        ? `Deleting ${deleteDialog.files[0].name}...`
        : `Deleting ${deleteDialog.files.length} files...`,
    });

    try {
      await Promise.all(deleteDialog.files.map(file => deleteFile(file)));
      await refresh();
      setDeleteDialog({ isOpen: false, files: [] });
      
      toast({
        title: deleteDialog.files.length === 1
          ? `${deleteDialog.files[0].name} deleted successfully`
          : `${deleteDialog.files.length} files deleted successfully`,
      });
    } catch (err) {
      console.error('Error deleting files:', err);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: deleteDialog.files.length === 1
          ? `Failed to delete ${deleteDialog.files[0].name}`
          : `Failed to delete ${deleteDialog.files.length} files`,
      });
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder(folderName);
      toast({
        title: "Folder created",
        description: `Folder "${folderName}" created successfully`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create folder",
      });
    }
  };

  if (error)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading files.</AlertDescription>
        </Alert>
      </div>
    );

  if (isLoading)
    return (
      <div className="p-4">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading...</AlertDescription>
        </Alert>
      </div>
    );
  
    return (
      <div className="flex flex-col h-full">
        <Toolbar
          onFilesSelected={handleFilesSelected}
          onFilterChange={setFilterFormat}
          onCreateFolder={handleCreateFolder}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-4">
            <DataTable
              columns={createColumns({ 
                onDelete: handleDeleteSelected 
              })}
              data={items || []}
              onDeleteSelected={handleDeleteSelected}
              onFilterChange={setFilterFormat}
            />
          </div>
        </div>
        
        <DeleteDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, files: [] })}
          onConfirm={handleConfirmDelete}
          fileCount={deleteDialog.files.length}
          fileName={deleteDialog.files[0]?.name}
        />
        
        <UploadProgress 
          uploads={uploadProgress}
          onDismiss={dismissUpload}
          onResolveConflict={handleResolveConflict}
          onShowError={(fileName, err) => 
            setErrorDialog({ show: true, fileName, error: err })}
          onClose={dismissAllUploads}
        />

        <ErrorDialog
          isOpen={errorDialog.show}
          onClose={() => setErrorDialog({ show: false, fileName: '', error: '' })}
          error={errorDialog.error}
          fileName={errorDialog.fileName}
        />
  
        <FileExistsDialog
          isOpen={fileExistsDialog.show}
          fileName={fileExistsDialog.file?.name || ''}
          onReplace={handleReplace}
          onKeepBoth={handleKeepBoth}
          onCancel={() => setFileExistsDialog({ show: false, fileName: '', file: undefined })}
        />
      </div>
    );
};

export default FileExplorer;
