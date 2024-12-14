import { Project } from "../types";

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
  },
  {
    id: '1',
    name: "Meowing in Auto-Tune: The Album",
    logo: "🐱",
    description: "Converting my cat's 3AM concerts into the next viral sensation. Currently seeking cat choir for backing vocals.",
    dateCreated: "2024-01-15",
    dateModified: "2024-01-28",
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
    name: "Minecraft Villager Trap Symphony",
    logo: "⛏️",
    description: "Turning 'Hrmm' into heat. Features creeper explosion 808s and zombie growl ad-libs.",
    dateCreated: "2024-01-20",
    dateModified: "2024-01-27",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Demo', color: 'green' },
      { category: 'genre', name: 'Trap', color: 'blue' },
      { category: 'needs', name: 'Mastering', color: 'purple' }
    ]
  },
  {
    id: '3',
    name: "Grandma's Recipe Book Type Beat",
    logo: "👵",
    description: "Each track inspired by a different cookie recipe. The snare is literally me slapping cookie dough.",
    dateCreated: "2024-01-10",
    dateModified: "2024-01-26",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'Lo-Fi', color: 'blue' },
      { category: 'needs', name: 'Melody', color: 'purple' }
    ]
  },
  {
    id: '4',
    name: "Discord Notification Core",
    logo: "💬",
    description: "For people who get anxiety every time they hear the Discord ping. Now in beat form!",
    dateCreated: "2024-01-22",
    dateModified: "2024-01-25",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Mixing', color: 'green' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'needs', name: 'Feedback', color: 'purple' }
    ]
  },
  {
    id: '5',
    name: "Zoom Meeting Beats to Study/Panic To",
    logo: "📹",
    description: "Sample pack made entirely from Zoom sounds. 'You're on mute' is the new 'DJ Khaled'.",
    dateCreated: "2024-01-05",
    dateModified: "2024-01-24",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Final', color: 'green' },
      { category: 'genre', name: 'Ambient', color: 'blue' },
      { category: 'genre', name: 'House', color: 'blue' }
    ]
  },
  {
    id: '6',
    name: "IKEA Instructions Core",
    logo: "🔧",
    description: "Each track represents a different stage of furniture assembly frustration.",
    dateCreated: "2024-01-18",
    dateModified: "2024-01-23",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Concept', color: 'green' },
      { category: 'genre', name: 'Experimental', color: 'blue' },
      { category: 'needs', name: 'Producer', color: 'purple' }
    ]
  },
  {
    id: '7',
    name: "WiFi Router Symphony",
    logo: "📶",
    description: "The sweet sound of router beeps arranged into a drill beat. Features dial-up modem adlibs.",
    dateCreated: "2024-01-12",
    dateModified: "2024-01-22",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'Demo', color: 'green' },
      { category: 'genre', name: 'Drill', color: 'blue' },
      { category: 'needs', name: 'Drums', color: 'purple' }
    ]
  },
  {
    id: '8',
    name: "Rubber Duck Debug Beats",
    logo: "🦆",
    description: "Programming rubber duck squeaks turned into a trap masterpiece. Stack overflow certified.",
    dateCreated: "2024-01-08",
    dateModified: "2024-01-21",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Mastering', color: 'green' },
      { category: 'genre', name: 'Trap', color: 'blue' },
      { category: 'needs', name: 'Vocals', color: 'purple' }
    ]
  },
  {
    id: '9',
    name: "404 Beats Not Found",
    logo: "⚠️",
    description: "Every Windows error sound from 95 to 11 remixed into a full album. Blue screen of death is the drop.",
    dateCreated: "2024-01-16",
    dateModified: "2024-01-20",
    isStarred: false,
    tags: [
      { category: 'stage', name: 'In-Progress', color: 'green' },
      { category: 'genre', name: 'Electronic', color: 'blue' },
      { category: 'needs', name: 'Bass', color: 'purple' }
    ]
  },
  {
    id: '10',
    name: "Washing Machine Type Beat",
    logo: "🧺",
    description: "My washing machine was off-balance and accidentally created the hardest beat of 2024.",
    dateCreated: "2024-01-01",
    dateModified: "2024-01-19",
    isStarred: true,
    tags: [
      { category: 'stage', name: 'Arrangement', color: 'green' },
      { category: 'genre', name: 'House', color: 'blue' },
      { category: 'needs', name: 'Writing', color: 'purple' }
    ]
  }
];  