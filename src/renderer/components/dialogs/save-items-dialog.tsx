import { Dialog, DialogContent } from "@renderer/components/ui/dialog";
import { Button } from "@renderer/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar";
import { DataTable } from "@renderer/components/data-table/data-table";
import { createColumns } from "@renderer/components/data-table/columns";
import { format } from "date-fns";
import { UserProfile } from "@renderer/types/users";
import { DemoItem } from "@renderer/types/items";
import React, { useState } from "react";
import { SelectFilesDialog } from "./select-files";

interface SaveItemsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  from: UserProfile;
  items: DemoItem[] | null;
  sharedAt: Date;
  description: string | null;
}

export function SaveItemsDialog({
  open,
  onOpenChange,
  from,
  items,
  sharedAt,
  description
}: SaveItemsDialogProps) {
  const [chooseLocation, setChooseLocation] = useState(false);
  const [selectedItems, setSelectedItems] = React.useState<DemoItem[]>([]);

  const handleSaveAll = () => {
    setChooseLocation(true);
  };

  const handleLocationChosen = (selectedItems: DemoItem[]) => {
    // Here you would implement the logic to save the shared items to the selected location
    setSelectedItems(selectedItems);
    console.log("Saving items to location:", selectedItems);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl" showCloseButton={false}>
          <div className="flex justify-between items-start mb-6">
            {/* Left side - User info */}
            <div className="flex gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={from.avatar || undefined} alt={from.username} />
                <AvatarFallback>
                  {from.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{from.name}</h3>
                <p className="text-sm text-muted-foreground">@{from.username}</p>
              </div>
            </div>

            {/* Right side - Date/Time */}
            <div className="text-right">
              <p className="text-sm">{format(sharedAt, 'MMM dd, yyyy')}</p>
              <p className="text-sm text-muted-foreground">{format(sharedAt, 'hh:mm a')}</p>
            </div>
          </div>


          {/* Data Table & Description */}
          <div className="rounded-md">
            {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
            <DataTable
              columns={createColumns({
                enableStarToggle: false,
                enableTags: true,
                enableActions: false,
                showStarColumn: false,
              })}
              data={items || []}
              enableSelection={false}
              showColumnHeaders={false}
              showPagination={false}
              showSearch={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAll}>
              Save All
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SelectFilesDialog
        open={chooseLocation}
        onOpenChange={setChooseLocation}
        onConfirm={handleLocationChosen}
        initialSelections={selectedItems}
        location="save-items"
      />
    </>
  );
} 