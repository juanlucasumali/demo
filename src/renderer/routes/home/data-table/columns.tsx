"use client"

import { Button } from "@renderer/components/ui/button"
import { Checkbox } from "@renderer/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu"
import { ColumnDef } from "@tanstack/react-table"
import { File, Folder, MoreHorizontal, Star } from "lucide-react"
import { DataTableColumnHeader } from "./data-column-header"
import { DemoItem, tagBgClasses } from "@renderer/types/files"
import { Badge } from "@renderer/components/ui/badge"

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
      <DataTableColumnHeader column={column} title="Name" />
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
              <Badge
                variant="secondary"
                className={`${tagBgClasses.green}`}
              >
                {tags.fileType}
              </Badge>
  
              {/* 2. status */}
              <Badge
                key={tags.status}
                variant="secondary"
                className={`${tagBgClasses.purple}`}
              >
                {tags.status}
              </Badge>
  
              {/* 3. instruments */}
              {tags.instruments.map((instrument) => (
                <Badge
                  key={instrument}
                  variant="secondary"
                  className={`${tagBgClasses.blue}`}
                >
                  {instrument}
                </Badge>
              ))}
  
              {/* 4. version */}
              {tags.version.map((ver) => (
                <Badge
                  key={ver}
                  variant="secondary"
                  className={`${tagBgClasses.red}`}
                >
                  {ver}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "format",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Format" />
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
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id)}
              >
                Copy Item ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View {item.type === "folder" ? "folder" : "file"} details
              </DropdownMenuItem>
              <DropdownMenuItem>Open in new tab</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
