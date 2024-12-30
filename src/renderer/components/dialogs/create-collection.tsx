"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { useItems } from "@renderer/hooks/use-items";

// Validation schema for collection name
const collectionSchema = z.object({
  collectionName: z
    .string()
    .min(1, { message: "Collection name is required." })
    .max(50, { message: "Collection name must not exceed 50 characters." })
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CreateCollectionProps {
  setCreateCollection: React.Dispatch<React.SetStateAction<boolean>>;
  createCollection: boolean;
  handleDialogClose: (dialogSetter: React.Dispatch<React.SetStateAction<boolean>>) => void;
  projectId: string;
}

export function CreateCollection({
  setCreateCollection,
  createCollection,
  handleDialogClose,
  projectId
}: CreateCollectionProps) {
  const { toast } = useToast();
  const { addCollection } = useItems({ projectId });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      collectionName: "",
    },
  });

  const onSubmit: SubmitHandler<CollectionFormValues> = async (data) => {
    try {
      await addCollection({
        projectId,
        name: data.collectionName,
      });

      toast({
        title: "Success!",
        description: "Collection created successfully.",
        variant: "default",
      });

      reset();
      setCreateCollection(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={createCollection} onOpenChange={() => handleDialogClose(setCreateCollection)}>
      <DialogContent className="max-w-[375px]">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="pb-4">Create a Collection</DialogTitle>
          </DialogHeader>
          <div>
            <Input
              id="collectionName"
              placeholder="Collection Name"
              {...register("collectionName")}
            />
            {errors.collectionName && (
              <p className="text-red-500 text-sm mt-1">{errors.collectionName.message}</p>
            )}
          </div>
          <Button onClick={handleSubmit(onSubmit)} className="w-full">
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 