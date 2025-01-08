"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { DemoItem, ItemType } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { maxFileNameLength } from "@renderer/lib/utils";
import { UseMutateFunction } from "@tanstack/react-query";
import { useItems } from "@renderer/hooks/use-items";

// Schema and validation rules remain the same
const editFileSchema = z.object({
    fileName: z
    .string()
    .min(1, { message: "File name is required." })
    .max(maxFileNameLength, {
      message: `File name must not exceed ${maxFileNameLength} characters.`,
    }),
    description: z
    .string()
  .max(200, { message: "Description must not exceed 200 characters." }),
  tags: z.any().nullable(),
});

type EditFileFormValues = z.infer<typeof editFileSchema>;

interface EditFileDialogProps {
  editFile: boolean;
  setEditFile: (value: boolean) => void;
  existingFile: DemoItem;
  handleDialogClose: (value: boolean) => void;
  updateItem: UseMutateFunction<void, Error, { updatedItem: DemoItem, originalItem: DemoItem }, unknown>;
}

export function EditFileDialog({
  editFile,
  setEditFile,
  existingFile,
  handleDialogClose,
  updateItem,
}: EditFileDialogProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { friends, isLoading } = useItems({ searchTerm });

  useEffect(() => {
    setSelectedUsers(existingFile.sharedWith || []);
  }, [existingFile]);

  const form = useForm<EditFileFormValues>({
    resolver: zodResolver(editFileSchema),
    defaultValues: {
      fileName: existingFile.name,
      tags: existingFile.tags,
      description: existingFile.description || "",
    },
  });

  const onSubmit = async (data: EditFileFormValues) => {
    try {

      let newLocalPath: string | null = null
      // Create updated item object
      if (existingFile.localPath) {
        newLocalPath = existingFile.localPath.replace(existingFile.name, data.fileName)
        console.log("existingFile.name:", existingFile.name)
        console.log("data.fileName:", data.fileName)
        console.log("newLocalPath:", newLocalPath)
      }

      const updatedItem = {
        ...existingFile,
        name: data.fileName,
        tags: data.tags,
        description: data.description || "",
        lastModified: new Date(),
        sharedWith: selectedUsers,
        localPath: newLocalPath,
      };

      console.log("updatedItem:", updatedItem)

      // Call updateItem mutation with both new and original items
      await updateItem({ updatedItem, originalItem: existingFile });

      toast({
        title: "Changes saved",
        description: "File has been successfully updated.",
      });

      setEditFile(false);
      handleDialogClose(false);
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={editFile} onOpenChange={(value) => {
      setEditFile(value);
      handleDialogClose(value);
    }}>
      <DialogContent className="max-w-[400px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit File</DialogTitle>
              <DialogDescription>
                Make changes to your file settings
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter file name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {existingFile.type !== ItemType.FILE && (
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
            )}

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

            <div className="space-y-2">
              <FormLabel>Share With</FormLabel>
              <FriendsSearch 
                friendsList={friends}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                onSearch={setSearchTerm}
                isLoading={isLoading.friends}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditFile(false);
                  handleDialogClose(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}