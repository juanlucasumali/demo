import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconStar, IconStarFilled, IconDownload, IconEdit, IconShare } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu'
import { Button } from '@/renderer/components/ui/button'
import { RowActionItem, rowActionSchema } from '../data/schema'
import { useProjectDetailContext } from '../context/tasks-context'

interface DataTableRowActionsProps {
  row: Row<RowActionItem>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const item = rowActionSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useProjectDetailContext()

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
          <DropdownMenuItem onClick={() => console.log('Download', item.id)}>
            Download
            <DropdownMenuShortcut>
              <IconDownload size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(item)
            setOpen('rename')
          }}
        >
          Rename
          <DropdownMenuShortcut>
            <IconEdit size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => console.log('Share', item.id)}>
          Share
          <DropdownMenuShortcut>
            <IconShare size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => console.log('Toggle star', item.id)}
        >
          {item.isStarred ? 'Unstar' : 'Star'}
          <DropdownMenuShortcut>
            {item.isStarred ? (
              <IconStarFilled size={16} />
            ) : (
              <IconStar size={16} />
            )}
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(item)
            setOpen('delete')
          }}
          className="text-destructive"
        >
          Delete
          <DropdownMenuShortcut>
            <IconTrash size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
