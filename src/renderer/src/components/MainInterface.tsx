import React, { useState } from "react";
import Toolbar from "./Toolbar";
import NavigationPane from "./NavigationPane";
import ContentArea from "./ContentArea";
import { useFiles } from "../hooks/useFiles";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "../components/ui/progress";

const MainInterface: React.FC = () => {
  const [filterFormat, setFilterFormat] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const { uploadFile, error, isLoading, mutate } = useFiles(filterFormat); // Make sure to destructure mutate

  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      try {
        await uploadFile(file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        // Mutate after successful upload
        await mutate();
      } catch (error) {
        console.error("Upload error:", error);
        setUploadProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
    }
  };

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
              <Progress value={uploadProgress[fileName]} />
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
