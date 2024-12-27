"use client";

import { useState } from "react";
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
import { useItemsStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { DemoItem } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { friendsData } from "../home/dummy-data";
import { maxFileNameLength } from "@renderer/lib/utils";

// Schema and validation rules remain the same
const editFileSchema = z.object({
    fileName: z
    .string()
    .min(1, { message: "File name is required." })
    .max(maxFileNameLength, {
      message: `File name must not exceed ${maxFileNameLength} characters.`,
    }),
  tags: z.any().nullable(),
});

type EditFileFormValues = z.infer<typeof editFileSchema>;

interface EditFileDialogProps {
  editFile: boolean;
  setEditFile: React.Dispatch<React.SetStateAction<boolean>>;
  existingFile: DemoItem;
  handleDialogClose: (value: boolean) => void;
}

export function EditFileDialog({
  editFile,
  setEditFile,
  existingFile,
  handleDialogClose,
}: EditFileDialogProps) {
  const { toast } = useToast();
  const updateItem = useItemsStore((state) => state.updateItem);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    existingFile.sharedWith || []
  );

  const form = useForm<EditFileFormValues>({
    resolver: zodResolver(editFileSchema),
    defaultValues: {
      fileName: existingFile.name,
      tags: existingFile.tags,
    },
  });

  const onSubmit = async (data: EditFileFormValues) => {

    console.log(selectedUsers)
    try {
      await updateItem({
        ...existingFile,
        name: data.fileName,
        tags: data.tags,
        lastModified: new Date(),
        sharedWith: selectedUsers,
      });

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
                owner={existingFile.owner} 
                friendsList={friendsData}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
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