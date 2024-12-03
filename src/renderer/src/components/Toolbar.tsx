import React, { useRef } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { ConversionDialog } from './ConversionDialog';

interface ToolbarProps {
  onFilesSelected: (files: FileList) => void;
  onFilterChange?: (value: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onFilesSelected,
  onFilterChange,
 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
      // Reset input
      event.target.value = '';
    }
  };

  const handleFilterChange = (value: string) => {
    if (onFilterChange) {
      onFilterChange(value);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <Button variant="default" onClick={handleUploadClick}>
          Upload File
        </Button>
        <ConversionDialog />
      </div>
      {/* Right side */}
      <div className="flex items-center space-x-2">
        <Select onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by format" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="audio/wav">WAV</SelectItem>
              <SelectItem value="audio/mpeg">MP3</SelectItem>
              <SelectItem value="audio/aiff">AIFF</SelectItem>
              <SelectItem value="audio/flac">FLAC</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Toolbar;
