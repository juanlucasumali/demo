import { Row } from "@tanstack/react-table"
import { DemoItem, FileFormat } from "@renderer/types/items"
import { AudioState } from "./data-table"
import { Edit, Share, RefreshCcw, Download, Trash, LogOut } from "lucide-react"
import { b2Service } from '@renderer/services/b2-service'
import { AudioConverterService } from '@renderer/services/audio-converter'
import { useToast } from "@renderer/hooks/use-toast"
import { mimeTypes } from "@renderer/lib/utils"
import { createFolderZip, ZipProgress } from '@renderer/services/zip-service'
import { DownloadProgress } from '@renderer/components/download-progress'
import { useState } from 'react'
import { getFilesAndFolders } from '@renderer/services/items-service'
import { useUserStore } from "@renderer/stores/user-store"

// For Context Menu
import {
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@renderer/components/ui/context-menu"

// For Dropdown Menu
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@renderer/components/ui/dropdown-menu"

interface TableActionsProps {
  row: Row<DemoItem>
  onEditFile?: (item: DemoItem) => void
  onShare?: (item: DemoItem) => void
  onDelete?: (item: DemoItem) => void
  onLeave?: (item: DemoItem) => void
  setAudioState?: React.Dispatch<React.SetStateAction<AudioState>>
  menuType: 'context' | 'dropdown'
  onCloseMenu?: () => void
  hideFileActions?: boolean
}

export function TableActions({
  row,
  onEditFile,
  onShare,
  onDelete,
  onLeave,
  setAudioState,
  menuType,
  onCloseMenu,
  hideFileActions = false
}: TableActionsProps) {
  const { toast } = useToast()
  const currentUser = useUserStore((state) => state.user)
  const isOwner = row.original.owner?.id === currentUser?.id
  
  const MenuItem = menuType === 'context' ? ContextMenuItem : DropdownMenuItem
  const MenuSub = menuType === 'context' ? ContextMenuSub : DropdownMenuSub
  const MenuSubTrigger = menuType === 'context' ? ContextMenuSubTrigger : DropdownMenuSubTrigger
  const MenuSubContent = menuType === 'context' ? ContextMenuSubContent : DropdownMenuSubContent

  const [downloadProgress, setDownloadProgress] = useState<ZipProgress | null>(null)

  const handleAction = (action: (item: DemoItem) => void) => {
    action(row.original)
    onCloseMenu?.()
  }

  const handleFolderDownload = async (folderId: string, folderName: string) => {
    try {
      const items = await getFilesAndFolders(folderId)
      
      const handle = await window.showSaveFilePicker({
        suggestedName: `${folderName}.zip`,
        types: [{
          description: 'ZIP Archive',
          accept: {
            'application/zip': ['.zip']
          }
        }]
      })

      toast({
        title: "Downloading",
        description: "Creating zip file, please wait...",
      })

      const zipData = await createFolderZip(items, folderName, (progress) => {
        setDownloadProgress(progress)
      })

      const writable = await handle.createWritable()
      await writable.write(zipData)
      await writable.close()

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${folderName}.zip`,
      })
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('❌ Folder download failed:', error)
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: "There was an error downloading the folder.",
        })
      }
    } finally {
      setDownloadProgress(null)
    }
  }

  return (
    <>
      <MenuItem onClick={(e) => {
        e.stopPropagation()
        handleAction(onEditFile!)
      }}>
        <Edit className="mr-2 h-4 w-4" /> Edit
      </MenuItem>
      
      <MenuItem onClick={(e) => {
        e.stopPropagation()
        handleAction(onShare!)
      }}>
        <Share className="mr-2 h-4 w-4" /> Share
      </MenuItem>

      {!hideFileActions && (
        <>
          <MenuSub>
            <MenuSubTrigger>
              <RefreshCcw className="mr-2 h-4 w-4" /> Convert
            </MenuSubTrigger>
            <MenuSubContent>
              <MenuItem
                disabled={row.original.format !== FileFormat.WAV}
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    const handle = await window.showSaveFilePicker({
                      suggestedName: row.original.name.replace(/\.wav$/i, '.mp3'),
                      types: [{
                        description: 'MP3 Audio',
                        accept: { 'audio/mpeg': ['.mp3'] }
                      }]
                    })

                    const wavData = await b2Service.retrieveFile(row.original.filePath!)
                    const mp3Data = await AudioConverterService.wavToMp3(wavData)
                    
                    const writable = await handle.createWritable()
                    await writable.write(mp3Data)
                    await writable.close()
                    
                    console.log('✅ WAV to MP3 conversion saved successfully')
                  } catch (error) {
                    if (error instanceof Error && error.name !== 'AbortError') {
                      console.error('❌ Conversion failed:', error)
                    }
                  }
                }}
              >
                WAV to MP3
              </MenuItem>
            </MenuSubContent>
          </MenuSub>

          {row.original.type === "file" ? (
            <MenuItem
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  setAudioState?.(prev => ({
                    ...prev,
                    downloadingRow: row.id
                  }))
                  
                  const fileName = row.original.name
                  const extension = row.original.format?.toLowerCase() || ''
                  
                  const baseFileName = fileName.toLowerCase().endsWith(`.${extension}`) 
                    ? fileName 
                    : `${fileName}.${extension}`

                  const handle = await window.showSaveFilePicker({
                    suggestedName: baseFileName,
                    types: [{
                      description: `${extension.toUpperCase()} File`,
                      accept: {
                        [mimeTypes[extension] || 'application/octet-stream']: [`.${extension}`]
                      }
                    }]
                  })
                  
                  const fileData = await b2Service.retrieveFile(row.original.filePath!)
                  
                  const writable = await handle.createWritable()
                  await writable.write(fileData)
                  await writable.close()

                  toast({
                    title: "Download Complete",
                    description: `Successfully downloaded ${fileName}`,
                  })

                } catch (error) {
                  if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('❌ Download failed:', error)
                    toast({
                      variant: "destructive",
                      title: "Download Failed",
                      description: "There was an error downloading your file.",
                    })
                  }
                } finally {
                  setAudioState?.(prev => ({ ...prev, downloadingRow: null }))
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </MenuItem>
          ) : (
            <MenuItem 
              onClick={() => handleFolderDownload(row.original.id!, row.original.name)}
            >
              <Download className="mr-2 h-4 w-4" /> Download
            </MenuItem>
          )}
        </>
      )}

      {!isOwner ? (
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation()
            handleAction(onLeave!)
          }}
          className="text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" /> Leave
        </MenuItem>
      ) : (
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation()
            handleAction(onDelete!)
          }}
          className="text-red-500"
        >
          <Trash className="mr-2 h-4 w-4" /> Delete
        </MenuItem>
      )}

      {downloadProgress && (
        <DownloadProgress 
          isOpen={!!downloadProgress}
          progress={downloadProgress}
        />
      )}
    </>
  )
}