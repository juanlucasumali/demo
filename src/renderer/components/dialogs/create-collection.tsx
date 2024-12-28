"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useItemsStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";
import { currentUser } from "../home/dummy-data";
import { UserProfile } from "@renderer/types/users";
import { useState } from "react";
import { ItemType } from "@renderer/types/items";

// Validation schema for collection name
const collectionSchema = z.object({
  collectionName: z
    .string()
    .min(1, { message: "Collection name is required." })
    .max(50, { message: "Collection name must not exceed 50 characters." })
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CreateCollectionProps {
  setCreateCollection: React.Dispatch<React.SetStateAction<boolean>>;
  createCollection: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function CreateCollection({
  setCreateCollection,
  createCollection,
  handleDialogClose,
}: CreateCollectionProps) {
  const { toast } = useToast();
  const addFileOrFolder = useItemsStore((state) => state.addFileOrFolder);
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      collectionName: "",
    },
  });

  const onSubmit: SubmitHandler<CollectionFormValues> = (data) => {
    const newItem = {
      id: `collection-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.collectionName,
      isStarred: false,
      parentFolderId: null,
      filePath: data.collectionName,
      type: ItemType.FOLDER, // Using FOLDER type for now
      duration: null,
      format: null,
      owner: currentUser,
      sharedWith: selectedUsers,
      tags: null,
      projectId: null,
      size: null,
      description: null,
      icon: null,
      collectionId: null,
    };

    addFileOrFolder(newItem);

    toast({
      title: "Success!",
      description: "Collection created successfully.",
      variant: "default",
    });

    reset();
    setCreateCollection(false);
    setSelectedUsers([]);
  };

  return (
    <Dialog open={createCollection} onOpenChange={() => handleDialogClose(setCreateCollection)}>
      <DialogContent className="max-w-[375px]">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="pb-4">Create a Collection</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              id="collectionName"
              placeholder="Collection Name"
              {...register("collectionName")}
            />
            {errors.collectionName && (
              <p className="text-red-500 text-sm mt-1">{errors.collectionName.message}</p>
            )}
          </div>
          <Button onClick={handleSubmit(onSubmit)} className="w-full">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 