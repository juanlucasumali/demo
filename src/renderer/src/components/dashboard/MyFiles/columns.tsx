import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { FileItem } from "../../../types/files";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { format } from "date-fns";
import { filesize } from "filesize";
import { useFiles } from "@renderer/hooks/useFiles";
import { DeleteDialog } from "@renderer/components/dialogs/DeleteDialog";
import { useState } from "react";
import { useToast } from "@renderer/hooks/use-toast";
import { getDisplayFormat } from "@renderer/lib/files";

export const columns: ColumnDef<FileItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 hover:bg-transparent" // Remove default padding
      >
        File Name
        <div className="ml-2">
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : null}
        </div>
      </Button>
    ),
    cell: ({ row }) => (
      <div className="w-96 truncate">
        <span className="font-medium">{row.getValue("name")}</span>
      </div>
    ),
  },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type");
        return <span>{getDisplayFormat(type)}</span>;
      },
    },
  {
    accessorKey: "dateUploaded",
    header: ({ column, table }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 hover:bg-transparent" // Remove default padding
      >
      <span>Date Uploaded</span>
      <div className="w-8 ml-2">
        {column.getIsSorted() === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : column.getIsSorted() === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : !table.getState().sorting.length ||
          table.getState().sorting[0].id === "dateUploaded" ? (
          <ArrowDown className="h-4 w-4" />
        ) : null}
      </div>
    </Button>
    ),
    sortingFn: "datetime",
    sortDescFirst: true, // This makes it sort descending by default
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateUploaded"));
      const formatted = format(date, "MMM d, yyyy, h:mm:ss aa"); // e.g., "Dec 3, 2024, 4:32:21 PM"
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 hover:bg-transparent" // Remove default padding
      >
        <span>Size</span>
        <div className="w-4 ml-2">
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="h-4 w-4" />
          ) : null}
        </div>
      </Button>
    ),
    cell: ({ row }) => {
        const size = row.getValue("size");
        if (typeof size === 'number' || typeof size === 'string' || typeof size === 'bigint') {
          const formatted = filesize(size, { base: 2, standard: "jedec" });
          return <span>{formatted}</span>;
        }
        return <span>Invalid size</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const file = row.original;
      const { downloadFile, deleteFile } = useFiles();
      const [showDeleteDialog, setShowDeleteDialog] = useState(false);
      const { toast } = useToast();

      const handleDelete = async () => {
        try {
          await deleteFile(file);
          toast({
            title: "Success",
            description: `${file.name} has been deleted.`,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to delete file.",
            variant: "destructive",
          });
        }
        setShowDeleteDialog(false);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadFile(file)}>
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert(`Renaming ${file.name}`)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DeleteDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDelete}
            fileName={file.name}
          />
        </>
      );
    },
  },
];