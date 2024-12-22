"use client"

import { Home, PackageIcon, Star } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import { Link, useRouterState } from "@tanstack/react-router"

export function NavMain({}: {
}) {
  const currentRoute = useRouterState().location.pathname
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>

      <SidebarMenuItem>
        <Link to="/home">
          <SidebarMenuButton tooltip={'Home'} isActive={currentRoute === '/home'}>
              <Home />
              <span>{'Home'}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link to="/projects">
          <SidebarMenuButton tooltip={'Projects'} isActive={currentRoute === '/projects'}>
              <PackageIcon />
              <span>{'Projects'}</span>
          </SidebarMenuButton>
        </Link>
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

