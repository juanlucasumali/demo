import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
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

export const columns: ColumnDef<FileItem>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        File Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span>{row.getValue("type")}</span>,
  },
  {
    accessorKey: "dateUploaded",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Date Uploaded
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("dateUploaded"));
      const formatted = format(date, "PPP p"); // e.g., "Oct 1, 2023, 10:00 AM"
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "size",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Size
        <ArrowUpDown className="ml-2 h-4 w-4" />
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