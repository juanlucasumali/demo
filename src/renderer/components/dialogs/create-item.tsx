"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { currentUser, friendsData } from "../home/dummy-data";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState } from "react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import FileTagsDropdown from "./file-tags-dropdown";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { maxFileNameLength } from "@renderer/lib/utils";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

const createItemSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required." })
    .max(maxFileNameLength, { 
      message: `Name must not exceed ${maxFileNameLength} characters.` 
    }),
  tags: z.any().nullable(),
  file: z.custom<File>().optional()
    .refine(
      (file) => {
        if (!file) return true; // Optional for folders
        return allowedFormats.includes(file.name.split(".").pop() || "")
      },
      {
        message: `File format must be one of: ${allowedFormats.join(", ")}`,
      }
    ),
});

type CreateItemFormValues = z.infer<typeof createItemSchema>;

interface CreateItemProps {
  type: 'file' | 'folder';
  isOpen: boolean;
  onClose: () => void;
  location?: 'project' | 'home';
  projectId?: string | null;
}

export function CreateItem({
  type,
  isOpen,
  onClose,
  location = 'home',
  projectId = null
}: CreateItemProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<CreateItemFormValues>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      tags: null,
      file: undefined
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      form.setValue("file", file);
      form.setValue("name", sanitizedFileName);
    }
  };

  const onSubmit: SubmitHandler<CreateItemFormValues> = async (data) => {
    try {
      if (!currentUser) return;
      if (type === 'file' && !selectedFile) return;

      const newItem = {
        id: undefined,
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: data.name,
        isStarred: false,
        parentFolderId: null,
        filePath: type === 'file' 
          ? `/files/${data.name}` 
          : data.name,
        type: type === 'file' ? ItemType.FILE : ItemType.FOLDER,
        duration: type === 'file' ? 0 : null,
        format: type === 'file' 
          ? (selectedFile?.name.split(".").pop() as FileFormat) 
          : null,
        owner: currentUser,
        sharedWith: selectedUsers,
        tags: data.tags,
        projectId: location === 'project' ? projectId : null,
        size: type === 'file' ? selectedFile?.size ?? null : null,
        description: null,
        icon: null,
        collectionId: null,
      };

      await addFileOrFolder(newItem);

      toast({
        title: "Success!",
        description: `${type === 'file' ? 'File uploaded' : 'Folder created'} successfully.`,
        variant: "default",
      });

      form.reset();
      setSelectedFile(null);
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      toast({
        title: "Error!",
        description: `Failed to ${type === 'file' ? 'upload file' : 'create folder'}.`,
        variant: "destructive",
      });
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
                        accept={allowedFormats.map((f) => `.${f}`).join(",")}
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
                  friendsList={friendsData}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              {type === 'file' ? 'Upload' : 'Create'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 