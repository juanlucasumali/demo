import { FC, useState, useEffect } from 'react'
import { Card, CardContent } from "../../ui/card"
import { Button } from "../../ui/button"
import { Checkbox } from "../../ui/checkbox"
import { useUser } from '@renderer/hooks/useUser'
import { useFiles } from '@renderer/hooks/useFiles'
import { Loader2, Upload } from "lucide-react"
import { Progress } from "../../ui/progress"

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
  const { uploadFile } = useFiles();
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    console.log('LocalFolderSync useEffect triggered');
    console.log('Current user:', user);
    console.log('Current local_path:', user?.local_path);
    
    if (user?.local_path) {
      scanLocalFiles();
    }
  }, [user?.local_path]);

  const scanLocalFiles = async () => {
    console.log('Starting scanLocalFiles...');
    console.log('User local path:', user?.local_path);
    
    if (!window.electron?.scanDirectory) {
      console.error('scanDirectory is not available in window.electron');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Calling electron.scanDirectory...');
      const files = await window.electron.scanDirectory(user!.local_path!);
      console.log('Received files from scanDirectory:', files);
      setLocalFiles(files);
    } catch (error) {
      console.error('Error scanning directory:', error);
    }
    setIsLoading(false);
    console.log('scanLocalFiles completed');
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
    });
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

  const syncFiles = async () => {
    setIsSyncing(true);
    setSyncProgress(0);

    const filesToSync = mode === 'full' 
      ? getAllFiles(localFiles)
      : getSelectedFiles(localFiles);

    let completed = 0;
    
    for (const file of filesToSync) {
      try {
        await uploadFile(
          new File([await window.electron.readFile(file.path)], file.name),
          (progress) => {
            setSyncProgress((completed + progress) / filesToSync.length);
          }
        );
        completed++;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }

    setIsSyncing(false);
    setSyncProgress(100);
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
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-auto border rounded-lg p-4">
            {renderFileTree(localFiles)}
          </div>
          
          {isSyncing && (
            <Progress value={syncProgress} className="w-full" />
          )}

          <Button
            onClick={syncFiles}
            disabled={isSyncing}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSyncing ? 'Syncing...' : `Sync ${mode === 'full' ? 'All' : 'Selected'} Files`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
