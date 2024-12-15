import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Input } from '@/renderer/components/ui/input'
import { Button } from '@/renderer/components/ui/button'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { File, Folder, Upload, FolderPlus } from 'lucide-react' // Import icons
import { useProjectDetailContext } from '../context/tasks-context'

const fileTypeOptions = [
  {
    label: 'Files',
    value: 'file',
    icon: File,
  },
  {
    label: 'Folders',
    value: 'folder',
    icon: Folder,
  },
]

// You might want to fetch these from your actual user data
const ownerOptions = [
  {
    label: 'Me',
    value: 'current-user',
  },
  {
    label: 'Shared with me',
    value: 'shared',
  },
]

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { setOpen } = useProjectDetailContext() // Add this

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter files and folders...'
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('type') && (
            <DataTableFacetedFilter
              column={table.getColumn('type')}
              title='Type'
              options={fileTypeOptions}
            />
          )}
          {table.getColumn('owner') && (
            <DataTableFacetedFilter
              column={table.getColumn('owner')}
              title='Owner'
              options={ownerOptions}
            />
          )}
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ml-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setOpen('upload')}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => setOpen('create')}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
