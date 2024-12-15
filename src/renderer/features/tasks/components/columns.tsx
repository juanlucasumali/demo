import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/renderer/components/ui/badge'
import { Checkbox } from '@/renderer/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { File, Folder } from 'lucide-react'
import { ProjectItem } from '@/renderer/components/layout/types'

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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <div className='flex items-center gap-2'>
          {type === 'folder' ? (
            <Folder className="h-4 w-4 text-muted-foreground fill-current" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground" />
          )}
          <span className='font-medium'>
            {row.getValue('name')}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'ownerId', // Changed from 'owner' to 'ownerId'
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Owner' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex items-center'>
          <span>{row.getValue('ownerId')}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'lastModified',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Last Modified' />
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue('lastModified')
      if (!dateValue) return <div>-</div>
    
      // Convert string to Date if needed
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue as Date
    
      // Validate date
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return <div>Invalid date</div>
      }
    
      return (
        <div>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tags' />
    ),
    cell: ({ row }) => {
      const tags = row.getValue('tags') as string[] | null
      if (!tags || tags.length === 0) return null
      
      return (
        <div className="flex gap-1">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="whitespace-nowrap"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
