import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/renderer/components/ui/checkbox'
import { Badge } from '@/renderer/components/ui/badge'
import { Star, StarOff, File, Folder } from 'lucide-react'
import { ProjectItem } from '@/renderer/components/layout/types'
import { DataTableColumnHeader } from '@/renderer/features/users/components/data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<ProjectItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'starred',
    cell: ({ row }) => {
      const item = row.original
      return (
        <button
          onClick={() => console.log('Toggle star', item.id)}
          className="p-2 hover:text-yellow-400"
        >
          {item.starred ? (
            <Star className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4" />
          )}
        </button>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className="flex items-center gap-2">
          {item.type === 'folder' ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{item.name}</span>
          {item.tags && item.tags.map(tag => (
            <Badge key={tag} variant='outline' className="ml-2">
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('type') as 'file' | 'folder'
      return (
        <div className="w-[80px] capitalize">
          {type}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'size',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Size' />
    ),
    cell: ({ row }) => {
      const size = row.original.size
      return (
        <div className="w-[100px]">
          {size ? formatBytes(size) : '-'}
        </div>
      )
    },
  },
  {
    accessorKey: 'lastModified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Modified' />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[150px]">
          {formatDate(row.original.lastModified)}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created By' />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[150px]">
          {row.getValue('createdBy')}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// Helper functions
function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
