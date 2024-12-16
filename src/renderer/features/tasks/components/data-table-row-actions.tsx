import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconStar, IconStarFilled, IconDownload, IconEdit, IconShare, IconFolder } from '@tabler/icons-react'
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
import { ProjectItem } from '@/renderer/components/layout/types'
import { projectItemsService } from '@/renderer/services/project-items-service'
import { useState } from 'react'
import { useToast } from '@/renderer/hooks/use-toast'

interface DataTableRowActionsProps {
  row: Row<RowActionItem>
  onEditFolder?: (folder: ProjectItem) => void
  onEditFile?: (file: ProjectItem) => void
  onDeleteFile?: (file: ProjectItem) => void
}

export function DataTableRowActions({ row, onEditFolder, onEditFile, onDeleteFile }: DataTableRowActionsProps) {
  const item = rowActionSchema.parse(row.original)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()
  
  const handleDownload = async (filePath: string) => {
    if (!filePath) return
    
    setIsDownloading(true)
    try {
      const { url, filename } = await projectItemsService.downloadFile(filePath)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download started",
        description: `Downloading ${filename}`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger 
        asChild
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
        }}
      >
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          onClick={(e) => {
          }}
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {item.type === 'file' && (
          <DropdownMenuItem 
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(item.filePath)
            }}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
            <DropdownMenuShortcut>
              <IconDownload size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}
        
        {item.type === 'folder' && onEditFolder && (
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onEditFolder(item)
            }}
          >
            Edit Folder
            <DropdownMenuShortcut>
              <IconFolder size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onDeleteFile(item)
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