"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Button } from "@renderer/components/ui/button"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@renderer/components/ui/tabs"
import { createColumns } from "@renderer/components/data-table/columns"
import { DataTable } from "@renderer/components/data-table/data-table"
import { DemoItem } from "@renderer/types/items"
import { useState, useEffect } from "react"
import { useItems } from "@renderer/hooks/use-items"
import { ChevronLeft, Folder, ChevronRight, Loader2} from "lucide-react"
import { useFolderNavigationStore } from '@renderer/stores/folder-navigation-store'
import { useToast } from "@renderer/hooks/use-toast"

interface SelectFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedItems: DemoItem[]) => void
  initialSelections?: DemoItem[]
  location: "home" | "project" | "save-items" | "collection"
  projectItem?: DemoItem
  collectionId?: string
}

export function SelectFilesDialog({
  open,
  onOpenChange,
  onConfirm,
  initialSelections = [],
  location,
  projectItem,
  collectionId
}: SelectFilesDialogProps) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const { filesAndFolders, projects, currentFolder, isLoading, addToProject, addToCollection } = useItems({ parentFolderId: currentFolderId || undefined })
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>(initialSelections);
  const [activeTab, setActiveTab] = useState<string>("home");
  
  const { addFolder, goBack, goForward, canGoBack, canGoForward, reset, initializeHistory } = useFolderNavigationStore();
  const { toast } = useToast();

  // Initialize history when dialog opens
  useEffect(() => {
    if (open) {
      initializeHistory();
    } else {
      setCurrentFolderId(null);
      reset();
    }
  }, [open, initializeHistory, reset]);

  // Update selected items when initialSelections changes
  useEffect(() => {
    setSelectedItems(initialSelections);
  }, [initialSelections]);

  // Helper function to check if an item is in initialSelections
  const isItemSelected = (item: DemoItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  // When setting selected items, preserve initial selections
  const handleSelectionChange = (items: DemoItem[]) => {
    const currentViewIds = new Set(filesAndFolders.map(item => item.id));
    
    // Keep previously selected items that are not in current view
    const preservedSelections = selectedItems.filter(item => !currentViewIds.has(item.id));
    
    // Filter out any duplicates when combining preserved and new selections
    const newSelections = [...preservedSelections];
    items.forEach(item => {
      if (!newSelections.some(existing => existing.id === item.id)) {
        newSelections.push(item);
      }
    });
    
    setSelectedItems(newSelections);
  };

  const handleConfirm = async () => {
    try {
      console.log('handleConfirm called with:', {
        location,
        projectItem,
        collectionId,
        selectedItems
      });

      if (location === "project" && projectItem) {
        console.log('Adding to project:', {
          projectId: projectItem.id,
          itemCount: selectedItems.length
        });
        
        await addToProject({ 
          items: selectedItems, 
          projectId: projectItem.id 
        });
        
        console.log('Successfully added to project');
      } 
      else if (location === "collection" && projectItem?.id && collectionId) {
        console.log('Adding to collection:', {
          collectionId,
          projectId: projectItem.id,
          itemCount: selectedItems.length
        });

        await addToCollection({ 
          items: selectedItems, 
          collectionId: collectionId,
          projectId: projectItem.id
        });

        console.log('Successfully added to collection');
      } else {
        console.log('No matching condition:', {
          location,
          hasProjectItem: !!projectItem,
          hasProjectId: !!projectItem?.id,
          hasCollectionId: !!collectionId
        });
      }
      
      onConfirm(selectedItems);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add items:', error);
      toast({
        title: "Error",
        description: "Failed to add items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (item: DemoItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
      addFolder(item.id);
    }
  };

  const handleBackClick = () => {
    const previousFolderId = goBack();
    setCurrentFolderId(previousFolderId);
  };

  const handleForwardClick = () => {
    const nextFolderId = goForward();
    setCurrentFolderId(nextFolderId);
  };

  const getButtonText = () => {
    if (location === "save-items") {
      if (activeTab === "home") {
        return "Save to Home"
      }
      return `Save to selected location(s)`
    }
    if (location === "project") {
      return "Add to Project"
    }
    if (location === "collection") {
      return "Add to Collection"
    }
    return "Select"
  }

  const canConfirm = location === "save-items" 
    ? (activeTab === "projects" ? selectedItems.length > 0 : true)
    : selectedItems.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center mr-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleBackClick}
                  className="h-6 w-6"
                  disabled={!canGoBack()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleForwardClick}
                  className="h-6 w-6"
                  disabled={!canGoForward()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {currentFolderId ? <Folder className="h-4 w-4 text-muted-foreground fill-current" /> : null}  
              {currentFolder ? currentFolder.name : 
                location === "project" || location === "collection" ? "Select files" : 
                location === "save-items" ? "Select location(s)" :
                "Select files"}
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {location === "project" ? "Select files to include in your project" : 
             location === "save-items" ? "Select where you want to save the shared items" : 
             location === "collection" ? "Select files to add to your collection" :
             "Select files to share"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs defaultValue="home" onValueChange={setActiveTab}>
          {location !== "project" && location !== "collection" ? <TabsList className="flex flex-row justify-start mb-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList> : null}
          
          <TabsContent value="home">
            <div className="space-y-4">
              <DataTable 
                columns={createColumns({
                  enableStarToggle: false,
                  enableActions: false,
                  enableTags: false,
                  showFileSelection: location === "save-items" ? false : true,
                  showSelectAll: location === "save-items" ? false : true,
                })}
                data={filesAndFolders}
                enableSelection={true}
                enableActions={false}
                pageSize={8}
                onSelectionChange={handleSelectionChange}
                initialSelectedItems={filesAndFolders.filter(isItemSelected)}
                onRowClick={handleRowClick}
                isLoading={isLoading.filesAndFolders}
              />
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <DataTable 
              columns={createColumns({
                enableStarToggle: false,
                enableActions: false,
              })}
              data={projects}
              enableSelection={true}
              enableActions={false}
              viewMode="grid"
              pageSize={8}
              onSelectionChange={setSelectedItems}
              initialSelectedItems={selectedItems}
              enableRowLink={false}
              isLoading={isLoading.projects}
            />
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <Button 
            onClick={handleConfirm} 
            disabled={!canConfirm || isLoading.addToProject}
          >
            {isLoading.addToProject ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              getButtonText()
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
