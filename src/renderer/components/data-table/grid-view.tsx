import { Table } from "@tanstack/react-table"
import { ItemType } from "@renderer/types/items"
import { GridItem } from "./grid-item"

interface DataTableGridViewProps<TData> {
  table: Table<TData>
  enableSelection?: boolean
  enableRowLink?: boolean
  onRowClick?: (item: TData) => void
  onToggleStar?: (id: string, isStarred: boolean, type: ItemType) => void
  onEditFile?: (item: TData) => void
  onShare?: (item: TData) => void
  onDelete?: (item: TData) => void
  onLeave?: (item: TData) => void
  hideFileActions?: boolean
}

export function DataTableGridView<TData>({ 
  table,
  enableSelection,
  enableRowLink = true,
  onEditFile,
  onShare,
  onDelete,
  onLeave,
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
          onLeave={onLeave}
          hideFileActions={hideFileActions}
        />
      ))}
    </div>
  )
} 