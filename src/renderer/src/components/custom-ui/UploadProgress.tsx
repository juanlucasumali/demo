import React from 'react';
import { LoaderCircle, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { UploadStatus } from '../dashboard/MyFiles/MyFiles';

interface UploadProgressProps {
  uploads: {
    [key: string]: UploadStatus;
  };
  onDismiss: (fileName: string) => void;
  onResolveConflict: (fileName: string) => void;
  onShowError: (fileName: string, error: Error | string) => void;
  onShowLocation?: (fileName: string) => void;
  onClose: () => void; // Add this prop
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ 
  uploads, 
  onDismiss,
  onResolveConflict,
  onShowError,
  onShowLocation,
  onClose 
}) => {
  if (Object.keys(uploads).length === 0) return null;

  const handleClick = (fileName: string, status: UploadStatus) => {
    if (status.conflict) {
      onResolveConflict(fileName);
    } else if (status.progress === -1 && status.error) {
      onShowError(fileName, status.error);
    } else if (status.progress === 100 && onShowLocation) {
      onShowLocation(fileName);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-lg shadow-lg">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold">Uploading files</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(uploads).map(([fileName, status]) => {
            const isClickable = status.conflict || status.progress === -1 || status.progress === 100;
            
            return (
              <div 
                key={fileName} 
                className={`flex items-center justify-between rounded-md p-1 transition-colors
                  ${isClickable ? 'cursor-pointer hover:bg-muted' : ''}`}
                onClick={() => handleClick(fileName, status)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {status.progress === 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  ) : status.progress === -1 ? (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  ) : status.progress === -2 ? (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  ) : (
                    <LoaderCircle className="h-4 w-4 animate-spin shrink-0" />
                  )}
                  <p className="text-sm truncate">
                    {fileName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss(fileName);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
