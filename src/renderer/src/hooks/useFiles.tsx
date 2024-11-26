import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';

interface FileData {
  id: string;
  filename: string;
  file_path: string;
  format: string;
  created_at: string;
}

interface UseFilesReturn {
  files: FileData[];
  isLoading: boolean;
  error: any;
  uploadFile: (file: File) => Promise<void>;
  downloadFile: (file: FileData) => Promise<void>;
  mutate: () => void;
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
  return data;
};

export function useFiles(filterFormat: string = ''): UseFilesReturn {
  const { data: files, error, mutate } = useSWR(
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
          format: file.type
        });

      if (dbError) throw dbError;
      
      // Revalidate the data
      mutate();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const downloadFile = async (file: FileData) => {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .download(file.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  return {
    files: files || [],
    isLoading: !error && !files,
    error,
    uploadFile,
    downloadFile,
    mutate
  };
}
