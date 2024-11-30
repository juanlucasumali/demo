import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { youtube_parser } from '@renderer/lib/files';

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
  convertFiles: (file: File[], format: string) => Promise<void>;
  downloadFromYoutube: (url: string, format: string) => Promise<void>;
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

    const convertFiles = async (files: File[], format: string) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        // This is where you'd implement the actual conversion logic
        // For now, we'll just simulate it
        for (const file of files) {
        try {
            // Simulate conversion
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Upload converted file
            const newFilename = file.name.replace(/\.[^/.]+$/, `.${format}`);
            const blob = new Blob([await file.arrayBuffer()], { type: `audio/${format}` });
            const convertedFile = new File([blob], newFilename, { type: `audio/${format}` });
            
            await uploadFile(convertedFile);
        } catch (error) {
            console.error('Conversion error:', error);
            throw error;
        }
        }
    };

    const downloadFromYoutube = async (url: string, format: string) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        try {
        const videoId = youtube_parser(url);
        // const videoId = url; //TODO: Find youtube parser
        if (!videoId) throw new Error('Invalid YouTube URL');

        // This is where you'd implement the actual YouTube download logic
        // For now, we'll just simulate it
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate file creation
        const filename = `youtube-${videoId}.${format}`;
        const blob = new Blob([], { type: `audio/${format}` });
        const file = new File([blob], filename, { type: `audio/${format}` });

        await uploadFile(file);
        } catch (error) {
        console.error('YouTube download error:', error);
        throw error;
        }
    };


  return {
    files: files || [],
    isLoading: !error && !files,
    error,
    uploadFile,
    downloadFile,
    convertFiles,
    downloadFromYoutube,
    mutate
  };
}
