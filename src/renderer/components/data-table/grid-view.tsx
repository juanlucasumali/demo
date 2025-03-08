import { Table } from "@tanstack/react-table"
import { cn } from "@renderer/lib/utils"
import { ItemType } from "@renderer/types/items"
import { Star } from "lucide-react"
import { Checkbox } from "@renderer/components/ui/checkbox"
import { AvatarGroup } from "@renderer/components/ui/avatar-group"
import TagBadge from "@renderer/components/tag-badge"
import { Link } from "@tanstack/react-router"
import { UserProfile } from "@renderer/types/users"
import folderImage from "@renderer/assets/macos-folder.png"
import { ProjectTag } from "@renderer/types/tags"
import { GridItem } from "./grid-item"

interface DataTableGridViewProps<TData> {
  table: Table<TData>
  enableSelection?: boolean
  enableRowLink?: boolean
  onRowClick?: (item: TData) => void
  onToggleStar?: (id: string, isStarred: boolean, type: ItemType) => void
  onEditFile?: (item: any) => void
  onShare?: (item: any) => void
  onDelete?: (item: any) => void
}

export function DataTableGridView<TData>({ 
  table,
  enableSelection,
  enableRowLink = true,
  onRowClick,
  onToggleStar,
  onEditFile,
  onShare,
  onDelete,
  hideFileActions = false
}: DataTableGridViewProps<TData> & {
  onEditFile?: (item: any) => void;
  onShare?: (item: any) => void;
  onDelete?: (item: any) => void;
  hideFileActions?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {table.getRowModel().rows.map((row) => (
        <GridItem
          key={row.id}
          row={row}
          isSelected={row.getIsSelected()}
          onSelectionChange={(checked) => row.toggleSelected(!!checked)}
          enableSelection={enableSelection}
          enableRowLink={enableRowLink}
          onEditFile={onEditFile}
          onShare={onShare}
          onDelete={onDelete}
          hideFileActions={hideFileActions}
        />
      ))}
    </div>
  )
} 