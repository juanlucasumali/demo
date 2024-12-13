import { LinkProps } from '@tanstack/react-router'

export interface UserProfile {
  username: string
  displayName: string
  email: string
  avatar: string | null
  localPath: string | null
}

export interface Project {
  id: string
  name: string;
  logo: string | null;
  description: string;
  dateCreated: string;
  dateModified: string;
  isStarred: boolean
  tags: {
    name: string;
    color: string;
  }[];
}

interface Team {
  name: string
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
}

export type NavItem =
  | (BaseNavItem & {
      items: (BaseNavItem & { url: LinkProps['to'] })[]
      url?: never
    })
  | (BaseNavItem & {
      url: LinkProps['to']
      items?: never
    })

interface NavGroup {
  title: string
  items: NavItem[]
}

interface SidebarData {
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup }
