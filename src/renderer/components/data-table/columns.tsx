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
import { Edit, File, Folder, MoreHorizontal, RefreshCcw, Share, Star } from "lucide-react"
import { DataTableColumnHeader } from "./data-column-header"
import { DemoItem } from "@renderer/types/items"
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@renderer/components/ui/tooltip"
import { formatDuration } from "@renderer/lib/utils"
import TagBadge from "@renderer/components/tag-badge"
import { useItemsStore } from "@renderer/stores/items-store"
import { useState } from "react"
import { useToast } from "@renderer/hooks/use-toast"
import { DeleteDialog } from "@renderer/components/dialogs/delete-dialog"
import { EditFileDialog } from "@renderer/components/dialogs/edit-file"
import { Checkbox } from "@renderer/components/ui/checkbox"

interface ColumnOptions {
  enableStarToggle?: boolean;
  enableTags?: boolean;
  enableActions?: boolean;
}

export const createColumns = ({
  enableStarToggle = true,
  enableTags = true,
  enableActions = true,
}: ColumnOptions = {}): ColumnDef<DemoItem>[] => {
  const baseColumns: ColumnDef<DemoItem>[] = [
    // Selection column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
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

    // Hidden sharedWith column
    {
      id: "sharedWith",
      accessorKey: "sharedWith",
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
      const toggleIsStarred = useItemsStore((state) => state.toggleIsStarred);
  
      return (
        <div className="flex gap-1" style={{ maxWidth: "700px" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <div
              onClick={enableStarToggle ? () => toggleIsStarred(row.original.id) : undefined}
              style={{ cursor: enableStarToggle ? 'pointer' : 'default' }}
              title={enableStarToggle ? (isStarred ? 'Unstar' : 'Star') : undefined}
            >
              {isStarred ? (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              ) : (
                <Star className="h-4 w-4 text-gray-400" />
              )}
            </div>
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
    accessorKey: "friends",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shared With" disabled={true}/>
    ),
    cell: ({ row }) => {
      // 1. Extract the owner info
      const owner = row.original.owner
  
      // 2. Extract the friends array (may be null or empty)
      const friends = row.original.sharedWith ?? []
  
      return (
        <div className="flex items-center">
          {/* Container for overlapping avatars */}
          <div className="flex -space-x-3">
            {/* Show owner first */}
            {owner && (
              <Tooltip key={owner.id}>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={owner.avatar || ""} alt={owner.username} />
                      <AvatarFallback>
                        {owner.username[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex items-center gap-1">
                    <span>@{owner.username}</span>
                    <span className="text-xs text-muted-foreground">(Owner)</span>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Show other collaborators */}
            {friends.map((profile) => (
              <Tooltip key={profile.id}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={profile.avatar || ""} alt={profile.username} />
                      <AvatarFallback>
                        {profile.username[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  @{profile.username}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )
    },
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
  
      // Format the date as "Dec 6, 2035"
      const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(lastModified));
  
      return <div>{formattedDate}</div>;
    },
  },
]


if (enableActions) {
  baseColumns.push({
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      const removeItem = useItemsStore((state) => state.removeItem);
      const [isDeleting, setIsDeleting] = useState(false);
      const [editFile, setEditFile] = useState(false);
    const [open, setOpen] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
      try {
        setIsDeleting(true);
        await removeItem(item.id);
        setDropdown(false);
        setOpen(false);
        toast({
          title: "Success!",
          description: "Item was successfully deleted.",
          variant: "destructive"
        });
      } catch (error) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: `Failed to delete item: ${error}`,
          variant: "destructive"
        });
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div className="text-end">
        <DropdownMenu open={dropdown} onOpenChange={setDropdown} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditFile(true)}>
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              <Share /> Share
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(item.id)}
            >
              <RefreshCcw /> Convert
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DeleteDialog 
              open={open}
              onOpenChange={setOpen}
              onDelete={handleDelete}
              isDeleting={isDeleting}
            />
          </DropdownMenuContent>
        </DropdownMenu>
        <EditFileDialog
          editFile={editFile}
          setEditFile={setEditFile}
          existingFile={item}
          handleDialogClose={setDropdown}
        />
      </div>
      );
    },
  })
}

return baseColumns
}