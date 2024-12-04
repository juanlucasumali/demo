import { FC } from 'react'
import { ChevronRight, File, Folder } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar"
import { NavItem, NavSubItem } from '@renderer/types/sidebar';
import { FileTreeItem } from '@renderer/types/files';

const FileTreeNode: FC<{ item: NavSubItem | FileTreeItem }> = ({ item }) => {
  // Check if it's a NavSubItem
  if ('title' in item) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild>
          <a href={item.url}>
            <span>{item.title}</span>
          </a>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  // For files
  if (item.type === 'file') {
    return (
      <SidebarMenuItem className="w-full">
        <SidebarMenuButton tooltip={item.name} className="w-full">
          <File className="flex-shrink-0" />
          <span className="truncate min-w-0 flex-1">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // For folders
  return (
    <Collapsible asChild defaultOpen={false} className="w-full">
      <SidebarMenuItem className="w-full">
        <div className="flex w-full items-center">
          <CollapsibleTrigger asChild>
            <button className="p-1 hover:bg-transparent group">
              <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
            </button>
          </CollapsibleTrigger>
          <SidebarMenuButton tooltip={item.name} className="flex-1">
            <Folder className="flex-shrink-0" />
            <span className="truncate min-w-0 flex-1">{item.name}</span>
          </SidebarMenuButton>
        </div>
        {item.children && (
          <CollapsibleContent className="w-full">
            <SidebarMenuSub className="w-full">
              {item.children.map((child) => (
                <FileTreeNode key={child.id} item={child} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

interface NavMainProps {
  items: NavItem[];
  setCurrentPage: (item: NavItem) => void;
}

export const NavMain: FC<NavMainProps> = ({ items, setCurrentPage }) => {
  return (
    <SidebarGroup className="w-full">
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu className="w-full">
        {items.map((item) => (
          <Collapsible 
            key={item.title} 
            asChild 
            defaultOpen={item.isActive}
            className="w-full"
          >
            <SidebarMenuItem className="w-full">
              <div className="flex w-full items-center">
                {item.items?.length ? (
                  <CollapsibleTrigger asChild>
                    <button className="p-1 hover:bg-transparent group">
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                    </button>
                  </CollapsibleTrigger>
                ) : null}
                <SidebarMenuButton 
                  tooltip={item.title}
                  onClick={() => setCurrentPage(item)}
                  className="flex-1"
                >
                  <item.icon className="flex-shrink-0" />
                  <span className="truncate min-w-0 flex-1">{item.title}</span>
                </SidebarMenuButton>
              </div>
              {item.items?.length ? (
                <CollapsibleContent className="w-full">
                  <SidebarMenuSub className="w-full">
                    {item.items?.map((subItem: any) => (
                      <FileTreeNode 
                        key={subItem.id || subItem.title} 
                        item={subItem} 
                      />
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};