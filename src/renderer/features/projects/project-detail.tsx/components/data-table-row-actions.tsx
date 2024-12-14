import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { 
  Download, 
  Pencil, 
  Star, 
  Trash, 
  Share, 
  Copy 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu'
import { Button } from '@/renderer/components/ui/button'
import { ProjectItem } from '@/renderer/components/layout/types'
import { useProjectDetailContext } from '../context/project-detail-context'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const item = row.original as ProjectItem
  const { setOpen, setCurrentItem } = useProjectDetailContext()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {item.type === 'file' && (
          <DropdownMenuItem onClick={() => console.log('Download', item)}>
            Download
            <DropdownMenuShortcut>
              <Download className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          onClick={() => {
            setCurrentItem(item)
            setOpen('update')
          }}
        >
          Rename
          <DropdownMenuShortcut>
            <Pencil className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => console.log('Toggle star', item)}>
          {item.starred ? 'Unstar' : 'Star'}
          <DropdownMenuShortcut>
            <Star className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => console.log('Share', item)}>
          Share
          <DropdownMenuShortcut>
            <Share className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => console.log('Make copy', item)}>
          Make a copy
          <DropdownMenuShortcut>
            <Copy className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive"
          onClick={() => {
            setCurrentItem(item)
            setOpen('delete')
          }}
        >
          Delete
          <DropdownMenuShortcut>
            <Trash className="h-4 w-4" />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
