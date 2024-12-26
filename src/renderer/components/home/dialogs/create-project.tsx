"use client";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../ui/form";
import { useToast } from "@renderer/hooks/use-toast";
import { Project } from "@renderer/types/projects";

import folderImage from "../../../assets/macos-folder.png";
import { Button } from "@renderer/components/ui/button";
import { Textarea } from "@renderer/components/ui/textarea";

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
    const newProject: Project = {
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date(),
      sharedWithMe: null,
      name: data.name,
      description: data.description,
      isStarred: false,
      tags: null,
      icon: data.icon?.name || "default-folder",
      ownerId: "current-user-id",
      ownerAvatar: null,
      ownerUsername: data.username,
      sharedWith: [],
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
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
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
                  <FormItem>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <FormControl>
                      <Input id="name" placeholder="Project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username">Share with</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          @
                        </span>
                        <Input
                          id="username"
                          className="pl-8"
                          placeholder="Enter username"
                          spellCheck="false"
                          {...field}
                        />
                      </div>
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
              <Button type="submit">Create Project</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}