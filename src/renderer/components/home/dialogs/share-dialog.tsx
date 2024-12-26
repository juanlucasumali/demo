"use client";

import * as React from "react";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { useToast } from "@renderer/hooks/use-toast";
import { useDataStore } from "@renderer/stores/items-store";
import { Link } from "lucide-react";
import { FileFormat } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";

// Example friend data
const friendsList = [
  { id: "1", username: "lisa", name: "Lisa Simpson", avatarFallback: "LS" },
  { id: "2", username: "bart", name: "Bart Simpson", avatarFallback: "BS" },
  { id: "3", username: "maggie", name: "Maggie Simpson", avatarFallback: "MS" },
  { id: "4", username: "milhouse", name: "Milhouse Van Houten", avatarFallback: "MH" },
  { id: "5", username: "moe", name: "Moe Szyslak", avatarFallback: "M" },
  { id: "6", username: "skinner", name: "Seymour Skinner", avatarFallback: "SS" },
];

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

const shareFileSchema = z.object({
  file: z
    .custom<File>()
    .refine((file) => file && allowedFormats.includes(file.name.split(".").pop() || ""), {
      message: `File format must be one of: ${allowedFormats.join(", ")}`,
    }),
});

type ShareFileFormValues = z.infer<typeof shareFileSchema>;

type User = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  avatarFallback?: string;
};

interface ShareDialogProps {
  setShare: React.Dispatch<React.SetStateAction<boolean>>;
  share: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function ShareDialog({ setShare, share, handleDialogClose }: ShareDialogProps) {
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);

  // State for multi-select user sharing
  const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);

  // React Hook Form setup
  const form = useForm<ShareFileFormValues>({
    resolver: zodResolver(shareFileSchema),
    defaultValues: { file: undefined },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file, { shouldValidate: true });
    }
  };

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
      type: "file",
      duration: 1,
      format: (data.file?.name.split(".").pop() as FileFormat) || "mp3",
      size: data.file?.size ?? 0,
      ownerId: "current-user-id",
      ownerAvatar: null,
      ownerUsername: "current-user",
      sharedWith: null,
      projectId: null,
    };

    addItem(newItem);

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
                friendsList={friendsList}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />

              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="file">File</FormLabel>
                    <FormControl>
                      <Input
                        id="file"
                        type="file"
                        accept={allowedFormats.map((f) => `.${f}`).join(",")}
                        onChange={handleFileChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
  );
}