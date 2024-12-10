import { FC, useState } from 'react'
import { ChevronRight, Folder, MoreHorizontal, Share, Trash2 } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuAction,
  useSidebar,
} from "../../ui/sidebar"
import { DemoItem } from '@renderer/types/files'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu'
import { useItems } from '@renderer/hooks/useItems'
import { Skeleton } from '../../ui/skeleton'
import { useNavigate } from 'react-router-dom'

interface SidebarItemProps {
  item: DemoItem;
  onNavigate: (path: string, folderId: string | null) => void;
  isRoot?: boolean;
}

export const SidebarItem: FC<SidebarItemProps> = ({ item, onNavigate, isRoot = false }) => {
  const { isMobile } = useSidebar();
  const { getFolderContents } = useItems();
  const [isExpanded, setIsExpanded] = useState(false);
  const [subFolders, setSubFolders] = useState<DemoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (hasLoaded && folders) {
  //     const currentSubFolders = folders
  //       .filter(folder => folder.parentId === (isRoot ? null : item.id))
  //       .sort((a, b) => {
  //         // Sort by created_at in descending order (most recent first)
  //         return new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime();
  //       });
  //     setSubFolders(currentSubFolders);
  //   }
  // }, [folders]);

  const handleExpand = async () => {
    if (!hasLoaded) {
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
    console.log(folderId)
    if (folderId === "root") {
      navigate(`/dashboard/files`);
    } else {
      navigate(`/dashboard/files/${folderId}`);
    }
  };

  return (
    <Collapsible asChild open={isExpanded} onOpenChange={handleExpand} className="w-full">
      <SidebarMenuItem className="w-full">
        <div className="flex w-full items-center">
          <CollapsibleTrigger asChild>
            <button className="p-1 hover:bg-transparent group">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <SidebarMenuButton tooltip={item.name} className="flex-1" onClick={() => handleFolderClick(item.id)}>
            <Folder className="h-4 w-4" />
            <span className="truncate min-w-0 flex-1">{item.name}</span>
          </SidebarMenuButton>
        </div>
        
        <CollapsibleContent className="w-full">
          <SidebarMenuSub className="w-full">
            {isLoading ? (
              <>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </>
            ) : (
              subFolders.map((folder) => (
                <SidebarItem
                  key={folder.id}
                  item={folder}
                  onNavigate={onNavigate}
                />
              ))
            )}
          </SidebarMenuSub>
        </CollapsibleContent>

        {!isRoot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-48"
              side={isMobile ? "bottom" : "right"}
              align={isMobile ? "end" : "start"}
            >
              <DropdownMenuItem onClick={() => handleFolderClick(item.id)}>
                <Folder className="text-muted-foreground" />
                <span>View Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share className="text-muted-foreground" />
                <span>Share Folder</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="text-muted-foreground" />
                <span>Delete Folder</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};
