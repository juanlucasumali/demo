"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState, useCallback } from "react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useUserStore } from "@renderer/stores/user-store";
import { File, Loader2 } from "lucide-react";
import { Progress } from "@renderer/components/ui/progress";
import { DropZone } from "../ui/drop-zone";
import { X } from "lucide-react";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";
import { FileCheck, AlertCircle } from "lucide-react";
import { DemoItem } from "@renderer/types/items";
import { checkForDuplicates, generateUniqueFileName, getCurrentUserId, getFilesWithSharing } from '@renderer/services/items-service';

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
  location: 'project' | 'home' | 'collection' | 'folder';
  projectId?: string | null;
  parentFolderId?: string | null;
  collectionId?: string | null;
  parentFolder?: DemoItem | null;
  parentProject?: DemoItem | null;
  initialFiles?: File[];
}

export function UploadFiles({
  isOpen,
  onClose,
  location,
  projectId = null,
  parentFolderId = null,
  collectionId = null,
  parentFolder = null,
  parentProject = null,
  initialFiles = [],
}: UploadFilesProps) {
  const { toast } = useToast();
  const { addFileOrFolder, deleteItem } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    location === 'project' || location === 'collection'
      ? parentProject?.sharedWith || []
      : parentFolder?.sharedWith || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>(initialFiles);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileProgress, setFileProgress] = useState<Record<string, FileUploadProgress>>({});
  const [successfulUploads, setSuccessfulUploads] = useState(0);

  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateFiles, setDuplicateFiles] = useState<string[]>([]);

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
        const combinedSharedWith = [
          ...selectedUsers,
          ...(location === 'project' || location === 'collection' ? parentProject?.owner ? [parentProject.owner] : [] : []),
          ...(parentFolder?.owner ? [parentFolder.owner] : [])
        ].filter((user, index, self) => 
          index === self.findIndex((u) => u.id === user.id)
        );

        addFileOrFolder({ 
          item: newItem, 
          sharedWith: combinedSharedWith.length > 0 ? combinedSharedWith : undefined,
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

  const checkForDuplicatesInUpload = async () => {
    if (location === 'home') return false;
    
    const duplicateResults = await checkForDuplicates(
      selectedFiles, 
      location,
      {
        parentFolderId,
        projectId,
        collectionId
      }
    );
    
    if (duplicateResults.length > 0) {
      setShowDuplicateDialog(true);
      setDuplicateFiles(duplicateResults.map(d => d.fileName));
      return true;
    }
    
    return false;
  };

  const handleDuplicateAction = async (action: 'keep' | 'delete') => {
    if (action === 'keep') {
      const duplicateResults = await checkForDuplicates(
        selectedFiles,
        location,
        {
          parentFolderId,
          projectId,
          collectionId
        }
      );
      
      const duplicateMap = new Map(
        duplicateResults.map(d => [d.fileName, d.existingNames])
      );

      // Create new files with updated names
      const updatedFiles = await Promise.all(selectedFiles.map(async (file) => {
        const existingNames = duplicateMap.get(file.name);
        if (existingNames) {
          const newName = generateUniqueFileName(file.name, existingNames);
          // Create new file with updated name
          const fileContent = await file.arrayBuffer();
          return new window.File(
            [fileContent],
            newName,
            { type: file.type }
          );
        }
        return file;
      }));

      // Update UI state
      setSelectedFiles(updatedFiles);
      setShowDuplicateDialog(false);

      // Use the stored files for upload
      await proceedWithUpload(updatedFiles);
    } else if (action === 'delete') {
      // Get the list of duplicate files that need to be deleted
      const duplicateResults = await checkForDuplicates(
        selectedFiles,
        location,
        {
          parentFolderId,
          projectId,
          collectionId
        }
      );
      
      // Get all existing files in the location
      const existingFiles = await getFilesWithSharing(getCurrentUserId(), {
        parentFolderId: location === 'folder' ? parentFolderId : null,
        projectId: location === 'project' ? projectId : null,
        collectionId: location === 'collection' ? collectionId : null,
        includeNested: false
      });

      // Find the files that need to be deleted
      const filesToDelete = existingFiles.filter(existingFile => 
        duplicateResults.some(duplicate => 
          duplicate.existingNames.includes(existingFile.name)
        )
      );

      try {
        // Delete all duplicate files first
        for (const file of filesToDelete) {
          await deleteItem(file.id);
        }

        // Close dialog
        setShowDuplicateDialog(false);
        
        // Proceed with upload of new files
        await proceedWithUpload(selectedFiles);
      } catch (error) {
        console.error('Failed to delete existing files:', error);
        toast({
          title: "Error",
          description: "Failed to replace existing files. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const proceedWithUpload = async (filesToProcess: File[]) => {
    if (!currentUser) return;
    if (filesToProcess.length === 0) return;

    setIsUploading(true);
    setSuccessfulUploads(0);
    let successCount = 0;

    // Use the passed files instead of selectedFiles state
    const initialProgress = filesToProcess.reduce((acc, file) => {
        acc[file.name] = {
            id: file.name,
            progress: 0,
            status: 'pending'
        };
        return acc;
    }, {} as Record<string, FileUploadProgress>);
    
    setFileProgress(initialProgress);

    try {
        for (let i = 0; i < filesToProcess.length; i++) {
            const file = filesToProcess[i];
            
            // Update status to uploading
            setFileProgress(prev => ({
              ...prev,
              [file.name]: { ...prev[file.name], status: 'uploading' }
            }));

            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            console.log("File name", file.name)
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
                const combinedSharedWith = [
                  ...selectedUsers,
                  ...(location === 'project' || location === 'collection' ? parentProject?.owner ? [parentProject.owner] : [] : []),
                  ...(parentFolder?.owner ? [parentFolder.owner] : [])
                ].filter((user, index, self) => 
                  index === self.findIndex((u) => u.id === user.id)
                );

                addFileOrFolder({ 
                  item: newItem, 
                  sharedWith: combinedSharedWith.length > 0 ? combinedSharedWith : undefined,
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
          description: `Successfully uploaded ${successCount} of ${filesToProcess.length} files`,
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

  const onSubmit: SubmitHandler<UploadFilesFormValues> = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }

    if (location !== 'home') {
      const hasDuplicates = await checkForDuplicatesInUpload();
      if (hasDuplicates) {
        return;
      }
    }
    
    await proceedWithUpload(selectedFiles);
  };

  const renderUploadDialogContent = () => {
    return (
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

          {(location === 'home' || location === 'folder' || location === 'project') && (
            <div>
              <FormLabel>Share with</FormLabel>
              <FriendsSearch
                owner={location === 'project' ? parentProject?.owner || undefined : parentFolder?.owner || undefined}
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
    );
  }

  const renderDuplicateDialogContent = () => {
    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-large">Duplicate files</DialogTitle>
          <DialogDescription>
            The following files already exist in this location:
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-md">
          <div className="max-h-[200px] overflow-y-auto scrollbar-none">
            <Table>
              <TableBody>
                {duplicateFiles.map((file) => (
                  <TableRow key={file}>
                    <TableCell className="w-full">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2" />
                        <span className="font-medium truncate max-w-[200px]">{file}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
            
        <div className="flex justify-center gap-2 mt-6">
          <Button onClick={() => handleDuplicateAction('keep')}>Keep all items</Button>
          <Button onClick={() => handleDuplicateAction('delete')}>Replace existing items</Button>
        </div>
      </>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px]">
        {showDuplicateDialog ? renderDuplicateDialogContent() : renderUploadDialogContent()}
      </DialogContent>
    </Dialog>
  );
} 