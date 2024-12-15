import { Project } from "../types";

export const projects: Project[] = [
  {
    id: 'project-001',
    name: 'Midnight Echoes',
    ownerId: '',
    icon: null,
    isStarred: true,
    description: 'Dark R&B track with atmospheric electronic elements.',
    createdAt: '2024-01-15T10:30:00Z',
    lastModified: '2024-02-20T15:45:00Z',
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
    ownerId: '',
    icon: null,
    isStarred: false,
    description: 'High-energy trap beat with drill influences.',
    createdAt: '2024-01-20T08:00:00Z',
    lastModified: '2024-02-01T11:20:00Z',
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
    ownerId: '',
    name: 'Ethereal Dreams',
    icon: null,
    isStarred: true,
    description: 'Ambient indie track with atmospheric soundscapes.',
    createdAt: '2024-01-05T14:15:00Z',
    lastModified: '2024-02-25T09:30:00Z',
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'Ambient', color: 'blue' },
      { category: 'genre', name: 'Indie', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
    ]
  },
  {
    id: 'project-004',
    ownerId: '',
    name: 'Summer Waves',
    icon: null,
    isStarred: true,
    description: 'Upbeat Afrobeats fusion with house elements.',
    createdAt: '2024-01-12T09:30:00Z',
    lastModified: '2024-02-18T14:25:00Z',
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
    ownerId: '',
    icon: null,
    isStarred: false,
    description: 'Alternative R&B with electronic influences.',
    createdAt: '2024-01-05T11:45:00Z',
    lastModified: '2024-02-02T16:30:00Z',
    tags: [
      { category: 'stage', name: 'Final', color: 'green' },
      { category: 'genre', name: 'R&B', color: 'blue' },
      { category: 'genre', name: 'Alternative', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
    ]
  },
  {
    id: '1',
    ownerId: '',
    name: "Meowing in Auto-Tune: The Album",
    icon: "🐱",
    description: "Converting my cat's 3AM concerts into the next viral sensation. Currently seeking cat choir for backing vocals.",
    createdAt: "2024-01-15",
    lastModified: "2024-01-28",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'In-Progress', color: 'green' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'genre', name: 'Alternative', color: 'blue' },
      { category: 'needs', name: 'Mixing', color: 'purple' }
    ]
  },
  {
    id: '2',
    ownerId: '',
    name: "Minecraft Villager Trap Symphony",
    icon: "⛏️",
    description: "Turning 'Hrmm' into heat. Features creeper explosion 808s and zombie growl ad-libs.",
    createdAt: "2024-01-20",
    lastModified: "2024-01-27",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Demo', color: 'green' },
      { category: 'genre', name: 'Trap', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
    ]
  },
  {
    id: '3',
    ownerId: '',
    name: "Grandma's Recipe Book Type Beat",
    icon: "👵",
    description: "Each track inspired by a different cookie recipe. The snare is literally me slapping cookie dough.",
    createdAt: "2024-01-10",
    lastModified: "2024-01-26",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'Lo-Fi', color: 'blue' },
      { category: 'needs', name: 'Melody', color: 'purple' }
    ]
  },
  {
    id: '4',
    ownerId: '',
    name: "Discord Notification Core",
    icon: "💬",
    description: "For people who get anxiety every time they hear the Discord ping. Now in beat form!",
    createdAt: "2024-01-22",
    lastModified: "2024-01-25",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Mixing', color: 'green' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'needs', name: 'Feedback', color: 'purple' }
    ]
  },
  {
    id: '5',
    ownerId: '',
    name: "Zoom Meeting Beats to Study/Panic To",
    icon: "📹",
    description: "Sample pack made entirely from Zoom sounds. 'You're on mute' is the new 'DJ Khaled'.",
    createdAt: "2024-01-05",
    lastModified: "2024-01-24",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Final', color: 'green' },
      { category: 'genre', name: 'Ambient', color: 'blue' },
      { category: 'genre', name: 'House', color: 'blue' }
    ]
  },
  {
    id: '6',
    ownerId: '',
    name: "IKEA Instructions Core",
    icon: "🔧",
    description: "Each track represents a different stage of furniture assembly frustration.",
    createdAt: "2024-01-18",
    lastModified: "2024-01-23",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Concept', color: 'green' },
      { category: 'genre', name: 'Experimental', color: 'blue' },
      { category: 'needs', name: 'Producer', color: 'purple' }
    ]
  },
  {
    id: '7',
    ownerId: '',
    name: "WiFi Router Symphony",
    icon: "📶",
    description: "The sweet sound of router beeps arranged into a drill beat. Features dial-up modem adlibs.",
    createdAt: "2024-01-12",
    lastModified: "2024-01-22",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Demo', color: 'green' },
      { category: 'genre', name: 'Drill', color: 'blue' },
      { category: 'needs', name: 'Drums', color: 'purple' }
    ]
  },
  {
    id: '8',
    ownerId: '',
    name: "Rubber Duck Debug Beats",
    icon: "🦆",
    description: "Programming rubber duck squeaks turned into a trap masterpiece. Stack overflow certified.",
    createdAt: "2024-01-08",
    lastModified: "2024-01-21",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Mastering', color: 'green' },
      { category: 'genre', name: 'Trap', color: 'blue' },
      { category: 'needs', name: 'Vocals', color: 'purple' }
    ]
  },
  {
    id: '9',
    ownerId: '',
    name: "404 Beats Not Found",
    icon: "⚠️",
    description: "Every Windows error sound from 95 to 11 remixed into a full album. Blue screen of death is the drop.",
    createdAt: "2024-01-16",
    lastModified: "2024-01-20",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'In-Progress', color: 'green' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'needs', name: 'Bass', color: 'purple' }
    ]
  },
  {
    id: '10',
    ownerId: '',
    name: "Washing Machine Type Beat",
    icon: "🧺",
    description: "My washing machine was off-balance and accidentally created the hardest beat of 2024.",
    createdAt: "2024-01-01",
    lastModified: "2024-01-19",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'House', color: 'blue' },
      { category: 'needs', name: 'Writing', color: 'purple' }
    ]
  }
];  