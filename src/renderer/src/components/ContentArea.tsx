import { useFiles } from '../hooks/useFiles';

const ContentArea: React.FC = () => {
  const { files, downloadFile, isLoading, error } = useFiles();

  if (error) return <div className="p-4">Error loading files</div>;
  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex-grow overflow-y-auto">
      <div className="p-4">
        <p className="font-semibold">Contents</p>
        <ul>
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <span>{file.filename}</span>
              <button
                onClick={() => downloadFile(file)}
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
