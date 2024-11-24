import React from 'react';
import { supabase } from '../lib/supabaseClient';

interface ContentAreaProps {
  filesList: any[];
}

const ContentArea: React.FC<ContentAreaProps> = ({ filesList }) => {
  const handleDownload = async (file: any) => {
    const { data, error } = await supabase.storage
      .from('files')
      .download(file.file_path);

    if (error) {
      console.error('Download error:', error.message);
    } else {
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-grow overflow-y-auto">
      <div className="p-4">
        <p className="font-semibold">Contents</p>
        <ul>
          {filesList.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <span>{file.filename}</span>
              <button
                onClick={() => handleDownload(file)}
                className="text-blue-500 hover:underline"
              >
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContentArea;
