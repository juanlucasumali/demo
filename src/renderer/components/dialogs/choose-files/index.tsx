"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Button } from "@renderer/components/ui/button"
import { useItemsStore } from "@renderer/stores/items-store"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@renderer/components/ui/tabs"
import { createColumns } from "@renderer/components/data-table/columns"
import { DataTable } from "@renderer/components/data-table/data-table"
import { DemoItem } from "@renderer/types/items"
import { useState, useEffect } from "react"

interface ChooseFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (selectedItems: DemoItem[]) => void
  initialSelections?: DemoItem[]
}

export function ChooseFilesDialog({
  open,
  onOpenChange,
  onConfirm,
  initialSelections = []
}: ChooseFilesDialogProps) {
  const filesAndFolders = useItemsStore((state) => state.filesAndFolders);
  const projects = useItemsStore((state) => state.projects);
  const [selectedItems, setSelectedItems] = useState<DemoItem[]>(initialSelections);

  // Update selected items when initialSelections changes
  useEffect(() => {
    setSelectedItems(initialSelections);
  }, [initialSelections]);

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Choose Files</AlertDialogTitle>
          <AlertDialogDescription>
            Select files to include in your project
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs defaultValue="files" >
          <TabsList className="flex flex-row justify-start mb-2">
            <TabsTrigger value="files">All Files</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            <DataTable 
              columns={createColumns({
                enableStarToggle: false,
                enableActions: false,
                enableTags: false
              })}
              data={filesAndFolders}
              enableSelection={true}
              enableActions={false}
              pageSize={8}
              onSelectionChange={setSelectedItems}
              initialSelectedItems={selectedItems}
            />
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
          <Button onClick={handleConfirm}>Confirm Selection</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
