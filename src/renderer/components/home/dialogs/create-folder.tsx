"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";

// Validation schema for folder name
const folderSchema = z.object({
  folderName: z
    .string()
    .min(1, { message: "Folder name is required." })
    .max(50, { message: "Folder name must not exceed 50 characters." })
    .regex(/^[a-zA-Z0-9_\- ]+$/, {
      message: "Folder name contains invalid characters. Only letters, numbers, spaces, underscores, and hyphens are allowed.",
    }),
});

type FolderFormValues = z.infer<typeof folderSchema>;

interface CreateFolderProps {
  setCreateFolder: React.Dispatch<React.SetStateAction<boolean>>;
  createFolder: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function CreateFolder({
  setCreateFolder,
  createFolder,
  handleDialogClose,
}: CreateFolderProps) {
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);

  // Initialize React Hook Form with Zod schema
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FolderFormValues>({
    resolver: zodResolver(folderSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const onSubmit: SubmitHandler<FolderFormValues> = (data) => {
    // Create a new folder item
    const newItem = {
      id: `i${Date.now()}`, // Generate unique ID
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.folderName,
      isStarred: false,
      parentFolderId: null,
      filePath: data.folderName, // Dummy path
      type: "folder",
      duration: null,
      format: null,
      ownerId: "current-user-id", // Replace with actual user ID
      ownerAvatar: null, // Replace with actual avatar
      ownerUsername: "current-user", // Replace with actual username
      sharedWith: null,
      tags: null,
      projectId: null,
      size: null,
    };

    addItem(newItem);

    toast({
      title: "Success!",
      description: "Folder created successfully.",
      variant: "default",
    });

    // Reset the form and close dialog
    reset();
    setCreateFolder(false);
  };

  return (
    <Dialog open={createFolder} onOpenChange={() => handleDialogClose(setCreateFolder)}>
      <DialogContent className="max-w-[375px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="pb-4">Create a Folder</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              id="folderName"
              placeholder="Folder Name"
              {...register("folderName")}
            />
            {errors.folderName && (
              <p className="text-red-500 text-sm mt-1">{errors.folderName.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}