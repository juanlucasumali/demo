import { FC } from 'react';
import { ChevronRight, File, Folder, MoreHorizontal, Share, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuAction,
  useSidebar,
} from "../../ui/sidebar";
import { FileTreeItem } from '@renderer/types/files';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';

interface SidebarItemProps {
  item: FileTreeItem;
  setCurrentPage: (item: any) => void;
}

export const SidebarItem: FC<SidebarItemProps> = ({ item, setCurrentPage }) => {
  const isFolder = item.type === 'folder';
  const { isMobile } = useSidebar()

  const handleClick = () => {
    setCurrentPage(item);
  };

  if (isFolder) {
    return (
      <Collapsible asChild defaultOpen={false} className="w-full">
        <SidebarMenuItem className="w-full">
          <div className="flex w-full items-center">
            <CollapsibleTrigger asChild>
              <button className="p-1 hover:bg-transparent group">
                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
              </button>
            </CollapsibleTrigger>
            <SidebarMenuButton tooltip={item.name} className="flex-1" onClick={handleClick}>
              <Folder className="h-4 w-4 flex-shrink-0 text-muted-foreground fill-current" />
              <span className="truncate min-w-0 flex-1">{item.name}</span>
            </SidebarMenuButton>
          </div>
          {item.children && item.children.length > 0 && (
            <CollapsibleContent className="w-full">
              <SidebarMenuSub className="w-full">
                {item.children.map((child) => (
                  <SidebarItem
                    key={child.id}
                    item={child}
                    setCurrentPage={setCurrentPage}
                  />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
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
                <DropdownMenuItem>
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
        </SidebarMenuItem>
      </Collapsible>
    );
  } else {
    return (
      <SidebarMenuItem className="w-full">
        <SidebarMenuButton tooltip={item.name} className="w-full" onClick={handleClick}>
          <File className="flex-shrink-0" />
          <span className="truncate min-w-0 flex-1">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
};
