import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";

interface CreateFolderProps {
  setCreateFolder: (createFolder: boolean) => void;
}

export function CreateFolder({ setCreateFolder }: CreateFolderProps) {
  const [folderName, setFolderName] = useState<string>("");
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName) {
      alert("Please upload a valid file.");
      return;
    }

    // Create a new item to add to the store
    const newItem = {
      id: "i1023923",
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: folderName,
      isStarred: false,
      parentFolderId: null,
      filePath: folderName, // Dummy path
      type: "folder",
      duration: null,
      format: null,
      ownerId: "current-user-id", // Replace with actual user ID
      ownerAvatar: null, // Replace with actual avatar
      ownerUsername: "current-user", // Replace with actual username
      sharedWith: null,
      tags: null,
      projectId: null,
      size: null
    };

    // Add the new item to the store
    addItem(newItem);
    toast({
        title: "Success!",
        description: "File uploaded successfully.",
        variant: "default",
      })

    // Reset the form
    setFolderName("");
    setCreateFolder(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="pb-4">Create a Folder</DialogTitle>
      </DialogHeader>
      <Input
        id="folderName"
        placeholder="Folder Name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
      />
      <Button type="submit" className="w-full">
        Create
      </Button>
    </form>
  );
};