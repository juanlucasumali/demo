"use client";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useToast } from "@renderer/hooks/use-toast";

import folderImage from "@renderer/assets/macos-folder.png";
import { Button } from "@renderer/components/ui/button";
import { Textarea } from "@renderer/components/ui/textarea";
import { FriendsSearch } from "@renderer/components/friends-search";
import React from "react";
import { UserProfile } from "@renderer/types/users";
import { currentUser, friendsData } from "../home/dummy-data";
import { DemoItem, ItemType } from "@renderer/types/items";

const projectSchema = z.object({
  icon: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "Icon must be a valid image file (e.g., .png, .jpg, .jpeg).",
    }),
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long." })
    .max(50, { message: "Name must not exceed 50 characters." }),
  username: z
    .string(),
  description: z
    .string()
    .max(200, { message: "Description must not exceed 200 characters." }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface CreateProjectProps {
  createProject: boolean;
  setCreateProject: React.Dispatch<React.SetStateAction<boolean>>;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function CreateProject({ createProject, setCreateProject, handleDialogClose }: CreateProjectProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      icon: undefined,
      name: "",
      username: "",
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("icon", file, { shouldValidate: true });
    }
  };

  const handleSubmit: SubmitHandler<ProjectFormValues> = (data) => {
    const newProject: DemoItem = {
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.name,
      description: data.description,
      isStarred: false,
      tags: null,
      icon: data.icon?.name || "default-folder",
      owner: currentUser,
      sharedWith: [],
      projectId: null,
      parentFolderId: null,
      filePath: "",
      type: ItemType.PROJECT,
      format: null,
      size: null,
      duration: null,
      collectionId: null,
    };

    toast({
      title: "Project Created!",
      description: "Your project has been successfully created.",
      variant: "default",
    });

    form.reset();
    setCreateProject(false);
  };

  const icon = form.watch("icon");
  const iconPreview = icon instanceof File ? URL.createObjectURL(icon) : folderImage;

  return (
    <Dialog open={createProject} onOpenChange={() => handleDialogClose(setCreateProject)}>
      <DialogContent className="max-w-[400px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Create a project</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="icon"
                render={({ }) => (
                  <FormItem>
                    <div className="flex flex-col items-center space-y-2">
                      <img
                        src={iconPreview}
                        alt="Folder or uploaded icon"
                        className="w-32 h-32 object-cover rounded-lg my-2"
                      />
                      {/* Replace Button with a styled label */}
                      <label
                        htmlFor="icon"
                        className="inline-flex items-center justify-center px-4 py-0 text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        Upload Icon
                      </label>
                      <Input
                        id="icon"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="pb-4">
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormLabel>Share with</FormLabel>
              <FriendsSearch
                friendsList={friendsData}
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        id="description"
                        placeholder=""
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button className="w-full" type="submit">Create Project</Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}