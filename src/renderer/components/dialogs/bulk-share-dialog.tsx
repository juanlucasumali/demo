import * as React from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { useToast } from "@renderer/hooks/use-toast";
import { File, FolderOpen, Box, Loader2 } from "lucide-react";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { DemoItem, ItemType } from "@renderer/types/items";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@renderer/lib/utils";
import { useItems } from "@renderer/hooks/use-items";
import { useShare } from "@renderer/hooks/use-share";

interface BulkShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: DemoItem[];
}

export function BulkShareDialog({ 
  open, 
  onOpenChange,
  selectedItems 
}: BulkShareDialogProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Reset selected users when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedUsers([]);
    }
  }, [open]);

  const { friends, isLoading } = useItems({ searchTerm });
  const { shareItems, isSharing } = useShare();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await shareItems({ 
        items: selectedItems, 
        users: selectedUsers 
      });

      toast({
        title: "Success!",
        description: `Shared ${selectedItems.length} items with ${selectedUsers.length} users.`,
        variant: "default",
      });

      setSelectedUsers([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share items. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Group selected items by type
  const groupedItems = React.useMemo(() => {
    const files = selectedItems.filter(item => item.type === ItemType.FILE);
    const folders = selectedItems.filter(item => item.type === ItemType.FOLDER);
    const projects = selectedItems.filter(item => item.type === ItemType.PROJECT);
    return { files, folders, projects };
  }, [selectedItems]);

  const renderItemIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.FILE:
        return <File className="h-4 w-4" />;
      case ItemType.FOLDER:
        return <FolderOpen className="h-4 w-4" />;
      case ItemType.PROJECT:
        return <Box className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Share Multiple Items</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <DialogTitle className="text-sm mb-2">Share with</DialogTitle>
              <FriendsSearch
                selectedUsers={selectedUsers}
                setSelectedUsers={setSelectedUsers}
                onSearch={setSearchTerm}
                friendsList={friends}
              />
            </div>

            <div>
              <DialogTitle className="text-sm mb-2">Selected items</DialogTitle>
              <Tabs defaultValue="files" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger 
                    value="files"
                    disabled={!groupedItems.files.length}
                    className="flex items-center gap-2"
                  >
                    <File className="h-4 w-4" />
                    Files ({groupedItems.files.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="folders"
                    disabled={!groupedItems.folders.length}
                    className="flex items-center gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Folders ({groupedItems.folders.length})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projects"
                    disabled={!groupedItems.projects.length}
                    className="flex items-center gap-2"
                  >
                    <Box className="h-4 w-4" />
                    Projects ({groupedItems.projects.length})
                  </TabsTrigger>
                </TabsList>
                <ScrollArea className="h-[120px] w-full rounded-md border p-2 mt-2">
                  {Object.entries(groupedItems).map(([type, items]) => (
                    <TabsContent key={type} value={type} className="m-0">
                      {items.map((item) => (
                        <div 
                          key={item.id}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md",
                            "hover:bg-muted/50 transition-colors"
                          )}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {renderItemIcon(item.type)}
                            <span className="text-sm truncate block max-w-[200px]">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  ))}
                </ScrollArea>
              </Tabs>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                type="submit"
                disabled={selectedUsers.length === 0 || isSharing}
              >
                {isSharing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sharing...
                  </>
                ) : (
                  'Share'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 