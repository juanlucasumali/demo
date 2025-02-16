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
import { ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import FileTagsDropdown from "./file-tags-dropdown";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { maxFileNameLength } from "@renderer/lib/utils";
import { useUserStore } from "@renderer/stores/user-store";
import { Loader2 } from "lucide-react";

const createFolderSchema = z.object({
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
});

type CreateFolderFormValues = z.infer<typeof createFolderSchema>;

interface CreateFolderProps {
  isOpen: boolean;
  onClose: () => void;
  location?: 'project' | 'home' | 'collection';
  projectId?: string | null;
  parentFolderId?: string | null;
  collectionId?: string | null;
  sharedWith: UserProfile[] | null;
}

export function CreateFolder({
  isOpen,
  onClose,
  location = 'home',
  projectId = null,
  parentFolderId = null,
  collectionId = null,
  sharedWith,
}: CreateFolderProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    sharedWith || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CreateFolderFormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      description: "",
      tags: null,
    },
  });

  const onSubmit: SubmitHandler<CreateFolderFormValues> = async (data) => {
    if (!currentUser) return;
    
    if (!data.name) return;

    let finalFileName = data.name || "";

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
    setSelectedUsers([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[375px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
            </DialogHeader>

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

            <FormField
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
            />  

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
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 