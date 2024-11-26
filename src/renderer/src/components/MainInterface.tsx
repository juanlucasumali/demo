import React, { useState } from 'react';
import Toolbar from './Toolbar';
import NavigationPane from './NavigationPane';
import ContentArea from './ContentArea';
import { useFiles } from '../hooks/useFiles';

const MainInterface: React.FC = () => {
  const [filterFormat, setFilterFormat] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const { isLoading, error, uploadFile } = useFiles(filterFormat);

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

  if (error) return <div>Error loading files</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="h-screen flex flex-col">
      <Toolbar
        onFilesSelected={handleFilesSelected}
        onFilterChange={setFilterFormat}
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