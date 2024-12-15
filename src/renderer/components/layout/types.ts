import { LinkProps } from '@tanstack/react-router'

export interface UserProfile {
  username: string
  displayName: string
  email: string
  avatar: string | null
  localPath: string | null
}

export type Project = {
  createdAt: string;
  description: string | null;
  icon: string | null;
  id: string;
  isStarred: boolean;
  lastModified: string;
  name: string;
  ownerId: string;
  tags: ProjectTag[],
} 

export interface ProjectTag {
  category: TagCategory
  name: string
  color: string
}

export interface ProjectItem {
  id: string
  name: string
  type: 'file' | 'folder'
  isStarred: boolean
  description: string
  fileFormat: string | null
  size: number | null
  duration: number | null
  lastModified: Date | null
  createdAt: Date | null
  ownerId: string
  tags: string[]
  projectId: string
  parentFolderId: string | null
  filePath: string | null
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

export const FILE_TAGS = {
  type: {
    color: 'blue',
    allowMultiple: false,
    options: [
      'Stems',
      'Mix',
      'Master',
      'Reference',
      'Project File',  // DAW project files
      'Sample Pack',
      'Recording',
      'Bounce',        // Quick exports/drafts
    ]
  },
  instrument: {
    color: 'orange',
    allowMultiple: true,
    options: [
      'Vocals',
      'Drums',
      'Bass',
      'Keys',
      'Synth',
      'Guitar',
      'Strings',
      'Brass',
      'FX',
      'Percussion',
    ]
  },
  status: {
    color: 'green',
    allowMultiple: false,
    options: [
      'Draft',
      'Final',
      'Approved',
      'Needs Revision',
      'Reference Only',
      'Archive',
    ]
  },
  version: {
    color: 'purple',
    allowMultiple: false,
    options: [
      'Dry',      // No effects
      'Wet',      // With effects
      'Edited',
      'Tuned',
      'Compressed',
      'Clean',    // Noise reduced/cleaned up
    ]
  },
} as const

export type FileTags = keyof typeof FILE_TAGS

export interface DisplayPreferences {
  tags: boolean
  createdAt: boolean
  lastModified: boolean
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
