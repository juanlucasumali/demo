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

const createItemSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(maxFileNameLength, { 
      message: `Name must not exceed ${maxFileNameLength} characters.` 
    }),
  description: z
    .string()
    .max(200, { message: "Description must not exceed 200 characters." }),
  tags: z.any().nullable(),
  file: z.custom<File>().optional()
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
  localPath?: string | null;
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
  localPath
}: CreateItemProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    sharedWith || []
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);
  const [originalExtension, setOriginalExtension] = useState<string | null>(null);

  console.log('📂 Local path:', localPath);

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: null,
      file: undefined
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const originalExtension = file.name.split('.').pop()?.toLowerCase();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      form.setValue("file", file);
      form.setValue("name", sanitizedFileName);
      setOriginalExtension(originalExtension || null);
    }
  };

  const handleLocalFileSystemOperation = async (
    itemName: string,
    fileContent?: Buffer
  ) => {
    if (!localPath) return;

    try {
      const fullLocalPath = await window.api.joinPath(localPath, itemName);
      
      if (type === 'folder') {
        await window.api.createLocalDirectory(fullLocalPath);
        console.log('✅ Local directory created:', fullLocalPath);
      } else if (type === 'file' && fileContent) {
        await window.api.writeLocalFile(fullLocalPath, fileContent);
        console.log('✅ Local file written:', fullLocalPath);
      }
    } catch (error) {
      console.error('❌ Local filesystem operation failed:', error);
      throw new Error('Failed to create item in local filesystem');
    }
  };

  const onSubmit: SubmitHandler<CreateItemFormValues> = async (data) => {
    try {
      if (!currentUser) return;
      if (type === 'file' && !selectedFile) return;

      let finalFileName = data.name;
      if (type === 'file' && originalExtension) {
        const currentExtension = finalFileName.split('.').pop()?.toLowerCase();
        if (!currentExtension || currentExtension !== originalExtension) {
          finalFileName = `${finalFileName}.${originalExtension}`;
        }
      }

      setIsUploading(true);
      toast({
        title: "Uploading...",
        description: type === 'file' ? "Your file is being uploaded" : "Creating folder",
        variant: "default",
      });

      if (localPath) {
        const fileContent = selectedFile ? await selectedFile.arrayBuffer() : undefined;
        await handleLocalFileSystemOperation(
          finalFileName,
          fileContent ? Buffer.from(fileContent) : undefined
        );
      }

      const newItem = {
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: finalFileName,
        isStarred: false,
        parentFolderIds: parentFolderId ? [parentFolderId] : [],
        filePath: type === 'file' ? `/files/${finalFileName}` : finalFileName,
        type: type === 'file' ? ItemType.FILE : ItemType.FOLDER,
        duration: type === 'file' ? 0 : null,
        format: type === 'file' ? (selectedFile?.name.split(".").pop() as FileFormat) : null,
        owner: currentUser,
        sharedWith: selectedUsers,
        tags: data.tags,
        projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
        size: type === 'file' ? selectedFile?.size ?? null : null,
        description: data.description || "",
        icon: null,
        collectionIds: location === 'collection' ? [collectionId!] : [],
        localPath: localPath ? await window.api.joinPath(localPath, finalFileName) : null
      };

      if (type === 'file' && selectedFile) {
        const fileContent = await selectedFile.arrayBuffer();
        await new Promise<void>((resolve, reject) => {
          addFileOrFolder({ 
            item: newItem, 
            sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined,
            fileContent
          }, {
            onSuccess: () => {
              toast({
                title: "Success!",
                description: selectedUsers.length > 0
                  ? `${type === 'file' ? 'File' : 'Folder'} created!`
                  : `${type === 'file' ? 'File uploaded' : 'Folder created'} successfully.`,
                variant: "default",
              });
              resolve();
            },
            onError: (error) => {
              console.error('Creation error:', error);
              toast({
                title: "Error",
                description: `Failed to ${type === 'file' ? 'upload file' : 'create folder'}.`,
                variant: "destructive",
              });
              reject(error);
            }
          });
        });
      } else {
        await new Promise<void>((resolve, reject) => {
          addFileOrFolder({ 
            item: newItem, 
            sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined 
          }, {
            onSuccess: () => {
              toast({
                title: "Success!",
                description: `Folder created successfully.`,
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
      }

      form.reset();
      setSelectedFile(null);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      console.error('Creation error:', error);
      toast({
        title: "Error",
        description: `Failed to ${type === 'file' ? 'upload file' : 'create folder'}.`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel>File</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        // accept={allowedFormats.map((f) => `.${f}`).join(",")}
                        onChange={handleFileChange}
                        className="pt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{type === 'file' ? 'File Name' : 'Folder Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Name your ${type === 'file' ? 'file' : 'folder'}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <FormField
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