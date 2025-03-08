import * as React from "react"
import { cn } from "@renderer/lib/utils"
import { useState } from "react"

interface FileDropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  disabled?: boolean
  onFileDrop?: (files: File[]) => void
  children: React.ReactNode
}

export function FileDropZone({ 
  className, 
  disabled, 
  onFileDrop,
  children,
  ...props 
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileDrop?.(files);
    }
  };

  return (
    <div 
      className={cn("relative", className)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[1px] rounded-xl border-2 border-dashed border-primary/50 z-50 pointer-events-none flex items-center justify-center">
          <p className="text-lg font-medium text-primary/80">
            Drop files to upload
          </p>
        </div>
      )}
      {children}
    </div>
  )
} 