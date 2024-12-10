import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { DatabaseItem, DemoItem, FileTreeItem } from '../types/files'; // Import the FileItem type
import { getNextFileName, sanitizeFileName } from '@renderer/lib/files';
import { buildTree } from '@renderer/utils/buildTree';
import { useState } from 'react';

interface UseItemsReturn {
  items: DemoItem[];
  files: DemoItem[];
  folders: FileTreeItem[];
  currentFolderId: string | null;
  navigateToFolder: (folderId: string | null) => void
  isLoading: boolean;
  error: any;
  uploadFile: (
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting?: boolean
  ) => Promise<void>;
  checkFileExists: (fileName: string) => Promise<boolean>;
  downloadFile: (file: DemoItem) => Promise<void>;
  deleteFile: (file: DemoItem) => Promise<void>;
  createFolder: (folderName: string) => Promise<boolean>;
  createLocalFolderStructure: (basePath: string) => Promise<void>;
  mutate: () => Promise<void | DemoItem[] | undefined>;
}

const itemsFetcher = async ([_, filterFormat, folderId]: [string, string, string | null]) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  let query = supabase
    .from('items')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  // Add folder filter
  if (folderId === null) {
    query = query.is('parent_id', null); // Root folder
  } else {
    query = query.eq('parent_id', folderId);
  }

  // Add format filter if we're filtering files
  if (filterFormat && filterFormat !== 'all') {
    const mimeTypes = filterFormat.split(',');
    query = query.in('format', mimeTypes);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  return data.map((item: DatabaseItem): DemoItem => ({
    id: item.id,
    name: item.name,
    format: item.format,
    type: item.type, // 'file' or 'folder'
    dateUploaded: item.created_at,
    size: item.size || 0,
    parentId: item.parent_id
  }));
};

export function useItems(filterFormat: string = ''): UseItemsReturn {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const { data: items, error, mutate } = useSWR(
    ['items', filterFormat, currentFolderId],
    itemsFetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      dedupingInterval: 5000,
    }
  );

  // Separate files and folders from items
  const files = items?.filter(item => item.type === 'file') || [];
  const folders = items?.filter(item => item.type === 'folder') || [];

  // Add navigation function
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const checkFileExists = async (fileName: string): Promise<boolean> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    try {
      const { data: existingFiles } = await supabase
      .from('items')
      .select('name')
      .eq('owner_id', user.id)
      .eq('name', fileName)
      .single();

      return !!existingFiles;
    } catch (error) {
      // Convert the Supabase error object to a more useful format
      if (typeof error === 'object' && error !== null) {
        throw {
          message: (error as any).message || 'Unknown error occurred',
          details: error,
        };
      }
      throw error;
    }
  }

  const uploadFile = async (
    file: File, 
    onProgress?: (progress: number) => void,
    replaceExisting: boolean = false
  ) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
  
    try {
      // Simulate upload progress
      const chunkSize = 1024 * 1024; // 1MB chunks
      const totalChunks = Math.ceil(file.size / chunkSize);
      let uploadedChunks = 0;
  
      const reportProgress = () => {
        uploadedChunks++;
        const progress = Math.min((uploadedChunks / totalChunks) * 100, 99);
        onProgress?.(progress);
      };
  
      let finalFileName = file.name;
      if (!replaceExisting) {
        const { data: existingFiles } = await supabase
          .from('items')
          .select('name')
          .eq('owner_id', user.id);
  
        const existingFileItems = (existingFiles || []).map(f => ({ 
          name: f.name,
          id: '',
          format: '',
          type: '',
          dateUploaded: '',
          parentId: '',
          size: 0
        }));
  
        finalFileName = getNextFileName(file.name, existingFileItems);
      }
  
      // Sanitize the filename for storage
      const sanitizedStorageFileName = sanitizeFileName(finalFileName);
      const uniqueStorageKey = `${Date.now()}_${sanitizedStorageFileName}`
        .replace(/[^a-zA-Z0-9._\-\/]/g, '_') // Only allow alphanumeric, dots, underscores, hyphens, and forward slashes
        .replace(/_+/g, '_'); // Replace multiple consecutive underscores with a single one
  
      // If replacing, delete the existing file first
      if (replaceExisting) {
        const { data: existingFile } = await supabase
          .from('items')
          .select('file_path')
          .eq('owner_id', user.id)
          .eq('name', file.name)
          .single();
  
        if (existingFile) {
          await supabase.storage
            .from('files')
            .remove([existingFile.file_path]);
  
          await supabase
            .from('items')
            .delete()
            .eq('owner_id', user.id)
            .eq('name', file.name);
        }
      }
  
      const options = {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: reportProgress,
      };
  
      // Upload with unique storage key
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(uniqueStorageKey, file, options);
  
      if (storageError) throw storageError;
  
      // Store in database with original filename but unique storage path
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
      await mutate();
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        throw {
          message: (error as any).message || 'Unknown error occurred',
          details: error,
        };
      }
      throw error;
    }
  }

  const downloadFile = async (file: DemoItem) => {
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
      a.download = file.name; // Use original filename for download
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (typeof error === 'object' && error !== null) {
        throw {
          message: (error as any).message || 'Unknown error occurred',
          details: error,
        };
      }
      throw error;
    }
  }

    const deleteFile = async (file: DemoItem) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      try {
        // Get the file path from the database
        const { data: fileData } = await supabase
          .from('items')
          .select('file_path')
          .eq('id', file.id)
          .single();

        if (!fileData) throw new Error('File not found');

        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([fileData.file_path]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
          .from('items')
          .delete()
          .eq('id', file.id);

        if (dbError) throw dbError;

        await mutate(); // Refresh the data
      } catch (error) {
      // Convert the Supabase error object to a more useful format
      if (typeof error === 'object' && error !== null) {
        throw {
          message: (error as any).message || 'Unknown error occurred',
          details: error,
        };
      }
      throw error;
    }
  }

  const createFolder = async (folderName: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');

    try {
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
      return true;
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
      const folderItems = allFolders.map((folder): DemoItem => ({
        id: folder.id,
        name: folder.name,
        format: '',
        type: 'folder',
        dateUploaded: folder.created_at,
        size: 0,
        parentId: folder.parent_id
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

  return {
    items: items || [], // All items (files and folders)
    files: files || [], // Just files
    folders: buildTree(items?.filter(item => item.type === 'folder') || []), // Folders in tree structure
    currentFolderId,
    navigateToFolder,
    isLoading: !error && !items,
    error,
    uploadFile,
    checkFileExists,
    downloadFile,
    deleteFile,
    createFolder,
    createLocalFolderStructure,
    mutate
  };
}