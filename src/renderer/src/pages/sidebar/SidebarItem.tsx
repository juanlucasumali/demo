import { FC, useState } from 'react';
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
  const { navigateToFolder, getFolderContents } = useFileSystem();

  const [isExpanded, setIsExpanded] = useState(false);
  const [subFolders, setSubFolders] = useState<DatabaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const isFolder = item.type === 'folder';

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

  const handleFolderClick = (folderId: string) => {
    const targetFolderId = folderId === 'root' ? null : folderId;
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
