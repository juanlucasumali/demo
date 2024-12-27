"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useItemsStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";
import { currentUser, friendsData } from "../home/dummy-data";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState } from "react";
import { ItemType } from "@renderer/types/items";

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
  const addItem = useItemsStore((state) => state.addItem);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);

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
      type: ItemType.FOLDER,
      duration: null,
      format: null,
      owner: currentUser,
      sharedWith: selectedUsers,
      tags: null,
      projectId: null,
      size: null,
      description: null,
      icon: null,
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
    setSelectedUsers([]);
  };

  return (
    <Dialog open={createFolder} onOpenChange={() => handleDialogClose(setCreateFolder)}>
      <DialogContent className="max-w-[375px]">
        <div className="space-y-4">
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
          <div >
            <DialogHeader>Share with</DialogHeader>
            <FriendsSearch
              friendsList={friendsData}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
            />
          </div>
          <Button onClick={handleSubmit(onSubmit)} className="w-full">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}