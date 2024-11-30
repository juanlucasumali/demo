import React, { useState } from 'react';
import Toolbar from './Toolbar';
import NavigationPane from './NavigationPane';
import ContentArea from './ContentArea';
import { useFiles } from '../hooks/useFiles';
import { useToast } from '@renderer/hooks/use-toast';

const MainInterface: React.FC = () => {
  const [filterFormat, setFilterFormat] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { uploadFile, convertFiles, downloadFromYoutube, error, isLoading } = useFiles(filterFormat);
  const { toast } = useToast();

  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    
    for (const file of filesArray) {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      try {
        await uploadFile(file);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
      }
    }
  };

  const handleConvert = async (files: File[], format: string) => {
    console.log("Starting conversion...")
    try {
      await convertFiles(files, format);
      toast({
        title: "Success",
        description: "Files converted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert files",
        variant: "destructive",
      });
    }
  };

  const handleYoutubeDownload = async (url: string, format: string) => {
    try {
      await downloadFromYoutube(url, format);
      toast({
        title: "Success",
        description: "YouTube audio downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download YouTube audio",
        variant: "destructive",
      });
    }
  };

  if (error) return <div>Error loading files</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onFilesSelected={handleFilesSelected}
        onFilterChange={setFilterFormat}
        onConvert={handleConvert}
        onYoutubeDownload={handleYoutubeDownload}
      />
      <div className="flex flex-grow overflow-hidden">
        <NavigationPane />
        <ContentArea />
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