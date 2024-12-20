"use client"

import { Home, PackageIcon, Star } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"

export function NavMain({
}: {
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>

        <SidebarMenuItem>
            <SidebarMenuButton tooltip={'Home'}>
              <Home />
              <span>{'Home'}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <SidebarMenuButton tooltip={'Projects'}>
              <PackageIcon />
              <span>{'Projects'}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
            <SidebarMenuButton tooltip={'Starred'}>
              <Star />
              <span>{'Starred'}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>

      </SidebarMenu>
    </SidebarGroup>
  )
}

