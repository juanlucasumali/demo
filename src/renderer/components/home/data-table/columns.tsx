"use client"

import { Button } from "@renderer/components/ui/button"
import { Checkbox } from "@renderer/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { Edit, File, Folder, MoreHorizontal, RefreshCcw, Share, Star, Trash } from "lucide-react"
import { DataTableColumnHeader } from "../data-column-header"
import { DemoItem } from "@renderer/types/items"
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@renderer/components/ui/tooltip"
import { formatDuration } from "@renderer/lib/utils"
import TagBadge from "@renderer/components/tag-badge"

export const columns: ColumnDef<DemoItem>[] = [

  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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

  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" disabled={true}/>
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const isStarred = row.original.isStarred;
      const tags = row.original.tags;
  
      return (
        <div className="flex gap-1" style={{ maxWidth: "700px" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            {isStarred ? (
              <Star className="h-4 w-4 text-muted-foreground fill-current" />
            ) : (
              <Star className="h-4 w-4 text-muted-foreground" />
            )}
            {type === "folder" ? (
              <Folder className="h-4 w-4 text-muted-foreground fill-current" />
            ) : (
              <File className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{row.getValue("name")}</span>
          </div>
          {tags && (
            <div className="pl-2 flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
              {/* 1. fileType */}
              <TagBadge tag={tags.fileType} property={"fileType"} />
  
              {/* 2. status */}
              <TagBadge tag={tags.status} property={"status"} />
  
              {/* 3. instruments */}
              {tags.instruments.map((instrument) => (
                <TagBadge tag={instrument} property={"instruments"} />
              ))}
  
              {/* 4. version */}
              {tags.version.map((ver) => (
                <TagBadge tag={ver} property={"version"} />
              ))}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "collaborators",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Collaborators" disabled={true}/>
    ),
    cell: ({ row }) => {
      // 1. Extract the owner info
      const ownerId = row.original.ownerId
      const ownerAvatar = row.original.ownerAvatar
      const ownerUsername = row.original.ownerUsername
  
      // 2. Extract the collaborators array (may be null or empty)
      const collaborators = row.original.sharedWith ?? []
  
      // 3. Make a combined array: owner first, then collaborators
      const profiles = [
        {
          id: ownerId,
          avatar: ownerAvatar,
          username: ownerUsername,
        },
        ...collaborators,
      ]
  
      return (
        <div className="flex items-center">
          {/* Container for overlapping avatars */}
          <div className="flex -space-x-3">
            {profiles.map((profile) => (
              <Tooltip key={profile.id}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <Avatar className="h-8 w-8 border-2 border-background">
                      <AvatarImage
                        src={profile.avatar || ""}
                        alt={profile.username}
                      />
                      <AvatarFallback>
                        {profile.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {profile.username}
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
      const duration = row.getValue<DemoItem["duration"]>("duration")
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
    id: "actions",
    cell: ({ row }) => {
      const item = row.original

      return (
        <div className="text-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
              >
                <Edit/> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
              >
                <Share/> Share
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
              >
                <RefreshCcw/> Convert
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
                className="text-red-500"
              >
                <Trash/> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
