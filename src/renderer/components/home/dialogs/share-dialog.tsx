"use client";

import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import FileTagsDropdown from "./file-tags-dropdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { useDataStore } from "@renderer/stores/items-store";
import { useToast } from "@renderer/hooks/use-toast";
import { Label } from "@renderer/components/ui/label";
import { Link } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../../ui/form";
import { FileFormat } from "@renderer/types/items";
import { FileTag } from "@renderer/types/tags";

const allowedFormats = ["mp3", "wav", "mp4", "flp", "als", "zip"];

const shareFileSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Username is required." })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  file: z
    .custom<File>()
    .refine(
      (file) => file && allowedFormats.includes(file.name.split(".").pop() || ""),
      {
        message: `File format must be one of: ${allowedFormats.join(", ")}`,
      }
    ),
  tags: z.any().nullable(),
});

type ShareFileFormValues = z.infer<typeof shareFileSchema>;

interface ShareDialogProps {
  setShare: (upload: boolean) => void;
  share: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
}

export function ShareDialog({
  setShare,
  share,
  handleDialogClose,
}: ShareDialogProps) {
  const { toast } = useToast();
  const addItem = useDataStore((state) => state.addItem);

  const form = useForm<ShareFileFormValues>({
    resolver: zodResolver(shareFileSchema),
    defaultValues: {
      username: "",
      file: null,
      tags: null,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<ShareFileFormValues> = (data) => {
    const newItem = {
      id: `i${Date.now()}`, // Generate unique ID
      createdAt: new Date(),
      lastModified: new Date(),
      lastOpened: new Date(),
      name: data.file.name,
      isStarred: false,
      tags: data.tags as FileTag,
      parentFolderId: null,
      filePath: data.file.name,
      type: "file",
      duration: 1,
      format: data.file.name.split(".").pop() as FileFormat,
      size: data.file.size,
      ownerId: "current-user-id",
      ownerAvatar: null,
      ownerUsername: data.username,
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
    setShare(false);
  };

  return (
    <Dialog open={share} onOpenChange={() => handleDialogClose(setShare)}>
      <DialogContent className="max-w-[375px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Share</DialogTitle>
              <DialogDescription>
                Lightning-fast, encrypted file transfers.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="username">Send to</FormLabel>
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
            </div>
            <DialogFooter>
              <Button variant={"outline"} type="button">
                <Link /> Copy Link
              </Button>
              <Button type="submit">Send</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}