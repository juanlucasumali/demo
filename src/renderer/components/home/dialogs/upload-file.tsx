import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import { DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { FileFormat } from "@renderer/types/items";
import { FileTags } from "@renderer/types/tags";
import { useToast } from "@renderer/hooks/use-toast";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

interface UploadFileProps {
  setUpload: (upload: boolean) => void;
}

export function UploadFile({ setUpload }: UploadFileProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [tags, setTags] = useState<FileTags | null>({
    fileType: null,
    status: null,
    instruments: [],
    versions: []
  });
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split(".").pop();
      if (fileExtension && allowedFormats.includes(fileExtension)) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
      } else {
        alert(`Invalid file format. Allowed formats: ${allowedFormats.join(", ")}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a valid file.");
      return;
    }

    // Create a new item to add to the store
    const newItem = {
      id: "i1023923",
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: fileName || file.name,
      isStarred: false,
      tags: tags, // Add logic for tags if needed
      parentFolderId: null,
      filePath: file.name, // Dummy path
      type: "file",
      duration: 1,
      format: file.name.split(".").pop() as FileFormat,
      size: file.size,
      ownerId: "current-user-id", // Replace with actual user ID
      ownerAvatar: null, // Replace with actual avatar
      ownerUsername: "current-user", // Replace with actual username
      sharedWith: null,
      projectId: null,
    };

    // Add the new item to the store
    addItem(newItem);
    toast({
        title: "Success!",
        description: "File uploaded successfully.",
        variant: "default",
      })

    // Reset the form
    setFile(null);
    setFileName("");
    setUpload(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="pb-4">File Upload</DialogTitle>
      </DialogHeader>
      <Input
        type="file"
        id="file"
        accept={allowedFormats.map((f) => `.${f}`).join(",")}
        onChange={handleFileChange}
        className="pt-1.5"
      />
      <Input
        id="fileName"
        placeholder="File Name"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
      />
      <FileTagsDropdown tags={tags} setTags={setTags}/>
      <Button type="submit" className="w-full">
        Upload
      </Button>
    </form>
  );
};