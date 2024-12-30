"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { FileFormat, ItemType } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useUserStore } from "@renderer/stores/user-store";
import { maxFileNameLength } from "@renderer/lib/utils";
import { friendsData } from "../home/dummy-data";
import { useItems } from "@renderer/hooks/use-items";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

// Define the schema using Zod
const fileUploadSchema = z.object({
  file: z
    .custom<File>()
    .refine(
      (file) =>
        file && allowedFormats.includes(file.name.split(".").pop() || ""),
      {
        message: `File format must be one of: ${allowedFormats.join(", ")}`,
      }
    ),
  fileName: z
    .string()
    .min(1, { message: "File name is required." })
    .max(maxFileNameLength, {
      message: `File name must not exceed ${maxFileNameLength} characters.`,
    }),
  tags: z.any().nullable(),
});

type FileUploadFormValues = z.infer<typeof fileUploadSchema>;

interface FileUploadProps {
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  upload: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  location: "project" | "home";
  projectId: string | null;
}

export function UploadFile({
  setUpload,
  upload,
  handleDialogClose,
  location,
  projectId
}: FileUploadProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);
  const currentUser = useUserStore((state) => state.profile);

  const form = useForm<FileUploadFormValues>({
    resolver: zodResolver(fileUploadSchema),
    defaultValues: {
      file: undefined,
      fileName: "",
      tags: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_");
      form.setValue("file", file, { shouldValidate: true });
      form.setValue("fileName", sanitizedFileName, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<FileUploadFormValues> = async (data) => {
    try {
      console.log("selectedFile", selectedFile);
      console.log("currentUser", currentUser);
      if (!selectedFile || !currentUser) return;

      const fileExtension = data.file.name.split(".").pop() as FileFormat;
      const filePath = location === "project" 
        ? `/projects/${projectId}/${data.fileName}.${fileExtension}`
        : `/files/${data.fileName}.${fileExtension}`;

      const newItem = {
        id: undefined,
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: data.fileName,
        isStarred: false,
        tags: data.tags,
        parentFolderId: null,
        filePath: filePath,
        type: ItemType.FILE,
        duration: null,
        format: fileExtension,
        size: data.file.size,
        owner: {
          id: currentUser.id,
          username: currentUser.username,
          description: currentUser.description,
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar
        },
        sharedWith: selectedUsers,
        projectId: location === "project" ? projectId : null,
        description: null,
        icon: null,
        collectionId: null,
      };

      console.log("newItem", newItem);

    addFileOrFolder(newItem);

    toast({
      title: "Success!",
      description: "File uploaded successfully.",
      variant: "default",
    });

    // Reset the form
    form.reset();
    setUpload(false);
    setSelectedFile(null);
    setSelectedUsers([]);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to upload file. Please try again.",
      variant: "destructive",
    });
  }
};

  return (
    <Dialog open={upload} onOpenChange={() => handleDialogClose(setUpload)}>
      <DialogContent className="max-w-[375px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="pb-4">File Upload</DialogTitle>
            </DialogHeader>
            <FormField
              control={form.control}
              name="file"
              render={({ }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={allowedFormats.map((f) => `.${f}`).join(",")}
                      onChange={handleFileChange}
                      className="pt-1.5"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            {location === "home" ? (
              <div>
                <FormLabel>Share with</FormLabel>
                <FriendsSearch
                  friendsList={friendsData}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                This file will be automatically shared with all project members.
              </div>
            )}
            <Button type="submit" className="w-full">
              Upload
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}