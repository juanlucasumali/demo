"use client"

import { Button } from "@renderer/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { Edit, File, Folder, MoreHorizontal, RefreshCcw, Share, Star, Trash } from "lucide-react"
import { DataTableColumnHeader } from "./data-column-header"
import { DemoItem } from "@renderer/types/items"
import { formatDuration } from "@renderer/lib/utils"
import TagBadge from "@renderer/components/tag-badge"
import { Checkbox } from "@renderer/components/ui/checkbox"
import { AvatarGroup } from "@renderer/components/ui/avatar-group"

interface ColumnOptions {
  enableStarToggle?: boolean;
  enableTags?: boolean;
  enableActions?: boolean;
  showStarColumn?: boolean;
  showFileSelection?: boolean;
  showSelectAll?: boolean;
  onEditFile?: (item: DemoItem) => void
  onShare?: (item: DemoItem) => void
  onDelete?: (itemId: string) => void
}

export const createColumns = ({
  enableStarToggle = true,
  enableTags = true,
  enableActions = true,
  showStarColumn = true,
  showFileSelection = true,
  showSelectAll = true,
  onEditFile,
  onShare,
  onDelete
}: ColumnOptions = {}): ColumnDef<DemoItem>[] => {
  const baseColumns: ColumnDef<DemoItem>[] = [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        showSelectAll ? (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ) : null
      ),
      cell: ({ row }) => {
        const isFile = row.original.type === "file";
        if (!showFileSelection && isFile) {
          return null;
        }
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            disabled={!showFileSelection && isFile}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    },

    // Hidden id column
    {
      id: "id",
      accessorKey: "id",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

    // Hidden isStarred column
    {
      id: "isStarred",
      accessorKey: "isStarred",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

    // Hidden tags column
    {
      id: "tags",
      accessorKey: "tags",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

    // Hidden icon column
    {
      id: "icon",
      accessorKey: "icon",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

    // Hidden type column
    {
      id: "type",
      accessorKey: "type",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

    // Hidden owner column
    {
      id: "owner",
      accessorKey: "owner",
      header: () => null,
      enableSorting: true,
      enableHiding: true,
      cell: () => null,
    },

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" disabled={true}/>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const isStarred = row.original.isStarred;
      const tags = row.original.tags;
      // const toggleIsStarred = useItemsStore((state) => state.toggleIsStarred);

  
      return (
        <div className="flex gap-1" style={{ maxWidth: "700px" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            {showStarColumn && (
              <div
                // onClick={enableStarToggle ? () => toggleIsStarred(row.getValue("id")) : undefined}
                style={{ cursor: enableStarToggle ? 'pointer' : 'default' }}
                title={enableStarToggle ? (isStarred ? 'Unstar' : 'Star') : undefined}
            >
              {isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <Star className="h-4 w-4 text-gray-400" />
              )}
            </div>
            )}
            {type === "folder" ? (
              <Folder className="h-4 w-4 text-muted-foreground fill-current" />
            ) : (
              <File className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium truncate max-w-[15rem]">{row.getValue("name")}</span>
          </div>
          {enableTags && tags && (
            <div className="pl-2 flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              <TagBadge tag={tags} />
            </div>
          )}
        </div>
      );
    },
  },

  {
    id: "sharedWith",
    accessorKey: "sharedWith",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shared With" disabled={true}/>
    ),
    cell: ({ row }) => {
      const owner = row.original.owner;
      const friends = row.original.sharedWith ?? [];
      
      return <AvatarGroup owner={owner!!} users={friends} size="md" />;
    }
  },

  {
    accessorKey: "duration",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Duration" disabled={true}/>
    ),
    cell: ({ row }) => {
      // format is optional, so we do a null check
      const duration = row.original.duration
      return <span>{duration ? formatDuration(duration) : ""}</span>
    },
  },

  {
    accessorKey: "format",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Format" disabled={true}/>
    ),
    cell: ({ row }) => {
      // format is optional, so we do a null check
      const format = row.getValue<DemoItem["format"]>("format")
      return format ? <span>{format.toUpperCase()}</span> : ""
    },
  },

  {
    accessorKey: "size",
    id: "size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue<number | undefined>("size")
      if (!size) return ""

      // Simple numeric formatting, adapt as you like (e.g., MB, KB, etc.)
      const sizeInMb = (size / 1_000_000).toFixed(2)
      return <div>{sizeInMb} MB</div>
    },
  },
  
  {
    accessorKey: "lastModified",
    id: "lastModified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Modified" />
    ),
    cell: ({ row }) => {
      const lastModified = row.original.lastModified;
      if (!lastModified) return "";
  
      // Format the date as "Dec 6, 2035 12:00 AM"
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(lastModified));
  
      return <div>{formattedDate}</div>;
    },
  },
]


if (enableActions) {
  baseColumns.push({
    id: "actions",
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onEditFile?.(row.original)
            }}>
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onShare?.(row.original)
            }}>
              <Share /> Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.getValue("id"));
              }}
            >
              <RefreshCcw /> Convert
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(row.getValue("id"))
              }}
              className="text-red-500"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  })
}

return baseColumns
}
