"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@renderer/components/ui/alert-dialog"
import { Button } from "@renderer/components/ui/button"
import { useItemsStore } from "@renderer/stores/items-store"
import { Tabs, TabsTrigger, TabsList, TabsContent } from "@renderer/components/ui/tabs"
import { createColumns } from "@renderer/components/data-table/columns"
import { DataTable } from "@renderer/components/data-table/data-table"

interface ChooseFilesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChooseFilesDialog({
  open,
  onOpenChange
}: ChooseFilesDialogProps) {
  const data = useItemsStore((state) => state.data)
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
          <TabsList className="flex flex-row justify-start">
            <TabsTrigger value="files">All Files</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            <DataTable 
              columns={createColumns(false, true, false)} // disable star toggle and actions, enable selection
              data={data}
              enableSelection={true}
              enableStarToggle={false}
              enableActions={false}
            />
          </TabsContent>
          <TabsContent value="projects">
            
          </TabsContent>
        </Tabs>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <Button>Confirm Selection</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
