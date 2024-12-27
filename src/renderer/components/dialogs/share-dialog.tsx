"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Form,
  FormLabel,

} from "../ui/form";
import { useToast } from "@renderer/hooks/use-toast";
import { useItemsStore } from "@renderer/stores/items-store";
import { Link } from "lucide-react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { currentUser, friendsData } from "../home/dummy-data";
import { ChooseFilesDialog } from "./choose-files";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

const shareFileSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file && allowedFormats.includes(file.name.split(".").pop() || ""), {
      message: `File format must be one of: ${allowedFormats.join(", ")}`,
    }),
});

type ShareFileFormValues = z.infer<typeof shareFileSchema>;

interface ShareDialogProps {
  setShare: React.Dispatch<React.SetStateAction<boolean>>;
  share: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function ShareDialog({ setShare, share, handleDialogClose }: ShareDialogProps) {
  const { toast } = useToast();
  const addFileOrFolder = useItemsStore((state) => state.addFileOrFolder);

  // State for multi-select user sharing
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);
  const [chooseFiles, setChooseFiles] = React.useState(false);

  // React Hook Form setup
  const form = useForm<ShareFileFormValues>({
    resolver: zodResolver(shareFileSchema),
    defaultValues: { file: undefined },
  });

  // On Submit
  const onSubmit: SubmitHandler<ShareFileFormValues> = (data) => {
    const newItem = {
      id: `i${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.file?.name,
      isStarred: false,
      tags: null,
      parentFolderId: null,
      filePath: data.file?.name,
      type: ItemType.FILE,
      duration: 1,
      format: (data.file?.name.split(".").pop() as FileFormat) || "mp3",
      size: data.file?.size ?? 0,
      owner: currentUser,
      sharedWith: selectedUsers,
      projectId: null,
      description: null,
      icon: null,
    };

    addFileOrFolder(newItem);

    toast({
      title: "Success!",
      description: "File shared successfully.",
      variant: "default",
    });

    form.reset();
    setSelectedUsers([]);
    setShare(false);
  };

  return (
    <>
      <Dialog open={share} onOpenChange={() => handleDialogClose(setShare)}>
        <DialogContent className="max-w-[400px]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Share</DialogTitle>
              <DialogDescription>Lightning-fast, encrypted file transfers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <FormLabel>Share with</FormLabel>
              {/* Use the new FriendsSearch component here */}
              <FriendsSearch
                friendsList={friendsData}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />

              {/* Choose Files Dialog */}
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setChooseFiles(true)}
              >
                Choose Files
              </Button>

              <div className="flex justify-between pt-2">
                <Button variant="outline" type="button">
                  <Link className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button type="submit">Send</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>

    <ChooseFilesDialog
        open={chooseFiles}
        onOpenChange={setChooseFiles}
      />
    </>
  );
}