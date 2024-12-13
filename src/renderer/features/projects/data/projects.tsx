import { TagCategory } from "@/renderer/constants/project-tags";

export interface Tag {
  category: TagCategory;
  name: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  logo: null;
  isStarred: boolean;
  description: string;
  dateCreated: string;
  dateModified: string;
  tags: Tag[];
}

export const projects: Project[] = [
  {
    id: 'project-001',
    name: 'Midnight Echoes',
    logo: null,
    isStarred: true,
    description: 'Dark R&B track with atmospheric electronic elements.',
    dateCreated: '2024-01-15T10:30:00Z',
    dateModified: '2024-02-20T15:45:00Z',
    tags: [
      { category: 'stage', name: 'In-Progress', color: 'blue' },
      { category: 'genre', name: 'R&B', color: 'purple' },
      { category: 'genre', name: 'Electronic', color: 'purple' },
      { category: 'needs', name: 'Vocals', color: 'green' },
      { category: 'needs', name: 'Mixing', color: 'green' }
    ]
  },
  {
    id: 'project-002',
    name: 'Urban Pulse',
    logo: null,
    isStarred: false,
    description: 'High-energy trap beat with drill influences.',
    dateCreated: '2024-01-20T08:00:00Z',
    dateModified: '2024-02-01T11:20:00Z',
    tags: [
      { category: 'stage', name: 'Demo', color: 'blue' },
      { category: 'genre', name: 'Trap', color: 'purple' },
      { category: 'genre', name: 'Drill', color: 'purple' },
      { category: 'needs', name: 'Melody', color: 'green' },
      { category: 'needs', name: 'Bass', color: 'green' }
    ]
  },
  {
    id: 'project-003',
    name: 'Ethereal Dreams',
    logo: null,
    isStarred: true,
    description: 'Ambient indie track with atmospheric soundscapes.',
    dateCreated: '2024-01-05T14:15:00Z',
    dateModified: '2024-02-25T09:30:00Z',
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'blue' },
      { category: 'genre', name: 'Ambient', color: 'purple' },
      { category: 'genre', name: 'Indie', color: 'purple' },
      { category: 'needs', name: 'Mastering', color: 'green' }
    ]
  },
  {
    id: 'project-004',
    name: 'Summer Waves',
    logo: null,
    isStarred: true,
    description: 'Upbeat Afrobeats fusion with house elements.',
    dateCreated: '2024-01-12T09:30:00Z',
    dateModified: '2024-02-18T14:25:00Z',
    tags: [
      { category: 'stage', name: 'Mixing', color: 'blue' },
      { category: 'genre', name: 'Afrobeats', color: 'purple' },
      { category: 'genre', name: 'House', color: 'purple' },
      { category: 'needs', name: 'Vocals', color: 'green' },
      { category: 'needs', name: 'Producer', color: 'green' }
    ]
  },
  {
    id: 'project-005',
    name: 'Electric Soul',
    logo: null,
    isStarred: false,
    description: 'Alternative R&B with electronic influences.',
    dateCreated: '2024-01-05T11:45:00Z',
    dateModified: '2024-02-02T16:30:00Z',
    tags: [
      { category: 'stage', name: 'Final', color: 'blue' },
      { category: 'genre', name: 'R&B', color: 'purple' },
      { category: 'genre', name: 'Alternative', color: 'purple' },
      { category: 'needs', name: 'Mastering', color: 'green' }
    ]
  }
]
