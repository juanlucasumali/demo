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
  SidebarMenuAction,
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

    // It's a FileTreeItem
    return (
      <Collapsible asChild defaultOpen={false}>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip={item.name}>
            <div className="flex items-center">
              {item.type === 'folder' ? <Folder className="mr-2" /> : <File className="mr-2" />}
              <span>{item.name}</span>
            </div>
          </SidebarMenuButton>
          {item.type === 'folder' && item.children && (
            <>
              <CollapsibleTrigger asChild>
                <SidebarMenuAction className="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span className="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.children.map((child) => (
                    <FileTreeNode key={child.id} item={child} />
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </>
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
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                onClick={() => setCurrentPage(item)}
              >
                <div className="flex items-center">
                  <item.icon />
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem: any) => (
                        <FileTreeNode 
                          key={subItem.id || subItem.title} 
                          item={subItem} 
                        />
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};