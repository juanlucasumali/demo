import useSWR from 'swr';
import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DatabaseItem } from '@renderer/types/files';
import { buildTree } from '@renderer/utils/buildTree';

interface FileSystemContextValue {
  items: DatabaseItem[];
  currentFolderId: string | null;
  isLoading: boolean;
  error: any;
  navigateToFolder: (folderId: string | null) => void;
  createFolder: (folderName: string) => Promise<void>;
  getFolderContents: (folderId: string | null) => Promise<DatabaseItem[]>;
  uploadFile: (
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting?: boolean
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
const itemsFetcher = async ([_, folderId]: [string, string | null]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  let query = supabase
    .from('items')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (folderId === null) {
    query = query.is('parent_id', null);
  } else {
    query = query.eq('parent_id', folderId);
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

  const { data: items, error, mutate } = useSWR(
    ['items', currentFolderId],
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
      const { data: existingFiles } = await supabase
        .from('items')
        .select('name')
        .eq('owner_id', user.id)
        .eq('name', fileName)
        .eq('parent_id', currentFolderId)
        .single();

      return !!existingFiles;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  async function uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting: boolean = false
  ) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');

    try {
      let finalFileName = file.name;
      if (!replaceExisting) {
        const exists = await checkFileExists(file.name);
        if (exists) {
          throw new Error('File already exists');
        }
      }

      const sanitizedStorageFileName = `${Date.now()}_${file.name}`
        .replace(/[^a-zA-Z0-9._\-\/]/g, '_')
        .replace(/_+/g, '_');

      if (replaceExisting) {
        const { data: existingFile } = await supabase
          .from('items')
          .select('file_path')
          .eq('owner_id', user.id)
          .eq('name', file.name)
          .eq('parent_id', currentFolderId)
          .single();

        if (existingFile) {
          await supabase.storage
            .from('files')
            .remove([existingFile.file_path]);

          await supabase
            .from('items')
            .delete()
            .eq('owner_id', user.id)
            .eq('name', file.name)
            .eq('parent_id', currentFolderId);
        }
      }

      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(sanitizedStorageFileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('items')
        .insert({
          owner_id: user.id,
          name: finalFileName,
          file_path: storageData.path,
          format: file.type,
          type: 'file',
          size: file.size,
          parent_id: currentFolderId
        });

      if (dbError) throw dbError;

      onProgress?.(100);
      await refresh();
    } catch (error) {
      throw error;
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

      const { data, error } = await supabase.storage
        .from('files')
        .download(fileData.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
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
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileData.file_path]);

        if (storageError) throw storageError;
      }

      const { error: dbError } = await supabase
        .from('items')
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      await refresh();
    } catch (error) {
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
    isLoading: !error && !items,
    error,
    navigateToFolder,
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