import { FC } from 'react'
import * as React from "react"
import {
  Headphones,
} from "lucide-react"

import { NavMain } from "./NavMain"
import { NavProjects } from "./NavProjects"
import { NavSecondary } from "./NavSecondary"
import { NavUser } from "./NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../ui/sidebar"
import { sidebarData } from '@renderer/data/sidebar'
import { NavItem } from '@renderer/types/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  setCurrentPage: (page: NavItem) => void;
}

export const AppSidebar: FC<AppSidebarProps> = ({ setCurrentPage, ...props }) => {
  return (
    <Sidebar variant="inset" {...props}>
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
        <NavMain setCurrentPage={setCurrentPage} />
        <NavProjects projects={sidebarData.projects} />
        <NavSecondary items={sidebarData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
