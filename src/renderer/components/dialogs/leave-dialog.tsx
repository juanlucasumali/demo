import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { DemoItem } from "@renderer/types/items";
import { UseMutateFunction } from "@tanstack/react-query";
import { useToast } from "@renderer/hooks/use-toast";
import { useUserStore } from "@renderer/stores/user-store";

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: DemoItem;
  updateItem: UseMutateFunction<void, Error, { updatedItem: DemoItem, originalItem: DemoItem }, unknown>;
  handleDialogClose: () => void;
}

export function LeaveDialog({
  open,
  onOpenChange,
  item,
  updateItem,
  handleDialogClose,
}: LeaveDialogProps) {
  const { toast } = useToast();
  const currentUser = useUserStore((state) => state.user);

  const handleLeave = async () => {
    try {
      // Create updated item with current user removed from sharedWith
      const updatedItem = {
        ...item,
        sharedWith: (item.sharedWith || []).filter(user => user.id !== currentUser?.id)
      };

      await updateItem({ updatedItem, originalItem: item });

      toast({
        title: "Left successfully",
        description: <>You have removed your access to <span className="font-bold">{item.name}</span>.</>,
      });

      handleDialogClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove access. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Confirm Leave</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove your access to <span className="font-bold">{item.name}</span>? 
            You won't be able to access it unless someone shares it with you again.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 