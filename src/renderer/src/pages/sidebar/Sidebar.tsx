import { FC } from 'react'
import * as React from "react"
import { Headphones } from "lucide-react"
import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "../../components/ui/sidebar"
import { SidebarItem } from './SidebarItem'

interface SidebarProps extends React.ComponentProps<typeof UISidebar> {}

export const Sidebar: FC<SidebarProps> = (props) => {
  return (
    <UISidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Headphones className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Demo</span>
                  <span className="truncate text-xs">Personal Plan</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarItem
            item={{
              id: 'root',
              name: 'My Files',
              type: 'folder',
              format: '',
              dateUploaded: '',
              size: 0,
              parentId: null,
              filePath: null
            }}
            isRoot
          />
        </SidebarMenu>
      </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser /> */}
      </SidebarFooter>
    </UISidebar>
  )
}
