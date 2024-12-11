import { FC, useEffect, useState } from 'react';
import { ChevronRight, Folder, MoreHorizontal, Share } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuAction,
  useSidebar,
} from '../../components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { DatabaseItem } from '@renderer/types/files';
import { useFileSystem } from '@renderer/contexts/FileSystemContext';

interface SidebarItemProps {
  item: DatabaseItem;
  isRoot?: boolean;
}

export const SidebarItem: FC<SidebarItemProps> = ({ item, isRoot = false }) => {
  const { isMobile } = useSidebar();
  const { currentFolderId, items, navigateToFolder, getFolderContents } = useFileSystem();

  const [isExpanded, setIsExpanded] = useState(false);
  const [subFolders, setSubFolders] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isFolder = item.type === 'folder';

  console.log('items, currentFolderId', items, currentFolderId)

  useEffect(() => {
    const syncSubFolders = async () => {
      // Only sync if the folder is expanded and it's a folder
      if (isExpanded && hasLoaded && (currentFolderId === item.id)) {
        try {
          const newSubFolders = await getFolderContents(isRoot ? null : item.id);
          
          // Compare current subfolders with new subfolders
          const currentIds = new Set(subFolders.map(f => f.id));
          const newIds = new Set(newSubFolders.map(f => f.id));
          
          // Find folders to add and remove
          const foldersToAdd = newSubFolders.filter(f => !currentIds.has(f.id));
          const foldersToRemove = subFolders.filter(f => !newIds.has(f.id));
          
          if (foldersToAdd.length > 0 || foldersToRemove.length > 0) {
            setSubFolders(prev => {
              const updated = prev.filter(f => !foldersToRemove.some(r => r.id === f.id));
              return [...updated, ...foldersToAdd].sort((a, b) => {
                // Sort by created_at in descending order (most recent first)
                return new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime();
              });
            });
          }
        } catch (error) {
          console.error('Error syncing folders:', error);
        }
      }
    };

    syncSubFolders();
  }, [items]);

  const handleExpand = async () => {
    // Only fetch once
    if (!hasLoaded && isFolder) {
      setIsLoading(true);
      try {
        const loadedFolders = await getFolderContents(isRoot ? null : item.id);
        setSubFolders(loadedFolders);
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading folders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  const handleFolderClick = (folderId: string | null) => {
    const targetFolderId = folderId;
    navigateToFolder(targetFolderId);
  };

  return (
    <Collapsible
      asChild
      open={isExpanded}
      onOpenChange={handleExpand}
      className="w-full"
    >
      <SidebarMenuItem className="w-full">
        <div className="flex w-full items-center">
          {isFolder ? (
            <CollapsibleTrigger asChild>
              <button className="p-1 hover:bg-transparent group" onClick={(e) => e.stopPropagation()}>
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
              </button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-4 h-4 ml-3" /> // Add spacing for non-folders
          )}
          
          <SidebarMenuButton
            tooltip={item.name}
            className="flex-1"
            onClick={() => handleFolderClick(item.id)}
          >
            <Folder className="h-4 w-4" />
            <span className="truncate min-w-0 flex-1">{item.name}</span>
          </SidebarMenuButton>
        </div>

        {isFolder && (
          <CollapsibleContent className="w-full">
            <SidebarMenuSub className="w-full">
              {isLoading ? (
                <>
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </>
              ) : (
                subFolders.map((folder) => (
                  <SidebarItem key={folder.id} item={folder} />
                ))
              )}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}

        {!isRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48"
              side={isMobile ? 'bottom' : 'right'}
              align={isMobile ? 'end' : 'start'}
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem onClick={() => handleFolderClick(item.id)}>
                <Folder className="text-muted-foreground" />
                <span>View Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="text-muted-foreground" />
                <span>Share Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};
