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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useToast } from "@renderer/hooks/use-toast";
import { Box, File, Folder, Link } from "lucide-react";
import { FriendsSearch } from "@renderer/components/friends-search";
import { Textarea } from "@renderer/components/ui/textarea";
import { UserProfile } from "@renderer/types/users";
import { useItems } from "@renderer/hooks/use-items";

const shareFileSchema = z.object({
    description: z
    .string()
    .max(200, { message: "Description must not exceed 200 characters." }),
});

type ShareFileFormValues = z.infer<typeof shareFileSchema>;

interface RequestDialogProps {
  setRequest: React.Dispatch<React.SetStateAction<boolean>>;
  request: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function RequestDialog({ setRequest, request, handleDialogClose }: RequestDialogProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { friends, isLoading } = useItems({ searchTerm });

  const [selectedType, setSelectedType] = React.useState("file");

  const handleSelect = (type) => {
      setSelectedType(type);
  };

  // State for multi-select user sharing
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);

  // React Hook Form setup
  const form = useForm<ShareFileFormValues>({
    resolver: zodResolver(shareFileSchema),
    // defaultValues: { file: undefined },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
    //   form.setValue("file", file, { shouldValidate: true });
    }
  };

  // On Submit
  const onSubmit: SubmitHandler<ShareFileFormValues> = (data) => {
    // const newItem = {
    //   id: `i${Date.now()}`,
    //   createdAt: new Date(),
    //   lastModified: new Date(),
    //   lastOpened: new Date(),
    //   name: data.file?.name,
    //   isStarred: false,
    //   tags: null,
    //   parentFolderId: null,
    //   filePath: data.file?.name,
    //   type: "file",
    //   duration: 1,
    //   format: (data.file?.name.split(".").pop() as FileFormat) || "mp3",
    //   size: data.file?.size ?? 0,
    //   ownerId: "current-user-id",
    //   ownerAvatar: null,
    //   ownerUsername: "current-user",
    //   sharedWith: null,
    //   projectId: null,
    // };

    // addItem(newItem);

    toast({
      title: "Success!",
      description: "File shared successfully.",
      variant: "default",
    });

    form.reset();
    setSelectedUsers([]);
    setRequest(false);
  };

  return (
    <Dialog open={request} onOpenChange={() => handleDialogClose(setRequest)}>
      <DialogContent className="max-w-[400px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Request</DialogTitle>
              <DialogDescription>Ask for access or media</DialogDescription>
            </DialogHeader>
                
            <div className="flex gap-x-4 justify-center pb-2">
                <Button
                    variant={selectedType === "file" ? "default" : "outline"}
                    className={`aspect-square w-full h-20 flex flex-col`}
                    onClick={(event) => {
                        event.preventDefault();
                        handleSelect("file");
                    }}
                >
                    <File className="!h-5 !w-5" />
                    File
                </Button>

                <Button
                    variant={selectedType === "folder" ? "default" : "outline"}
                    className={`aspect-square w-full h-20 flex flex-col`}
                    onClick={(event) => {
                        event.preventDefault();
                        handleSelect("folder");
                    }}
                >
                    <Folder className="!h-5 !w-5" />
                    Folder
                </Button>

                <Button
                    variant={selectedType === "project" ? "default" : "outline"}
                    className={`aspect-square w-full h-20 flex flex-col`}
                    onClick={(event) => {
                        event.preventDefault();
                        handleSelect("project");
                    }}
                >
                    <Box className="!h-5 !w-5" />
                    Project
                </Button>
            </div>
                
            <div>
              <FormLabel>Request from</FormLabel>
              {/* Use the new FriendsSearch component here */}
              <FriendsSearch
                friendsList={friends}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                singleSelect={true}
                onSearch={setSearchTerm}
                isLoading={isLoading.friends}
              />
            </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder="Information regarding your request"
                        className="resize-none"
                        rows={2}
                        {...field}
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
