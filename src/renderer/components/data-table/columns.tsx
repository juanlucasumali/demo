"use client"

import { Button } from "@renderer/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu"
import { ColumnDef, CellContext } from "@tanstack/react-table"
import { File, Folder, MoreHorizontal, Play, Pause, Loader2, Star } from "lucide-react"
import { DataTableColumnHeader } from "./data-column-header"
import { DemoItem, ItemType } from "@renderer/types/items"
import { formatDuration, isAudioFile } from "@renderer/lib/utils"
import TagBadge from "@renderer/components/tag-badge"
import { Checkbox } from "@renderer/components/ui/checkbox"
import { AvatarGroup } from "@renderer/components/ui/avatar-group"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"
import { AudioState } from "./data-table"
import { TableActions } from "./table-actions"

interface CellContextWithAudio<TData> {
  audioState?: {
    hoveredRow: string | null;
    playingRow: string | null;
    loadingRow: string | null;
    currentRow: string | null;
    downloadingRow: string | null;
  };
  setAudioState?: React.Dispatch<React.SetStateAction<AudioState>>;
  onPlayToggle?: (rowId: string) => void;
}

type ExtendedCellContext<TData> = CellContext<TData, unknown> & CellContextWithAudio<TData>;

interface ColumnOptions {
  location?: 'folder' | 'project' | 'collection';
  enableStarToggle?: boolean;
  enableTags?: boolean;
  enableActions?: boolean;
  showStarColumn?: boolean;
  showFileSelection?: boolean;
  showSelectAll?: boolean;
  onEditFile?: (item: DemoItem) => void
  onShare?: (item: DemoItem) => void
  onDelete?: (item: DemoItem) => void
  onRemove?: (item: DemoItem) => void
  onToggleStar?: (id: string, isStarred: boolean, type: ItemType) => void;
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
  onDelete,
  onToggleStar,
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
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
              disabled={!showFileSelection && isFile}
            />
          </div>
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
    cell: ({ row, audioState, onPlayToggle }: ExtendedCellContext<DemoItem>) => {
      const type = row.original.type;
      const isStarred = row.getValue("isStarred") as boolean;
      const tags = row.original.tags;
      const itemId = row.original.id;
      const format = row.original.format;
      const isAudio = type === "file" && isAudioFile(format);
      const isHovered = audioState?.hoveredRow === row.id;
      const isCurrent = audioState?.currentRow === row.id;
      const isPlaying = isCurrent && useMediaPlayerStore.getState().isPlaying;

      const handlePlayClick = (e: React.MouseEvent) => {
        if (isAudio) {
          console.log('🎵 Play button clicked in data table', {
            rowId: row.id,
            isPlaying,
            isCurrent
          });
          e.stopPropagation();
          onPlayToggle?.(row.id);
        }
      };

      return (
        <div className="flex gap-1" style={{ maxWidth: "700px" }}>
          <div className="flex items-center gap-2 whitespace-nowrap">
            {showStarColumn && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (enableStarToggle && onToggleStar) {
                    onToggleStar(itemId, !isStarred, type);
                  }
                }}
                style={{ cursor: enableStarToggle ? 'pointer' : 'default' }}
                title={enableStarToggle ? (isStarred ? 'Unstar' : 'Star') : undefined}
              >
                {isStarred ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <Star className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                )}
              </div>
            )}
            <div 
              onClick={handlePlayClick}
              className={isAudio ? "cursor-pointer" : ""}
            >
              {type === "folder" ? (
                <Folder className="h-4 w-4 text-muted-foreground fill-current" />
              ) : isAudio && audioState?.loadingRow === row.id ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              ) : isAudio && (isHovered || isCurrent) ? (
                isPlaying ? (
                  <Pause className="h-4 w-4 text-primary" />
                ) : (
                  <Play className="h-4 w-4 text-primary" />
                )
              ) : (
                <File className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
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
      const friends = row.original.sharedWith ?? [];
      const owner = row.original.owner;
      
      // Filter out owner from friends list if present
      const filteredFriends = friends.filter(friend => friend.id !== owner?.id);
      
      // Don't render anything if:
      // 1. There are no friends and no owner, or
      // 2. There's only an owner and no other friends
      if (filteredFriends.length === 0) {
        return null;
      }

      return <AvatarGroup owner={owner || undefined} users={filteredFriends} size="md" />;
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
    cell: ({ row, audioState, setAudioState }: ExtendedCellContext<DemoItem>) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            {audioState?.downloadingRow === row.id ? (
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <TableActions
              menuType="dropdown"
              row={row}
              onEditFile={onEditFile}
              onShare={onShare}
              onDelete={onDelete}
              setAudioState={setAudioState}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  })
}

return baseColumns
}
