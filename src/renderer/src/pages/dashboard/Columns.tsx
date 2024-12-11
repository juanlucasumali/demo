import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, File, Folder, MoreHorizontal } from "lucide-react";
import { DemoItem } from "../../types/files";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { format } from "date-fns";
import { filesize } from "filesize";
import { useItems } from "@renderer/hooks/useItems";
import { getDisplayFormat } from "@renderer/lib/files";
import { useFolders } from "@renderer/contexts/FoldersContext";

interface ColumnProps {
  onDelete: (files: DemoItem[]) => void;
}

export const createColumns = ({ onDelete }: ColumnProps): ColumnDef<DemoItem>[] => {
  const { navigateToFolder } = useFolders();

  return [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center p-0 hover:bg-transparent" // Remove default padding
      >
        <span>File Name</span>
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
      const isFolder = row.original.type === 'folder';
      return (
        <div 
          className={`w-72 flex items-center gap-2 ${isFolder ? 'hover:text-primary' : ''}`}
        >
          {isFolder ? (
            <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground fill-current" />
          ) : (
            <File className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <span className={`truncate ${isFolder ? 'font-medium' : ''}`}>
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
    {
      accessorKey: "format",
      header: "Format",
      cell: ({ row }) => {
        const format = row.getValue("format");
        return <span>{getDisplayFormat(format)}</span>;
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
    const { downloadFile } = useItems();
    const isFolder = file.type === 'folder';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()} 
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          {isFolder && (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              navigateToFolder(file.id);
            }}>
              Open
            </DropdownMenuItem>
          )}
          {!isFolder && (
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              downloadFile(file);
            }}>
              Download
            </DropdownMenuItem>
          )}
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              alert(`Renaming ${file.name}`);
            }}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete([file]);
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
};