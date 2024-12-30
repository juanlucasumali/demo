"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { DemoItem } from "@renderer/types/items";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { friendsData } from "../home/dummy-data";
import { maxFileNameLength } from "@renderer/lib/utils";
import { useItems } from "@renderer/hooks/use-items";

const editProjectSchema = z.object({
  projectName: z
    .string()
    .min(1, { message: "Project name is required." })
    .max(maxFileNameLength, {
      message: `Project name must not exceed ${maxFileNameLength} characters.`,
    }),
  description: z.string().optional(),
  tags: z.any().nullable(),
});

type EditProjectFormValues = z.infer<typeof editProjectSchema>;

interface EditProjectDialogProps {
  editProject: boolean;
  setEditProject: React.Dispatch<React.SetStateAction<boolean>>;
  existingProject: DemoItem;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function EditProjectDialog({
  editProject,
  setEditProject,
  existingProject,
  handleDialogClose,
}: EditProjectDialogProps) {
  const { toast } = useToast();
  const { updateItem } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    existingProject.sharedWith || []
  );

  const form = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      projectName: existingProject.name,
      description: existingProject.description || "",
      tags: existingProject.tags,
    },
  });

  const onSubmit = async (data: EditProjectFormValues) => {
    try {
      await updateItem({
        ...existingProject,
        name: data.projectName,
        description: data.description || null,
        tags: data.tags,
        lastModified: new Date(),
        sharedWith: selectedUsers,
      });

      toast({
        title: "Changes saved",
        description: "Project has been successfully updated.",
      });

      setEditProject(false);
      handleDialogClose(setEditProject);
      setSelectedUsers([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={editProject} onOpenChange={(value) => {
      setEditProject(value);
      handleDialogClose(setEditProject);
    }}>
      <DialogContent className="max-w-[400px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Make changes to your project settings
              </DialogDescription>
            </DialogHeader>

            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter project description (optional)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <FileTagsDropdown
                      tags={field.value}
                      setTags={(tags) => form.setValue("tags", tags)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Share With</FormLabel>
              <FriendsSearch
                owner={existingProject.owner}
                friendsList={friendsData}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditProject(false);
                  handleDialogClose(setEditProject);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
