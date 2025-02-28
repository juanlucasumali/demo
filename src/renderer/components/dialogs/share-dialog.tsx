"use client";

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
import { File, FolderOpen, Link, Box, X, Loader2 } from "lucide-react";
import { FriendsSearch } from "@renderer/components/friends-search";
import { UserProfile } from "@renderer/types/users";
import { SelectFilesDialog } from "./select-files";
import { DemoItem, ItemType } from "@renderer/types/items";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@renderer/lib/utils";
import { useItems } from "@renderer/hooks/use-items";
import { useShare } from "@renderer/hooks/use-share";
import { useEffect } from "react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialItem?: DemoItem;
}

export function ShareDialog({ 
  open, 
  onOpenChange,
  initialItem 
}: ShareDialogProps) {
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = React.useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [chooseFiles, setChooseFiles] = React.useState(false);
  const [selectedItems, setSelectedItems] = React.useState<DemoItem[]>(
    initialItem ? [initialItem] : []
  );
  const { shareItems, unshareItems, isSharing } = useShare();
  const [originalUsers, setOriginalUsers] = React.useState<UserProfile[]>([]);

  useEffect(() => {
    if (open) {
      setSelectedItems(initialItem ? [initialItem] : []);
      const initialUsers = initialItem?.sharedWith || [];
      setSelectedUsers(initialUsers);
      setOriginalUsers(initialUsers);
    }
  }, [open, initialItem]);

  // Replace useItems with just what we need
  const { friends, isLoading } = useItems({ searchTerm });

  const handleConfirmSelection = (items: DemoItem[]) => {
    setSelectedItems(items);
  };

  const handleRemoveUser = async (userId: string) => {
    const userToRemove = selectedUsers.find(u => u.id === userId);
    if (!userToRemove) return;

    try {
      await unshareItems({ 
        items: selectedItems, 
        users: [userToRemove]
      });

      setSelectedUsers(prev => prev.filter(u => u.id !== userId));
      setOriginalUsers(prev => prev.filter(u => u.id !== userId));

      toast({
        title: "Success",
        description: `Removed ${userToRemove.name} from shared items.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove user from shared items.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get new users that weren't in the original list
      const newUsers = selectedUsers.filter(
        user => !originalUsers.find(ou => ou.id === user.id)
      );

      if (newUsers.length > 0) {
        await shareItems({ 
          items: selectedItems, 
          users: newUsers
        });
      }

      toast({
        title: "Success!",
        description: `Updated sharing settings.`,
        variant: "default",
      });

      setSelectedItems([]);
      setSelectedUsers([]);
      setOriginalUsers([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sharing settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handledeleteItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Share</DialogTitle>
              <DialogDescription>Lightning-fast, encrypted file transfers.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <DialogTitle className="text-sm mb-2">Share with</DialogTitle>
                <FriendsSearch
                  friendsList={friends}
                  selectedUsers={selectedUsers}
                  setSelectedUsers={setSelectedUsers}
                  onSearch={setSearchTerm}
                  isLoading={isLoading.friends}
                  onRemove={handleRemoveUser}
                />
              </div>

              {selectedItems.length > 0 && (
                <div>
                  <DialogTitle className="text-sm mb-2">{initialItem ? `Selected Item` : `Selected Items`}</DialogTitle>
                  {initialItem ? (
                    // Single item view
                    <div className="w-full rounded-md border p-2">
                      <div 
                        className={cn(
                          "flex items-center justify-between gap-2 p-2 rounded-md",
                          "bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {renderItemIcon(initialItem.type)}
                          <span className="text-sm truncate block max-w-[300px]">
                            {initialItem.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Multiple items view with tabs (existing code)
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
                                  "flex items-center justify-between gap-2 p-2 rounded-md group",
                                  "hover:bg-muted/50 transition-colors"
                                )}
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {renderItemIcon(item.type)}
                                  <span className="text-sm truncate block max-w-[200px]">
                                    {item.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handledeleteItem(item.id)}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Remove {item.name}</span>
                                </Button>
                              </div>
                            ))}
                          </TabsContent>
                        ))}
                      </ScrollArea>
                    </Tabs>
                  )}
                </div>
              )}

              {!initialItem && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setChooseFiles(true)}
                >
                  {selectedItems.length > 0 ? "Add more files" : "Choose files"}
                </Button>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline" type="button">
                  <Link className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button 
                  type="submit"
                  disabled={selectedItems.length === 0 || selectedUsers.length === 0 || isSharing}
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {!initialItem && (
        <SelectFilesDialog
          open={chooseFiles}
          onOpenChange={setChooseFiles}
          onConfirm={handleConfirmSelection}
          initialSelections={selectedItems}
          location="home"
        />
      )}
    </>
  );
}