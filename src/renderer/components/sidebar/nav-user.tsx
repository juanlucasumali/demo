"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import { UserProfile } from "@renderer/types/users"
import { Link, useRouterState } from "@tanstack/react-router"

export const user: UserProfile = 
  {
    id: "9092012803",
    avatar: null,
    name: "Juan Lucas Umali",
    description: "hiiiiiii tis meeee!",
    username: "juanlucasumali"
  }

export function NavUser({}: {}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to="/profile">
          <SidebarMenuButton tooltip={'Home'} isActive={useRouterState().location.pathname === '/profile'}
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar ?? undefined} alt={user.username} />
              <AvatarFallback className="rounded-lg">{user.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-normal">@{user.username}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}