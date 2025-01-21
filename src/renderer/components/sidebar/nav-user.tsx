"use client"

import { useUserStore } from "@renderer/stores/user-store"
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
import { Link, useRouterState } from "@tanstack/react-router"

export function NavUser({}: {}) {
  const profile = useUserStore((state) => state.profile)  
  if (!profile) return null
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link to={`/profiles/${profile.id}` as any}>
          <SidebarMenuButton tooltip={'Home'} isActive={useRouterState().location.pathname === `/profiles/${profile.id}`}
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar ?? undefined} alt={profile?.username} />
              <AvatarFallback className="rounded-lg">{profile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-normal">@{profile?.username}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}