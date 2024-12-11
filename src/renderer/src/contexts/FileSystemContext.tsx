import useSWR from 'swr';
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DatabaseItem } from '@renderer/types/files';
import { buildTree } from '@renderer/utils/buildTree';

interface FileSystemContextValue {
  items: DatabaseItem[];
  currentFolderId: string | null;
  filterFormat: string;
  isLoading: boolean;
  error: any;
  navigateToFolder: (folderId: string | null) => void;
  setFilterFormat: (format: string) => void;
  createFolder: (folderName: string) => Promise<void>;
  getFolderContents: (folderId: string | null) => Promise<DatabaseItem[]>;
  uploadFile: (
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting?: boolean,
    newFileName?: string
  ) => Promise<void>;
  checkFileExists: (fileName: string) => Promise<boolean>;
  downloadFile: (file: DatabaseItem) => Promise<void>;
  deleteFile: (file: DatabaseItem) => Promise<void>;
  createLocalFolderStructure: (basePath: string) => Promise<void>;
  refresh: () => Promise<any>;
}

// Create context
const FileSystemContext = createContext<FileSystemContextValue | undefined>(undefined);

// Fetcher function for SWR
const itemsFetcher = async ([_, folderId, filterFormat]: [string, string | null, string]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  let query = supabase
    .from('items')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Add folder filter
  if (folderId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', folderId);
  }

  // Add format filter if specified
  if (filterFormat && filterFormat !== 'all') {
    const mimeTypes = filterFormat.split(',');
    query = query.in('format', mimeTypes);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(item => ({
    id: item.id,
    name: item.name,
    format: item.format,
    type: item.type,
    dateUploaded: item.created_at,
    size: item.size || 0,
    parentId: item.parent_id,
    filePath: item.file_path || null
  }));
};

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<string>('');

  const { data: items, error, mutate } = useSWR(
    ['items', currentFolderId, filterFormat],
    itemsFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
  );

  function navigateToFolder(folderId: string | null) {
    setCurrentFolderId(folderId);
  }

  async function createFolder(folderName: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('items')
      .insert({
        name: folderName,
        type: 'folder',
        owner_id: user.id,
        parent_id: currentFolderId
      });

    if (error) throw error;
    await mutate(); // Refresh the data
  }

  async function getFolderContents(folderId: string | null): Promise<DatabaseItem[]> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');
  
    let query = supabase
      .from('items')
      .select('*')
      .eq('owner_id', user.id)
      .eq('type', 'folder')
      .order('created_at', { ascending: false });

    if (folderId === null) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', folderId);
    }
  
    const { data, error } = await query;
    if (error) throw error;
  
    const mapped = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      format: item.format,
      type: item.type,
      dateUploaded: item.created_at,
      size: item.size || 0,
      parentId: item.parent_id,
      filePath: item.file_path || null
    }));
  
    return mapped;
  }  

  async function checkFileExists(fileName: string): Promise<boolean> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;
  
    try {
      let query = supabase
        .from('items')
        .select('name')
        .eq('owner_id', user.id)
        .eq('name', fileName);
  
      // Only add parent_id condition if it's not null
      if (currentFolderId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', currentFolderId);
      }
  
      const { data, error } = await query;
  
      if (error) {
        console.error('Error checking file existence:', error);
        return false;
      }
  
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }
  
  async function uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting: boolean = false,
    newFileName?: string
  ) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');
  
    try {
      let finalFileName = newFileName ?? file.name;
      
      // Check if file exists only if not replacing
      if (!replaceExisting) {
        const exists = await checkFileExists(finalFileName);
        if (exists) {
          throw new Error('File already exists');
        }
      }
  
      // Create a more sanitized file name for B2
      const timestamp = Date.now();
      const sanitizedFileName = finalFileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_');
      
      const b2FileName = `${user.id}/${timestamp}_${sanitizedFileName}`;
  
      if (replaceExisting) {
        let query = supabase
          .from('items')
          .select('file_path')
          .eq('owner_id', user.id)
          .eq('name', finalFileName);
  
        // Handle parent_id condition
        if (currentFolderId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', currentFolderId);
        }
  
        const { data: existingFile, error } = await query;
  
        if (error) {
          console.error('Error checking existing file:', error);
        } else if (existingFile && existingFile[0]) {
          try {
            // Delete existing file from B2
            await window.b2.deleteFile(existingFile[0].file_path);
          } catch (error) {
            console.warn('Error deleting existing file from B2:', error);
            // Continue with upload even if delete fails
          }
  
          // Delete from database
          let deleteQuery = supabase
            .from('items')
            .delete()
            .eq('owner_id', user.id)
            .eq('name', finalFileName);
  
          // Handle parent_id condition for delete
          if (currentFolderId === null) {
            deleteQuery = deleteQuery.is('parent_id', null);
          } else {
            deleteQuery = deleteQuery.eq('parent_id', currentFolderId);
          }
  
          await deleteQuery;
        }
      }
  
      // Convert File to ArrayBuffer
      const buffer = await file.arrayBuffer();
  
      // Upload to B2
      console.log('Uploading to B2:', { fileName: b2FileName, size: buffer.byteLength });
      const uploadData = await window.b2.uploadFile(b2FileName, buffer);
      console.log('B2 upload response:', uploadData);
  
      // Prepare database insert
      const insertData = {
        owner_id: user.id,
        name: finalFileName,
        file_path: uploadData.fileName,
        format: file.type,
        type: 'file',
        size: file.size,
        parent_id: currentFolderId
      };
  
      // Save to database
      const { error: dbError } = await supabase
        .from('items')
        .insert([insertData]);
  
      if (dbError) {
        console.error('Database error:', dbError);
        // Try to clean up the uploaded file if database insert fails
        try {
          await window.b2.deleteFile(uploadData.file_path);
        } catch (cleanupError) {
          console.error('Error cleaning up B2 file after failed database insert:', cleanupError);
        }
        throw dbError;
      }
  
      onProgress?.(100);
      await refresh();
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof Error) {
        throw new Error(`Upload failed: ${error.message}`);
      } else {
        throw new Error('Upload failed with unknown error');
      }
    }
  }
  
    async function downloadFile(file: DatabaseItem) {
      try {
        const { data: fileData } = await supabase
          .from('items')
          .select('file_path')
          .eq('id', file.id)
          .single();

        if (!fileData) throw new Error('File not found');

        const data = await window.b2.downloadFile(fileData.file_path);
        
        const blob = new Blob([data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (error) {
        console.log("error:", error)
        throw error;
      }
    }

    async function deleteFile(file: DatabaseItem) {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('No user found');
    
      try {
        const { data: fileData } = await supabase
          .from('items')
          .select('file_path')
          .eq('id', file.id)
          .single();
    
        if (!fileData) throw new Error('File not found');
    
        if (fileData.file_path) {
          try {
            console.log('Attempting to delete file from B2:', fileData.file_path);
            await window.b2.deleteFile(fileData.file_path);
            console.log('Successfully deleted file from B2');
          } catch (error) {
            console.error('Error deleting file from B2:', error);
            // If the file doesn't exist in B2, we'll still continue to delete the database record
            if (!(error instanceof Error && error.message.includes('not found'))) {
              throw error;
            }
          }
        }
    
        // Delete from database
        const { error: dbError } = await supabase
          .from('items')
          .delete()
          .eq('id', file.id);
    
        if (dbError) throw dbError;
    
        await refresh();
      } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
      }
    }

  const createLocalFolderStructure = async (basePath: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');
  
    try {
      // Get ALL folders for the user
      const { data: allFolders, error } = await supabase
        .from('items')
        .select('*')
        .eq('owner_id', user.id)
        .eq('type', 'folder');
  
      if (error) throw error;
      if (!allFolders) return;
  
      // Convert to Items and build tree structure
      const folderItems = allFolders.map((folder): DatabaseItem => ({
        id: folder.id,
        name: folder.name,
        format: '',
        type: 'folder',
        dateUploaded: folder.created_at,
        size: 0,
        parentId: folder.parent_id,
        filePath: null
      }));
  
      const folderTree = buildTree(folderItems);
  
      if (!window.electron?.createFolderStructure) {
        throw new Error('createFolderStructure is not available');
      }
  
      const result = await window.electron.createFolderStructure(
        basePath,
        folderTree
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create folder structure');
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        throw {
          message: (error as any).message || 'Unknown error occurred',
          details: error,
        };
      }
      throw error;
    }
  };
  
  const refresh = () => mutate();

  const value: FileSystemContextValue = {
    items: items || [],
    currentFolderId,
    filterFormat,
    isLoading: !error && !items,
    error,
    navigateToFolder,
    setFilterFormat, // Add this
    createFolder,
    getFolderContents,
    uploadFile,
    checkFileExists,
    downloadFile,
    deleteFile,
    createLocalFolderStructure,
    refresh: () => mutate()
  };


  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}