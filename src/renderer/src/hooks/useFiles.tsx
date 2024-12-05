import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { FileItem } from '../types/files'; // Import the FileItem type
import { getNextFileName, sanitizeFileName } from '@renderer/lib/files';

interface DatabaseFile {
  id: string;
  name: string;
  file_path: string;
  format: string;
  created_at: string;
  size?: number;
  type: 'file' | 'folder'
}

export interface UseFilesReturn {
  data: FileItem[];
  isLoading: boolean;
  error: any;
  uploadFile: (
    file: File,
    onProgress?: (progress: number) => void,
    replaceExisting?: boolean
  ) => Promise<void>;
  checkFileExists: (fileName: string) => Promise<boolean>;
  downloadFile: (file: FileItem) => Promise<void>;
  deleteFile: (file: FileItem) => Promise<void>;
  mutate: () => Promise<void | FileItem[] | undefined>;
  createFolder: (folderName: string) => Promise<boolean>;
}

const fetcher = async (filterFormat: string) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  let query = supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filterFormat && filterFormat !== 'all') {
    const mimeTypes = filterFormat.split(',');
    query = query.in('format', mimeTypes);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Query error:', error);
    throw error;
  }
  
  return data.map((file: DatabaseFile): FileItem => ({
    id: file.id,
    name: file.name,
    format: file.type !== 'file' ? '-----' : file.format,
    type: file.type,
    dateUploaded: file.created_at,
    size: file.size || 0,
  }));
};


export function useFiles(filterFormat: string = ''): UseFilesReturn {
  const { data, error, mutate } = useSWR(
    ['files', filterFormat],
    () => fetcher(filterFormat),
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // Add this option
      dedupingInterval: 5000, // Add a deduping interval
    }
  );

  const checkFileExists = async (fileName: string): Promise<boolean> => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;

    try {
      const { data: existingFiles } = await supabase
      .from('items')
      .select('name')
      .eq('user_id', user.id)
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
          .eq('user_id', user.id);
  
        const existingFileItems = (existingFiles || []).map(f => ({ 
          name: f.name,
          id: '',
          format: '',
          type: '',
          dateUploaded: '',
          size: 0
        }));
  
        finalFileName = getNextFileName(file.name, existingFileItems);
      }

        // Sanitize the filename for storage
        const sanitizedStorageFileName = sanitizeFileName(finalFileName);
        const storageKey = `${user.id}/${Date.now()}_${sanitizedStorageFileName}`
          .replace(/[^a-zA-Z0-9._\-\/]/g, '_') // Only allow alphanumeric, dots, underscores, hyphens, and forward slashes
          .replace(/_+/g, '_'); // Replace multiple consecutive underscores with a single one

        // If replacing, delete the existing file first
        if (replaceExisting) {
          const { data: existingFile } = await supabase
            .from('items')
            .select('file_path')
            .eq('user_id', user.id)
            .eq('name', file.name)
            .single();

          if (existingFile) {
            await supabase.storage
              .from('files')
              .remove([existingFile.file_path]);

            await supabase
              .from('items')
              .delete()
              .eq('user_id', user.id)
              .eq('name', file.name);
          }
        }

        const options = {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: reportProgress,
        };

        // Upload with sanitized storage key
        const { data: storageData, error: storageError } = await supabase.storage
          .from('files')
          .upload(storageKey, file, options);

        if (storageError) throw storageError;

        // Store original filename in database but sanitized path in storage
        const { error: dbError } = await supabase
          .from('items')
          .insert({
            user_id: user.id,
            name: finalFileName,
            file_path: storageData.path,
            format: file.type,  // Add debug here
            type: 'file',
            size: file.size,
          });

        if (dbError) throw dbError;
        
        onProgress?.(100);
        await mutate();
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

  const downloadFile = async (file: FileItem) => {
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

    const deleteFile = async (file: FileItem) => {
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
          user_id: user.id,
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

  return {
    data: data || [],
    isLoading: !error && !data,
    error,
    uploadFile,
    downloadFile,
    deleteFile,
    checkFileExists,
    createFolder,
    mutate
  };
}
