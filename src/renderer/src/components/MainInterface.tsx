import React, { useState, useEffect } from 'react';
import Toolbar from './Toolbar';
import NavigationPane from './NavigationPane';
import ContentArea from './ContentArea';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

const MainInterface: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [filesList, setFilesList] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>(
    {}
  );
  const [filterFormat, setFilterFormat] = useState('');

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    fetchFiles();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchFiles = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
  
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
  
      if (error) throw error;
      
      if (filterFormat && filterFormat !== 'all') {  // Add check for 'all'
        const filteredData = data.filter(file => file.format === filterFormat);
        setFilesList(filteredData);
      } else {
        setFilesList(data);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };  

  useEffect(() => {
    fetchFiles();
  }, [filterFormat]);

  const handleFilesSelected = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    uploadFiles(filesArray);
  };

  const uploadFiles = async (files: File[]) => {
    for (const file of files) {
      await uploadFile(file);
    }
    fetchFiles();
  };

  const uploadFile = async (file: File) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
  
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
  
    try {
      // 1. First upload to storage
      console.log("Uploading to storage:", user.id, file.name)
      const { data: storageData, error: storageError } = await supabase.storage
        .from('files')
        .upload(`${user.id}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: false
        });
  
      if (storageError) throw storageError;
      console.log("Uploaded to storage!")
  
      // 2. Then create the database record
      console.log("Uploading to database:", user.id, file.name, storageData.path, file.type)
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: storageData.path,
          format: file.type
        });
  
      if (dbError) throw dbError;
      console.log("Uploaded to database!")
  
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      
      // 3. Refresh the files list
      await fetchFiles();
  
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onFilesSelected={handleFilesSelected}
        onFilterChange={setFilterFormat}
      />
      <div className="flex flex-grow overflow-hidden">
        <NavigationPane />
        <ContentArea filesList={filesList} />
      </div>
      <div className="p-4">
        {Object.keys(uploadProgress).map((fileName) => (
          <div key={fileName}>
            <p>{fileName}</p>
            {uploadProgress[fileName] >= 0 ? (
              <progress value={uploadProgress[fileName]} max="100" />
            ) : (
              <p>Upload failed.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainInterface;