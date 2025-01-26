"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState } from "react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import FileTagsDropdown from "./file-tags-dropdown";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { maxFileNameLength } from "@renderer/lib/utils";
import { useUserStore } from "@renderer/stores/user-store";
import { Loader2 } from "lucide-react";
import { Progress } from "@renderer/components/ui/progress";

const createItemSchema = z.object({
  name: z
    .string()
    .max(maxFileNameLength, { 
      message: `Name must not exceed ${maxFileNameLength} characters.` 
    })
    .optional(),
  description: z
    .string()
    .max(200, { message: "Description must not exceed 200 characters." })
    .optional(),
  tags: z.any().nullable(),
  files: z.custom<FileList>().optional()
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;

interface CreateItemProps {
  type: 'file' | 'folder';
  isOpen: boolean;
  onClose: () => void;
  location?: 'project' | 'home' | 'collection';
  projectId?: string | null;
  parentFolderId?: string | null;
  collectionId?: string | null;
  sharedWith: UserProfile[] | null;
}

export function CreateItem({
  type,
  isOpen,
  onClose,
  location = 'home',
  projectId = null,
  parentFolderId = null,
  collectionId = null,
  sharedWith,
}: CreateItemProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    sharedWith || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);
  const [originalExtension, setOriginalExtension] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [currentFileName, setCurrentFileName] = useState<string>("");

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: null,
      files: undefined
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      form.setValue("name", "");
    }
  };

  const onSubmit: SubmitHandler<CreateItemFormValues> = async (data) => {
    if (!currentUser) return;
    
    if (type === 'folder') {
      if (!data.name) return;

      let finalFileName = data.name || "";
      if (originalExtension) {
        const currentExtension = finalFileName.split('.').pop()?.toLowerCase();
        if (!currentExtension || currentExtension !== originalExtension) {
          finalFileName = `${finalFileName}.${originalExtension}`;
        }
      }

      setIsUploading(true);
      toast({
        title: "Creating folder...",
        description: "Your folder is being created",
        variant: "default",
      });

      const newItem = {
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: finalFileName,
        isStarred: false,
        parentFolderIds: parentFolderId ? [parentFolderId] : [],
        filePath: finalFileName,
        type: ItemType.FOLDER,
        duration: null,
        format: null,
        owner: currentUser,
        sharedWith: selectedUsers,
        tags: data.tags,
        projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
        size: null,
        description: data.description || "",
        icon: null,
        collectionIds: location === 'collection' ? [collectionId!] : [],
      };

      await new Promise<void>((resolve, reject) => {
        addFileOrFolder({ 
          item: newItem, 
          sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined 
        }, {
          onSuccess: () => {
            toast({
              title: "Success!",
              description: "Folder created successfully.",
              variant: "default",
            });
            resolve();
          },
          onError: (error) => {
            console.error('Creation error:', error);
            toast({
              title: "Error",
              description: "Failed to create folder.",
              variant: "destructive",
            });
            reject(error);
          }
        });
      });

      form.reset();
      setSelectedFiles([]);
      setSelectedUsers([]);
      onClose();
    } else {
      if (selectedFiles.length === 0) return;

      setIsUploading(true);
      setTotalFiles(selectedFiles.length);
      setProcessedFiles(0);
      setUploadProgress(0);

      let successfulUploads = 0;

      try {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          setCurrentFileName(file.name);

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
            tags: data.tags,
            projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
            size: file.size,
            description: data.description || "",
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
                  successfulUploads++;
                  setProcessedFiles(successfulUploads);
                  setUploadProgress((successfulUploads / selectedFiles.length) * 100);
                  resolve();
                },
                onError: (error) => reject(error)
              });
            });
          } catch (error) {
            console.error(`Failed to upload ${file.name}:`, error);
            toast({
              title: `Failed to upload ${file.name}`,
              description: "The upload will continue with remaining files",
              variant: "destructive",
              duration: 3000
            });
          }
        }

        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successfulUploads} of ${selectedFiles.length} files`,
          variant: "default",
        });

        form.reset();
        setSelectedFiles([]);
        setSelectedUsers([]);
        onClose();
      } catch (error) {
        console.error('Upload failed:', error);
        toast({
          title: "Upload Failed",
          description: "Some files failed to upload",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setProcessedFiles(0);
        setTotalFiles(0);
        setCurrentFileName("");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[375px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{type === 'file' ? 'Upload File' : 'Create Folder'}</DialogTitle>
            </DialogHeader>

            {type === 'file' && (
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormLabel>Files</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="pt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type !== 'file' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folder Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name your folder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type !== 'file' && <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />}

            {type !== 'file' && <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <FileTagsDropdown
                      tags={field.value}
                      setTags={(tags) => form.setValue("tags", tags)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />}

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

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Uploading: {processedFiles} / {totalFiles} files
                </p>
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
                  {type === 'file' ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                type === 'file' ? 'Upload' : 'Create'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 