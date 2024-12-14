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
      { category: 'stage', name: 'In-Progress', color: 'green' },
      { category: 'genre', name: 'R&B', color: 'blue' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'needs', name: 'Vocals', color: 'purple' },
      { category: 'needs', name: 'Mixing', color: 'purple' }
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
      { category: 'stage', name: 'Demo', color: 'green' },
      { category: 'genre', name: 'Trap', color: 'blue' },
      { category: 'genre', name: 'Drill', color: 'blue' },
      { category: 'needs', name: 'Melody', color: 'purple' },
      { category: 'needs', name: 'Bass', color: 'purple' }
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
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'Ambient', color: 'blue' },
      { category: 'genre', name: 'Indie', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
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
      { category: 'stage', name: 'Mixing', color: 'green' },
      { category: 'genre', name: 'Afrobeats', color: 'blue' },
      { category: 'genre', name: 'House', color: 'blue' },
      { category: 'needs', name: 'Vocals', color: 'purple' },
      { category: 'needs', name: 'Producer', color: 'purple' }
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
      { category: 'stage', name: 'Final', color: 'green' },
      { category: 'genre', name: 'R&B', color: 'blue' },
      { category: 'genre', name: 'Alternative', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
    ]
  }
]
