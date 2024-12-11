import { FC, useState, useEffect } from 'react'
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { useUser } from '@renderer/hooks/useUser'
import { Loader2, Upload } from "lucide-react"
import { UploadProgress } from "@renderer/components/custom-ui/UploadProgress"
import { FileExistsDialog } from "@renderer/components/dialogs/FileExistsDialog"
import { ErrorDialog } from "@renderer/components/dialogs/ErrorDialog"
import { useToast } from "@renderer/hooks/use-toast"
import { UploadStatus } from '../../../pages/dashboard/FileExplorer'
import { useFileSystem } from '@renderer/contexts/FileSystemContext'

interface LocalFolderSyncProps {
  mode: 'selective' | 'full'
}

interface LocalFile {
  path: string
  name: string
  size: number
  selected?: boolean
  children?: LocalFile[]
  type: 'file' | 'folder'
}

export const LocalFolderSync: FC<LocalFolderSyncProps> = ({ mode }) => {
  const { user } = useUser();
  const { uploadFile, checkFileExists, refresh } = useFileSystem();
  const { toast } = useToast();
  
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: UploadStatus;
  }>({});
  const [fileExistsDialog, setFileExistsDialog] = useState<{
    show: boolean;
    fileName: string;
    file?: File;
  }>({ show: false, fileName: '' });
  const [errorDialog, setErrorDialog] = useState<{
    show: boolean;
    fileName: string;
    error: Error | string;
  }>({ show: false, fileName: '', error: '' });

  useEffect(() => {
    if (user?.local_path) {
      scanLocalFiles();
    }
  }, [user?.local_path]);

  const scanLocalFiles = async () => {
    if (!window.electron?.scanDirectory) return;
    
    setIsLoading(true);
    try {
      const files = await window.electron.scanDirectory(user!.local_path!);
      setLocalFiles(files);
    } catch (error) {
      console.error('Error scanning directory:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to scan directory"
      });
    }
    setIsLoading(false);
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
    } catch (error) {
      console.error("Upload error:", error);
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: { 
          ...prev[file.name], 
          progress: -1,
          error: typeof error === 'object' && error !== null
            ? (error as any).message || JSON.stringify(error)
            : 'Unknown error occurred'
        }
      }));
    }
  };

  const handleFileUpload = async (localFile: LocalFile) => {
    try {
      const fileBuffer = await window.electron.readFile(localFile.path);
      const file = new File([fileBuffer], localFile.name);
      
      const exists = await checkFileExists(file.name);
      
      if (exists) {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { progress: -2, conflict: true, file }
        }));
      } else {
        handleUpload(file);
      }
    } catch (error) {
      console.error(`Error preparing ${localFile.name} for upload:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to prepare ${localFile.name} for upload`
      });
    }
  };

  const syncFiles = async () => {
    const filesToSync = mode === 'full' 
      ? getAllFiles(localFiles)
      : getSelectedFiles(localFiles);

    for (const file of filesToSync) {
      await handleFileUpload(file);
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

  const dismissAllUploads = () => {
    setUploadProgress({});
  };

  // Add these helper functions
  const getAllFiles = (files: LocalFile[]): LocalFile[] => {
    let allFiles: LocalFile[] = [];
    
    files.forEach(file => {
      if (file.type === 'file') {
        allFiles.push(file);
      }
      if (file.children) {
        allFiles = allFiles.concat(getAllFiles(file.children));
      }
    });
    
    return allFiles;
  };

  const getSelectedFiles = (files: LocalFile[]): LocalFile[] => {
    let selectedFiles: LocalFile[] = [];
    
    files.forEach(file => {
      if (file.type === 'file' && file.selected) {
        selectedFiles.push(file);
      }
      if (file.children) {
        selectedFiles = selectedFiles.concat(getSelectedFiles(file.children));
      }
    });
    
    return selectedFiles;
  };

  const handleToggleSelect = (filePath: string) => {
    setLocalFiles(prev => {
      const toggleFile = (files: LocalFile[]): LocalFile[] => {
        return files.map(file => {
          if (file.path === filePath) {
            return { ...file, selected: !file.selected };
          }
          if (file.children) {
            return {
              ...file,
              children: toggleFile(file.children)
            };
          }
          return file;
        });
      };
      return toggleFile(prev);
    })
  };

  const renderFileTree = (files: LocalFile[], level = 0) => {
    return files.map((file) => (
      <div key={file.path} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2 py-1">
          {mode === 'selective' && file.type === 'file' && (
            <Checkbox
              checked={file.selected}
              onCheckedChange={() => handleToggleSelect(file.path)}
            />
          )}
          <span>{file.name}</span>
        </div>
        {file.children && renderFileTree(file.children, level + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="ml-2">Scanning files...</span>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="max-h-[400px] overflow-auto border rounded-lg p-4">
              {renderFileTree(localFiles)}
            </div>

            <Button
              onClick={syncFiles}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {`Sync ${mode === 'full' ? 'All' : 'Selected'} Files`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <UploadProgress 
        uploads={uploadProgress}
        onDismiss={dismissUpload}
        onResolveConflict={handleResolveConflict}
        onShowError={(fileName, error) => 
          setErrorDialog({ show: true, fileName, error })}
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
    </>
  );
};