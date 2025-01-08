import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { Button } from "@renderer/components/ui/button"
import { Alert, AlertDescription } from "@renderer/components/ui/alert"
import { File, FolderOpen, ArrowRightFromLine, ArrowLeftFromLine, AlertCircle, Plus, Minus, RefreshCw, Cloud } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@renderer/components/ui/tabs"

interface SyncDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diff: {
    added: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
    modified: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
    removed: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
  }
  localPath: string
  remoteFolderId: string
  onSyncDirectionChosen: (useRemote: boolean) => Promise<void>
}

export function SyncDetailsDialog({ 
  open, 
  onOpenChange, 
  diff,
  localPath,
  remoteFolderId,
  onSyncDirectionChosen 
}: SyncDetailsDialogProps) {
  const getRelativePath = (fullPath: string) => {
    if (!fullPath || !localPath) return fullPath
    return fullPath.replace(localPath, '').replace(/^[/\\]/, '')
  }

  const renderIcon = (type: 'file' | 'folder') => {
    return type === 'file' ? <File className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />
  }

  const handleSyncChoice = async (useRemote: boolean) => {
    try {
      await onSyncDirectionChosen(useRemote)
      onOpenChange(false)
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync files. Please try again.')
    }
  }

  const renderChangeList = (items: typeof diff.added, changeType: 'added' | 'modified' | 'removed') => {
    if (!items.length) return null
    
    const icons = {
      added: <Plus className="h-4 w-4 text-green-500" />,
      modified: <RefreshCw className="h-4 w-4 text-yellow-500" />,
      removed: <Minus className="h-4 w-4 text-red-500" />
    }

    return items.map((item, index) => (
      <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
        {icons[changeType]}
        {renderIcon(item.type)}
        <span className="text-sm truncate">
          {item.localPath ? getRelativePath(item.localPath) : item.path}
        </span>
      </div>
    ))
  }

  console.log(diff)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Sync Conflict Detected</DialogTitle>
          <DialogDescription>
            Your local and remote files are out of sync. Review the changes and choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Found {diff.added.length} new, {diff.modified.length} modified, and {diff.removed.length} removed files
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="changes" className="w-full">
          <TabsList>
            <TabsTrigger value="changes">Current State</TabsTrigger>
            <TabsTrigger value="preview">Action Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="changes">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Current Local Folder
                </h3>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  {[...diff.added, ...diff.modified].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                      {renderIcon(item.type)}
                      <span className="text-sm truncate">
                        {item.localPath ? getRelativePath(item.localPath) : item.path}
                      </span>
                      {diff.added.includes(item) && (
                        <span className="text-xs text-green-500 ml-auto">Only in local</span>
                      )}
                      {diff.modified.includes(item) && (
                        <span className="text-xs text-yellow-500 ml-auto">Different version</span>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Current Remote Folder
                </h3>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  {[...diff.removed, ...diff.modified].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                      {renderIcon(item.type)}
                      <span className="text-sm truncate">
                        {item.localPath ? getRelativePath(item.localPath) : item.path}
                      </span>
                      {diff.removed.includes(item) && (
                        <span className="text-xs text-red-500 ml-auto">Only in remote</span>
                      )}
                      {diff.modified.includes(item) && (
                        <span className="text-xs text-yellow-500 ml-auto">Different version</span>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Button
                  variant="outline"
                  onClick={() => handleSyncChoice(false)}
                  className="h-auto p-6 flex flex-col items-stretch gap-4"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <FolderOpen className="h-5 w-5" />
                    Keep Local Version
                  </div>
                  <div className="text-sm text-left space-y-2">
                    <p className="text-muted-foreground">This will:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li className="text-green-500">Upload {diff.added.length} new files to remote</li>
                      <li className="text-yellow-500">Update {diff.modified.length} files in remote</li>
                      <li className="text-red-500">Delete {diff.removed.length} files from remote</li>
                    </ul>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSyncChoice(true)}
                  className="h-auto p-6 flex flex-col items-stretch gap-4"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Cloud className="h-5 w-5" />
                    Keep Remote Version
                  </div>
                  <div className="text-sm text-left space-y-2">
                    <p className="text-muted-foreground">This will:</p>
                    <ul className="space-y-1 list-disc pl-4">
                      <li className="text-red-500">Delete {diff.added.length} files from local</li>
                      <li className="text-yellow-500">Update {diff.modified.length} files in local</li>
                      <li className="text-green-500">Download {diff.removed.length} files to local</li>
                    </ul>
                  </div>
                </Button>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will permanently sync the folders. Make sure you've backed up any important files.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="text-sm text-muted-foreground">
            Switch to the "Action Preview" tab to make your choice
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 