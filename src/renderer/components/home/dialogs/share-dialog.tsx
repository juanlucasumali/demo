import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { FileFormat } from "@renderer/types/items";
import { FileTags } from "@renderer/types/tags";
import { useToast } from "@renderer/hooks/use-toast";
import { Label } from "@renderer/components/ui/label";
import { Link } from "lucide-react";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

interface ShareDialogProps {
  setShare: (upload: boolean) => void;
  share: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function ShareDialog({ setShare, share, handleDialogClose }: ShareDialogProps) {
  const [username, setUsername] = useState<string>('@');
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
    setShare(false);
  };

  return (
    <Dialog open={share} onOpenChange={() => handleDialogClose(setShare)}>
      <DialogContent className="max-w-[375px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Share</DialogTitle>
            <DialogDescription>
              Lightning-fast, encrypted file transfers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="username" >
              Send to
            </Label>
            <Input
              id="username"
              className="col-span-3 select-none"
              value={username.startsWith('@') ? username : `@${username}`}
              onChange={(e) => {
                const value = e.target.value;
                // Ensure the @ is always present
                setUsername(value.startsWith('@') ? value : `@${value.replace(/^@/, '')}`);
              }}
            />
          <Button variant={'secondary'} className="max-w-32"> Choose Files </Button>
          </div>
          <DialogFooter>
            <Button variant={'outline'}> <Link/> Copy Link </Button>
            <Button type='submit'> Send </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
