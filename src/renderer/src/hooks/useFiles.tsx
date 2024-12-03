import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { FileItem } from '../types/files'; // Import the FileItem type

interface DatabaseFile {
  id: string;
  filename: string;
  file_path: string;
  format: string;
  created_at: string;
  size?: number;
}

interface UseFilesReturn {
  data: FileItem[]; // Changed to match FileItem type
  isLoading: boolean;
  error: any;
  uploadFile: (file: File) => Promise<void>;
  downloadFile: (file: FileItem) => Promise<void>;
  mutate: () => Promise<any>;
}

const fetcher = async (filterFormat: string) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  let query = supabase
    .from('files')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (filterFormat && filterFormat !== 'all') {
    query = query.eq('format', filterFormat);
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Transform the database data to match FileItem type
  return data.map((file: DatabaseFile): FileItem => ({
    id: file.id,
    name: file.filename,
    type: file.format,
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
    }
  );

  const uploadFile = async (file: File) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(`${user.id}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: storageData.path,
          format: file.type,
          size: file.size,
        });

      if (dbError) throw dbError;
      
      await mutate();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const downloadFile = async (file: FileItem) => {
    try {
      // You'll need to get the file_path from the database using the file.id
      const { data: fileData } = await supabase
        .from('files')
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
      console.error('Download error:', error);
      throw error;
    }
  };

  return {
    data: data || [],
    isLoading: !error && !data,
    error,
    uploadFile,
    downloadFile,
    mutate
  };
}
