"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState, useCallback } from "react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useUserStore } from "@renderer/stores/user-store";
import { Loader2 } from "lucide-react";
import { Progress } from "@renderer/components/ui/progress";
import { DropZone } from "../ui/drop-zone";
import { X } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { FileCheck, AlertCircle } from "lucide-react";

interface FileUploadProgress {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'retry';
}

const uploadFilesSchema = z.object({
  files: z.custom<FileList>().optional()
});

type UploadFilesFormValues = z.infer<typeof uploadFilesSchema>;

interface UploadFilesProps {
  isOpen: boolean;
  onClose: () => void;
  location?: 'project' | 'home' | 'collection';
  projectId?: string | null;
  parentFolderId?: string | null;
  collectionId?: string | null;
  sharedWith: UserProfile[] | null;
  initialFiles?: File[];
}

export function UploadFiles({
  isOpen,
  onClose,
  location = 'home',
  projectId = null,
  parentFolderId = null,
  collectionId = null,
  sharedWith,
  initialFiles = [],
}: UploadFilesProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    sharedWith || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, FileUploadProgress>>({});
  const [successfulUploads, setSuccessfulUploads] = useState(0);

  const form = useForm<UploadFilesFormValues>({
    resolver: zodResolver(uploadFilesSchema),
    defaultValues: {
      files: undefined
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setSelectedFiles(droppedFiles);
    }
  }, []);

  const handleRetry = async (file: File) => {
    if (!currentUser) return;
    
    setFileProgress(prev => ({
      ...prev,
      [file.name]: { ...prev[file.name], status: 'uploading' }
    }));

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const newItem = {
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: file.name,
      isStarred: false,
      parentFolderIds: parentFolderId ? [parentFolderId] : [],
      filePath: null,
      type: ItemType.FILE,
      duration: 0,
      format: fileExtension as FileFormat,
      owner: currentUser,
      sharedWith: selectedUsers,
      tags: null,
      projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
      size: file.size,
      description: null,
      icon: null,
      collectionIds: location === 'collection' ? [collectionId!] : [],
    };

    try {
      const fileContent = await file.arrayBuffer();
      await new Promise<void>((resolve, reject) => {
        addFileOrFolder({ 
          item: newItem, 
          sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined,
          fileContent
        }, {
          onSuccess: () => {
            setSuccessfulUploads(prev => prev + 1);
            setFileProgress(prev => ({
              ...prev,
              [file.name]: { 
                ...prev[file.name], 
                progress: 100,
                status: 'completed'
              }
            }));
            resolve();
          },
          onError: (error) => {
            setFileProgress(prev => ({
              ...prev,
              [file.name]: { 
                ...prev[file.name], 
                status: 'error'
              }
            }));
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      setFileProgress(prev => ({
        ...prev,
        [file.name]: { 
          ...prev[file.name], 
          status: 'error'
        }
      }));
    }
  };

  const onSubmit: SubmitHandler<UploadFilesFormValues> = async () => {
    if (!currentUser) return;
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setSuccessfulUploads(0);
    let successCount = 0;

    // Initialize progress for all files
    const initialProgress = selectedFiles.reduce((acc, file) => {
      acc[file.name] = {
        id: file.name,
        progress: 0,
        status: 'pending'
      };
      return acc;
    }, {} as Record<string, FileUploadProgress>);
    
    setFileProgress(initialProgress);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Update status to uploading
        setFileProgress(prev => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: 'uploading' }
        }));

        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const newItem = {
          createdAt: new Date(),
          lastModified: new Date(),
          lastOpened: new Date(),
          name: file.name,
          isStarred: false,
          parentFolderIds: parentFolderId ? [parentFolderId] : [],
          filePath: null,
          type: ItemType.FILE,
          duration: 0,
          format: fileExtension as FileFormat,
          owner: currentUser,
          sharedWith: selectedUsers,
          tags: null,
          projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
          size: file.size,
          description: null,
          icon: null,
          collectionIds: location === 'collection' ? [collectionId!] : [],
        };

        try {
          const fileContent = await file.arrayBuffer();
          await new Promise<void>((resolve, reject) => {
            addFileOrFolder({ 
              item: newItem, 
              sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined,
              fileContent
            }, {
              onSuccess: () => {
                successCount++;
                setSuccessfulUploads(successCount);
                setFileProgress(prev => ({
                  ...prev,
                  [file.name]: { 
                    ...prev[file.name], 
                    progress: 100,
                    status: 'completed'
                  }
                }));
                resolve();
              },
              onError: (error) => {
                setFileProgress(prev => ({
                  ...prev,
                  [file.name]: { 
                    ...prev[file.name], 
                    status: 'error'
                  }
                }));
                reject(error);
              }
            });
          });
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successCount} of ${selectedFiles.length} files`,
        variant: "default",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Some files failed to upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSuccessfulUploads(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="files"
              render={() => (
                <FormItem>
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <DropZone
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        isDragging={isDragging}
                        onClick={() => document.getElementById('file-input')?.click()}
                      />
                      <input
                        id="file-input"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <FormLabel>Upload List</FormLabel>
                          <div className="border rounded-md">
                            <div className="max-h-[200px] overflow-y-auto scrollbar-none">
                              <Table>
                                <TableBody>
                                  {selectedFiles.map((file, index) => (
                                    <TableRow key={`${file.name}-${index}`}>
                                      <TableCell className="w-full">
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                          <div className="flex items-center gap-2">
                                            {fileProgress[file.name]?.status === 'completed' && (
                                              <FileCheck className="h-4 w-4 text-green-500" />
                                            )}
                                            {fileProgress[file.name]?.status === 'error' && (
                                              <div className="flex items-center gap-2">
                                                <AlertCircle className="h-4 w-4 text-red-500" />
                                                <Button 
                                                  type="button"
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-6 px-2"
                                                  onClick={() => handleRetry(file)}
                                                  disabled={isUploading}
                                                >
                                                  Retry
                                                </Button>
                                              </div>
                                            )}
                                            {fileProgress[file.name]?.status === 'uploading' && (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            {!isUploading && !fileProgress[file.name]?.status && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setSelectedFiles(files => 
                                                    files.filter((_, i) => i !== index)
                                                  );
                                                }}
                                                className="p-1 hover:bg-muted rounded-sm"
                                              >
                                                <X className="h-4 w-4 text-muted-foreground" />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      )}

                      {isUploading && (
                        <div className="space-y-2">
                          <Progress value={(successfulUploads / selectedFiles.length) * 100} />
                          <p className="text-sm text-muted-foreground">
                            Uploading: {successfulUploads} / {selectedFiles.length} files
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {location === 'home' && (
              <div>
                <FormLabel>Share with</FormLabel>
                <FriendsSearch
                  friendsList={friends}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  onSearch={setSearchTerm}
                  isLoading={isLoading.friends}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </> 
              ) : (
                'Start Upload'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 