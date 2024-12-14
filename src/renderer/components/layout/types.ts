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
  tags: ProjectTag[]
}

export interface ProjectTag {
  category: TagCategory
  name: string
  color: string
}

export type ProjectItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  starred: boolean
  description: string
  fileFormat: string | null
  size: number | null
  duration: number | null
  dateModified: Date
  dateCreated: Date
  createdBy: string
  tags: string[] | null
}

export const PROJECT_TAGS = {
  stage: {
    color: 'green',
    allowMultiple: false,
    options: [
      'Concept',
      'Demo',
      'In-Progress',
      'Arrangement',
      'Mixing',
      'Mastering',
      'Final',
    ]
  },
  genre: {
    color: 'blue',
    allowMultiple: true,
    options: [
      'Hip-Hop',
      'R&B',
      'Pop',
      'Electronic',
      'Trap',
      'Drill',
      'Afrobeats',
      'House',
      'Rock',
      'Alternative',
      'Indie',
      'Ambient',
    ]
  },
  needs: {
    color: 'purple',
    allowMultiple: true,
    options: [
      'Vocals',
      'Melody',
      'Drums',
      'Bass',
      'Mixing',
      'Mastering',
      'Producer',
      'Feedback',
      'Instruments',
      'Writing',
    ]
  }
} as const

export type TagCategory = keyof typeof PROJECT_TAGS

export interface DisplayPreferences {
  tags: boolean
  dateCreated: boolean
  dateModified: boolean
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
