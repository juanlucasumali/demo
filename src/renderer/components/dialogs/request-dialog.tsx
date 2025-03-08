"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { Box, File, Folder } from "lucide-react";
import { FriendsSearch } from "@renderer/components/friends-search";
import { Textarea } from "@renderer/components/ui/textarea";
import { UserProfile } from "@renderer/types/users";
import { useItems } from "@renderer/hooks/use-items";
import { useUserStore } from "@renderer/stores/user-store";
import { useNotifications } from "@renderer/hooks/use-notifications";

const requestSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Description is required." })
    .max(200, { message: "Description must not exceed 200 characters." }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestDialogProps {
  setRequest: React.Dispatch<React.SetStateAction<boolean>>;
  request: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function RequestDialog({ setRequest, request, handleDialogClose }: RequestDialogProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { friends, isLoading } = useItems({ searchTerm });
  const [selectedType, setSelectedType] = React.useState<'file' | 'folder' | 'project'>('file');
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);
  const { user } = useUserStore();
  const { addRequestNotification } = useNotifications();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleSelect = (type: 'file' | 'folder' | 'project') => {
    setSelectedType(type);
  };

  const onSubmit = async (data: RequestFormValues) => {
    if (!user || selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user to send the request to.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create request notification for each selected user
      await Promise.all(
        selectedUsers.map(selectedUser =>
          addRequestNotification({
            fromUserId: user.id,
            toUserId: selectedUser.id,
            requestType: selectedType,
            requestDescription: data.description
          })
        )
      );

      toast({
        title: "Success!",
        description: "Request sent successfully.",
        variant: "default",
      });

      form.reset();
      setSelectedUsers([]);
      setRequest(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
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
                type="button"
                variant={selectedType === "file" ? "default" : "outline"}
                className="aspect-square w-full h-20 flex flex-col"
                onClick={() => handleSelect("file")}
              >
                <File className="!h-5 !w-5" />
                File
              </Button>

              <Button
                type="button"
                variant={selectedType === "folder" ? "default" : "outline"}
                className="aspect-square w-full h-20 flex flex-col"
                onClick={() => handleSelect("folder")}
              >
                <Folder className="!h-5 !w-5" />
                Folder
              </Button>

              <Button
                type="button"
                variant={selectedType === "project" ? "default" : "outline"}
                className="aspect-square w-full h-20 flex flex-col"
                onClick={() => handleSelect("project")}
              >
                <Box className="!h-5 !w-5" />
                Project
              </Button>
            </div>
                
            <div>
              <FormLabel>Request from</FormLabel>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
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

            <div className="flex justify-end pt-2">
              <Button 
                type="submit"
                disabled={selectedUsers.length === 0}
              >
                Send Request
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
