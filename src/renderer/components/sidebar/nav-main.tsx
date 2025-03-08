"use client"

import { Box, Home, Link2 } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import { Link, useRouterState } from "@tanstack/react-router"
import { useNotificationsStore } from '@renderer/stores/notifications-store'

export function NavMain({}: {
}) {
  const currentRoute = useRouterState().location.pathname
  const clearSearch = useNotificationsStore(state => state.clearSearch)

  const handleHomeClick = (e: React.MouseEvent) => {
    if (currentRoute === '/home') {
      e.preventDefault()
      clearSearch()
    }
  }

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>

      <SidebarMenuItem>
        <Link to="/home" onClick={handleHomeClick}>
          <SidebarMenuButton tooltip={'Home'} isActive={currentRoute === '/home'}>
              <Home />
              <span>{'Home'}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link to="/projects">
          <SidebarMenuButton tooltip={'Projects'} isActive={currentRoute === '/projects'}>
              <Box />
              <span>{'Projects'}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <Link to="/integrations">
          <SidebarMenuButton tooltip={'Integrations'} isActive={currentRoute === '/integrations'}>
              <Link2 />
              <span>{'Integrations'}</span>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>

      </SidebarMenu>
    </SidebarGroup>
  )
}

