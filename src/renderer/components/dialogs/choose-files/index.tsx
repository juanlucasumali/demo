"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Button } from "@renderer/components/ui/button"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@renderer/components/ui/tabs"
import { createColumns } from "@renderer/components/data-table/columns"
import { DataTable } from "@renderer/components/data-table/data-table"
import { DemoItem } from "@renderer/types/items"
import { useState, useEffect } from "react"
import { useItemsStore } from "@renderer/stores/items-store"

interface SelectFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedItems: DemoItem[]) => void
  initialSelections?: DemoItem[]
  location: "home" | "project" | "save-items"
}

export function SelectFilesDialog({
  open,
  onOpenChange,
  onConfirm,
  initialSelections = [],
  location
}: SelectFilesDialogProps) {
  const filesAndFolders = useItemsStore((state) => state.filesAndFolders);
  const projects = useItemsStore((state) => state.projects);
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>(initialSelections);
  const [activeTab, setActiveTab] = useState<string>("home");

  // Update selected items when initialSelections changes
  useEffect(() => {
    setSelectedItems(initialSelections);
  }, [initialSelections]);

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onOpenChange(false);
  };

  const getButtonText = () => {
    if (location === "save-items") {
      if (activeTab === "home") {
        return "Save to Home"
      }
      return `Save to selected location(s)`
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
          <AlertDialogTitle>{location === "project" ? "Select files" : 
             location === "save-items" ? "Select location(s)" :
             "Select files"}</AlertDialogTitle>
          <AlertDialogDescription>
            {location === "project" ? "Select files to include in your project" : 
             location === "save-items" ? "Select where you want to save the shared items" :
             "Select files to share"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs defaultValue="home" onValueChange={setActiveTab}>
          <TabsList className="flex flex-row justify-start mb-2">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
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
                onSelectionChange={setSelectedItems}
                initialSelectedItems={selectedItems}
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
            />
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {getButtonText()}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
