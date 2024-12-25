"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { FileFormat } from "@renderer/types/items";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];
const maxFileNameLength = 100; // Set maximum length for file name
const fileNamePattern = /^[a-zA-Z0-9_\-\.]+$/; // Allow only alphanumeric, underscores, hyphens, and dots

// Define the schema using Zod
const uploadFileSchema = z.object({
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
    })
    .regex(fileNamePattern, {
      message: "File name contains invalid characters. Only letters, numbers, underscores, hyphens, and dots are allowed.",
    }),
  tags: z.any().nullable(),
});

type UploadFileFormValues = z.infer<typeof uploadFileSchema>;

interface UploadFileProps {
  setUpload: React.Dispatch<React.SetStateAction<boolean>>;
  upload: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function UploadFile({
  setUpload,
  upload,
  handleDialogClose,
}: UploadFileProps) {
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Initialize react-hook-form with zod schema
  const form = useForm<UploadFileFormValues>({
    resolver: zodResolver(uploadFileSchema),
    defaultValues: {
      file: null,
      fileName: "",
      tags: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, "_"); // Replace invalid characters
      form.setValue("file", file, { shouldValidate: true });
      form.setValue("fileName", sanitizedFileName, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<UploadFileFormValues> = (data) => {
    // Create a new item to add to the store
    const newItem = {
      id: `i${Date.now()}`, // Generate unique ID
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.fileName,
      isStarred: false,
      tags: data.tags,
      parentFolderId: null,
      filePath: data.file.name,
      type: "file",
      duration: 1,
      format: data.file.name.split(".").pop() as FileFormat,
      size: data.file.size,
      ownerId: "current-user-id",
      ownerAvatar: null,
      ownerUsername: "current-user",
      sharedWith: null,
      projectId: null,
    };

    addItem(newItem);

    toast({
      title: "Success!",
      description: "File uploaded successfully.",
      variant: "default",
    });

    // Reset the form
    form.reset();
    setUpload(false);
    setSelectedFile(null);
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
              render={({ field }) => (
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
                  <FormLabel >File Name</FormLabel>
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
            <Button type="submit" className="w-full">
              Upload
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}