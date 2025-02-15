"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { useState } from "react";
import { FileFormat, ItemType } from "@renderer/types/items";
import { useItems } from "@renderer/hooks/use-items";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { useUserStore } from "@renderer/stores/user-store";
import { Loader2 } from "lucide-react";
import { Progress } from "@renderer/components/ui/progress";

const uploadFilesSchema = z.object({
  files: z.custom<FileList>().optional()
});

type UploadFilesFormValues = z.infer<typeof uploadFilesSchema>;

interface UploadFilesProps {
  isOpen: boolean;
  onClose: () => void;
  location?: 'project' | 'home' | 'collection';
  projectId?: string | null;
  parentFolderId?: string | null;
  collectionId?: string | null;
  sharedWith: UserProfile[] | null;
}

export function UploadFiles({
  isOpen,
  onClose,
  location = 'home',
  projectId = null,
  parentFolderId = null,
  collectionId = null,
  sharedWith,
}: UploadFilesProps) {
  const { toast } = useToast();
  const { addFileOrFolder } = useItems();
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>(
    sharedWith || []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { friends, isLoading } = useItems({ searchTerm });  
  const currentUser = useUserStore((state) => state.profile);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const form = useForm<UploadFilesFormValues>({
    resolver: zodResolver(uploadFilesSchema),
    defaultValues: {
      files: undefined
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  };

  const onSubmit: SubmitHandler<UploadFilesFormValues> = async (data) => {
    if (!currentUser) return;
      
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setTotalFiles(selectedFiles.length);
    setProcessedFiles(0);
    setUploadProgress(0);

    let successfulUploads = 0;

    try {
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        const newItem = {
        createdAt: new Date(),
        lastModified: new Date(),
        lastOpened: new Date(),
        name: file.name,
        isStarred: false,
        parentFolderIds: parentFolderId ? [parentFolderId] : [],
        filePath: null,
        type: ItemType.FILE,
        duration: 0,
        format: fileExtension as FileFormat,
        owner: currentUser,
        sharedWith: selectedUsers,
        tags: null,
        projectIds: location === 'project' || location === 'collection' ? [projectId!] : [],
        size: file.size,
        description: null,
        icon: null,
        collectionIds: location === 'collection' ? [collectionId!] : [],
        };

        try {
        const fileContent = await file.arrayBuffer();
        await new Promise<void>((resolve, reject) => {
            addFileOrFolder({ 
            item: newItem, 
            sharedWith: selectedUsers.length > 0 ? selectedUsers : undefined,
            fileContent
            }, {
            onSuccess: () => {
                successfulUploads++;
                setProcessedFiles(successfulUploads);
                setUploadProgress((successfulUploads / selectedFiles.length) * 100);
                resolve();
            },
            onError: (error) => reject(error)
            });
        });
        } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        toast({
            title: `Failed to upload ${file.name}`,
            description: "The upload will continue with remaining files",
            variant: "destructive",
            duration: 3000
        });
        }
    }

    toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${successfulUploads} of ${selectedFiles.length} files`,
        variant: "default",
    });

    form.reset();
    setSelectedFiles([]);
    setSelectedUsers([]);
    onClose();
    } catch (error) {
    console.error('Upload failed:', error);
    toast({
        title: "Upload Failed",
        description: "Some files failed to upload",
        variant: "destructive",
    });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setProcessedFiles(0);
      setTotalFiles(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[375px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>

              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormLabel>Files</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="pt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {location === 'home' && (
              <div>
                <FormLabel>Share with</FormLabel>
                <FriendsSearch
                  friendsList={friends}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  onSearch={setSearchTerm}
                  isLoading={isLoading.friends}
                />
              </div>
            )}

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground">
                  Uploading: {processedFiles} / {totalFiles} files
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 