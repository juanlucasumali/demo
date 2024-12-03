import React, { useState } from "react";
import Toolbar from "../../Toolbar";
import { useFiles } from "../../../hooks/useFiles";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "../../ui/progress";
import { DataTable } from "./data-table";
import { columns } from "./columns";

const MyFiles: React.FC = () => {
  const [filterFormat, setFilterFormat] = useState("");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  
  const { uploadFile, error, isLoading, data, mutate } = useFiles(filterFormat);

  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      try {
        await uploadFile(file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
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
      <div className="flex flex-col h-full"> {/* Changed from h-screen */}
        <Toolbar
          onFilesSelected={handleFilesSelected}
          onFilterChange={setFilterFormat}
        />
        <div className="flex-1 overflow-auto"> {/* Removed flex-grow */}
          <div className="p-4">
            <DataTable columns={columns} data={data || []} />
            
            {/* Upload Progress Section */}
            <div className="mt-4">
              {Object.keys(uploadProgress).map((fileName) => (
                <div key={fileName} className="mb-2">
                  <p>{fileName}</p>
                  {uploadProgress[fileName] >= 0 ? (
                    <Progress value={uploadProgress[fileName]} />
                  ) : (
                    <p className="text-red-500">Upload failed.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default MyFiles;