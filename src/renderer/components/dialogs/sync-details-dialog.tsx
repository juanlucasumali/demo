import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@renderer/components/ui/dialog"
import { ScrollArea } from "@renderer/components/ui/scroll-area"
import { Button } from "@renderer/components/ui/button"
import { Alert, AlertDescription } from "@renderer/components/ui/alert"
import { File, FolderOpen, AlertCircle, Plus, Minus, RefreshCw, Cloud, Loader2, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@renderer/components/ui/tabs"
import { useState } from "react"

interface SyncDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diff: {
    added: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
    modified: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
    removed: { name: string; path: string; type: 'file' | 'folder', localPath?: string }[]
    syncAction: 'USE_REMOTE' | 'USE_LOCAL' | 'CONFLICT'
  }
  localPath: string
  remoteFolderId: string
  onSyncDirectionChosen: (useRemote: boolean) => Promise<void>
  isSyncing: boolean
}

export function SyncDetailsDialog({ 
  open, 
  onOpenChange, 
  diff,
  localPath,
  remoteFolderId,
  onSyncDirectionChosen,
  isSyncing 
}: SyncDetailsDialogProps) {
  const [selectedTab, setSelectedTab] = useState<string>('changes')

  const getRelativePath = (fullPath: string) => {
    if (!fullPath || !localPath) return fullPath
    return fullPath.replace(localPath, '').replace(/^[/\\]/, '')
  }

  const renderIcon = (type: 'file' | 'folder') => {
    return type === 'file' ? <File className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />
  }

  const handleSyncChoice = async (useRemote: boolean) => {
    if (isSyncing) return
    try {
      await onSyncDirectionChosen(useRemote)
    } catch (error) {
      console.error('Sync failed:', error)
      // Error handling moved to parent component
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

  // Helper to get action message
  const getSyncActionMessage = () => {
    switch (diff.syncAction) {
      case 'USE_REMOTE':
        return {
          title: "Remote Changes Detected",
          description: "Remote files have been updated. Click 'Use Remote' to update your local files.",
          showButtons: true,
          defaultAction: 'remote'
        };
      case 'USE_LOCAL':
        return {
          title: "Local Changes Detected",
          description: "Local files have been modified. Click 'Use Local' to update remote files.",
          showButtons: true,
          defaultAction: 'local'
        };
      case 'CONFLICT':
        return {
          title: "Sync Conflict",
          description: "Changes detected in both local and remote files. Please choose which version to keep.",
          showButtons: true,
          defaultAction: null
        };
      default:
        return {
          title: "Files Out of Sync",
          description: "Differences detected between local and remote files.",
          showButtons: true,
          defaultAction: null
        };
    }
  };

  const actionInfo = getSyncActionMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{actionInfo.title}</DialogTitle>
          <DialogDescription>{actionInfo.description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
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
                        <span className="text-xs text-yellow-500 ml-auto">
                          {diff.syncAction === 'CONFLICT' ? 'Conflict' : 'Different version'}
                        </span>
                      )}
                    </div>
                  ))}
                </ScrollArea>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Remote Folder
                </h3>
                <ScrollArea className="h-[400px] border rounded-md p-4">
                  {diff.removed.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
                      {renderIcon(item.type)}
                      <span className="text-sm truncate">{item.name}</span>
                      <span className="text-xs text-blue-500 ml-auto">Only in remote</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details">
            {/* Details content remains the same */}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {actionInfo.showButtons && (
            <div className="flex gap-2">
              <Button
                variant={actionInfo.defaultAction === 'remote' ? 'default' : 'outline'}
                onClick={() => onSyncDirectionChosen(true)}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Use Remote
              </Button>
              <Button
                variant={actionInfo.defaultAction === 'local' ? 'default' : 'outline'}
                onClick={() => onSyncDirectionChosen(false)}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Use Local
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 