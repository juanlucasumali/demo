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
  DialogDescription,
} from "@renderer/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useToast } from "@renderer/hooks/use-toast";

import folderImage from "@renderer/assets/macos-folder.png";
import { Button } from "@renderer/components/ui/button";
import { FriendsSearch } from "@renderer/components/friends-search";
import React from "react";
import { UserProfile } from "@renderer/types/users";
import { DemoItem, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@renderer/stores/user-store";
import { useDialogState } from "@renderer/hooks/use-dialog-state";
import { DialogManager } from "../dialog-manager";

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
  const [searchTerm, setSearchTerm] = React.useState('');
  const currentUser = useUserStore((state) => state.profile);
  const dialogState = useDialogState();

  const { addProject, isLoading, friends, projectCount } = useItems({ searchTerm });

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

  const handleSubmit: SubmitHandler<ProjectFormValues> = async (data) => {
    try {
      // Check project count for free users
      if (currentUser?.subscription === 'free' && projectCount >= 3) {
        console.log('Free user has reached maximum project limit (3)');
        setShowLimitReached(true);
        return;
      }

      const newProject: Omit<DemoItem, 'id'> = {
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: data.name,
        description: data.description,
        isStarred: false,
        tags: null,
        icon: data.icon?.name || "default-folder",
        owner: currentUser,
        sharedWith: selectedUsers,
        projectIds: [],
        parentFolderIds: [],
        filePath: "",
        type: ItemType.PROJECT,
        format: null,
        size: null,
        duration: null,
        collectionIds: [],
      };

      await addProject({ item: newProject, sharedWith: selectedUsers });

      toast({
        title: "Success!",
        description: selectedUsers.length > 0
          ? `Project created!`
          : "Project created successfully.",
        variant: "default",
      });

      form.reset();
      setSelectedUsers([]);
      setCreateProject(false);
      handleDialogClose(setCreateProject);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const icon = form.watch("icon");
  const iconPreview = icon instanceof File ? URL.createObjectURL(icon) : folderImage;
  const [showLimitReached, setShowLimitReached] = React.useState(false);

  const renderCreateProjectContent = () => {
    return (
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
              friendsList={friends}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              onSearch={setSearchTerm}
              isLoading={isLoading.friends}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-2">
              <Button 
                className="w-full" 
                type="submit"
                disabled={isLoading.addProject}
              >
                {isLoading.addProject ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    );
  };

  const renderLimitReachedContent = () => {
    return (
      <>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-base font-large">Project Limit Reached</DialogTitle>
          <DialogDescription>
            You’ve exceeded the maximum limit for the free tier. Upgrade for unlimited projects!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button 
            onClick={() => dialogState.subscription.onOpen()}
            className="w-full"
          >
            View Plans
          </Button>
        </div>
        <DialogManager
          {...dialogState}
          isLoading={{ deleteItem: false, updateItem: false }}
        />
      </>
    );
  };

  return (
    <Dialog open={createProject} onOpenChange={() => handleDialogClose(setCreateProject)}>
      <DialogContent className="max-w-[400px]">
        {showLimitReached 
          ? renderLimitReachedContent()
          : renderCreateProjectContent()
        }
      </DialogContent>
    </Dialog>
  );
}