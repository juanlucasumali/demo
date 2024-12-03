import { useFiles } from "../hooks/useFiles";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const ContentArea: React.FC = () => {
  const { files, downloadFile, isLoading, error } = useFiles();

  if (error)
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading files.</AlertDescription>
        </Alert>
      </div>
    );

  if (isLoading)
    return (
      <div className="p-4">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Loading...</AlertDescription>
        </Alert>
      </div>
    );

  return (
    <div className="flex-grow overflow-y-auto">
      <div className="p-4">
        <p className="font-semibold">Contents</p>
        <ul>
          {files.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <span>{file.filename}</span>
              <Button
                variant="link"
                onClick={() => downloadFile(file)}
                className="text-blue-500 hover:underline"
              >
                Download
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContentArea;
