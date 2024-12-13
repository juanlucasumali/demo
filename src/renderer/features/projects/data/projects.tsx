import {
  IconBrandDiscord,
  IconBrandDocker,
  IconBrandFigma,
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandGmail,
  IconBrandMedium,
  IconBrandNotion,
  IconBrandSkype,
  IconBrandSlack,
  IconBrandStripe,
  IconBrandTelegram,
  IconBrandTrello,
  IconBrandWhatsapp,
  IconBrandZoom,
} from '@tabler/icons-react'

export const projects = [
  {
    id: 'telegram-001',
    name: 'Telegram',
    logo: 'telegram',
    isStarred: false,
    description: 'Connect with Telegram for real-time communication.',
    dateCreated: '2023-12-15T10:30:00Z',
    dateModified: '2024-01-20T15:45:00Z',
    tags: [
      { id: 'tag-001', name: 'Communication', color: 'blue' },
      { id: 'tag-002', name: 'Messaging', color: 'sky' }
    ]
  },
  {
    id: 'notion-002',
    name: 'Notion',
    logo: 'notion',
    isStarred: true,
    description: 'Effortlessly sync Notion pages for seamless collaboration.',
    dateCreated: '2023-11-20T08:00:00Z',
    dateModified: '2024-02-01T11:20:00Z',
    tags: [
      { id: 'tag-003', name: 'Productivity', color: 'purple' },
      { id: 'tag-004', name: 'Documentation', color: 'gray' },
      { id: 'tag-005', name: 'Team', color: 'blue' }
    ]
  },
  {
    id: 'figma-003',
    name: 'Figma',
    logo: 'figma',
    isStarred: true,
    description: 'View and collaborate on Figma designs in one place.',
    dateCreated: '2023-10-05T14:15:00Z',
    dateModified: '2024-01-25T09:30:00Z',
    tags: [
      { id: 'tag-006', name: 'Design', color: 'pink' },
      { id: 'tag-007', name: 'Collaboration', color: 'purple' }
    ]
  },
  {
    id: 'trello-004',
    name: 'Trello',
    logo: 'trello',
    isStarred: false,
    description: 'Sync Trello cards for streamlined project management.',
    dateCreated: '2023-10-12T09:30:00Z',
    dateModified: '2024-01-18T14:25:00Z',
    tags: [
      { id: 'tag-008', name: 'Project Management', color: 'blue' },
      { id: 'tag-009', name: 'Organization', color: 'sky' }
    ]
  },
  {
    id: 'slack-005',
    name: 'Slack',
    logo: 'slack',
    isStarred: true,
    description: 'Integrate Slack for efficient team communication',
    dateCreated: '2023-11-05T11:45:00Z',
    dateModified: '2024-02-02T16:30:00Z',
    tags: [
      { id: 'tag-010', name: 'Communication', color: 'green' },
      { id: 'tag-011', name: 'Team', color: 'blue' }
    ]
  },
  {
    id: 'zoom-006',
    name: 'Zoom',
    logo: 'zoom',
    isStarred: false,
    description: 'Host Zoom meetings directly from the dashboard.',
    dateCreated: '2023-09-28T13:15:00Z',
    dateModified: '2024-01-30T10:45:00Z',
    tags: [
      { id: 'tag-012', name: 'Meetings', color: 'blue' },
      { id: 'tag-013', name: 'Video', color: 'sky' }
    ]
  },
  {
    id: 'stripe-007',
    name: 'Stripe',
    logo: 'stripe',
    isStarred: true,
    description: 'Easily manage Stripe transactions and payments.',
    dateCreated: '2023-12-03T15:20:00Z',
    dateModified: '2024-01-22T09:15:00Z',
    tags: [
      { id: 'tag-014', name: 'Payments', color: 'purple' },
      { id: 'tag-015', name: 'Finance', color: 'green' }
    ]
  },
  {
    id: 'gmail-008',
    name: 'Gmail',
    logo: 'gmail',
    isStarred: true,
    description: 'Access and manage Gmail messages effortlessly.',
    dateCreated: '2023-10-18T08:45:00Z',
    dateModified: '2024-02-05T11:30:00Z',
    tags: [
      { id: 'tag-016', name: 'Email', color: 'red' },
      { id: 'tag-017', name: 'Communication', color: 'blue' }
    ]
  },
  {
    id: 'medium-009',
    name: 'Medium',
    logo: 'medium',
    isStarred: false,
    description: 'Explore and share Medium stories on your dashboard.',
    dateCreated: '2023-11-22T14:10:00Z',
    dateModified: '2024-01-28T13:45:00Z',
    tags: [
      { id: 'tag-018', name: 'Content', color: 'orange' },
      { id: 'tag-019', name: 'Writing', color: 'yellow' }
    ]
  },
  {
    id: 'skype-010',
    name: 'Skype',
    logo: 'skype',
    isStarred: false,
    description: 'Connect with Skype contacts seamlessly.',
    dateCreated: '2023-09-15T10:25:00Z',
    dateModified: '2024-01-20T15:30:00Z',
    tags: [
      { id: 'tag-020', name: 'Communication', color: 'blue' },
      { id: 'tag-021', name: 'Video', color: 'sky' }
    ]
  },
  {
    id: 'docker-011',
    name: 'Docker',
    logo: 'docker',
    isStarred: false,
    description: 'Effortlessly manage Docker containers on your dashboard.',
    dateCreated: '2023-12-08T16:40:00Z',
    dateModified: '2024-02-01T08:20:00Z',
    tags: [
      { id: 'tag-022', name: 'DevOps', color: 'blue' },
      { id: 'tag-023', name: 'Containers', color: 'sky' }
    ]
  },
  {
    id: 'github-012',
    name: 'GitHub',
    logo: 'github',
    isStarred: false,
    description: 'Streamline code management with GitHub integration.',
    dateCreated: '2023-10-30T12:15:00Z',
    dateModified: '2024-01-25T14:50:00Z',
    tags: [
      { id: 'tag-024', name: 'Development', color: 'purple' },
      { id: 'tag-025', name: 'Version Control', color: 'orange' }
    ]
  },
  {
    id: 'gitlab-013',
    name: 'GitLab',
    logo: 'gitlab',
    isStarred: false,
    description: 'Efficiently manage code projects with GitLab integration.',
    dateCreated: '2023-11-14T09:55:00Z',
    dateModified: '2024-02-03T10:40:00Z',
    tags: [
      { id: 'tag-026', name: 'Development', color: 'orange' },
      { id: 'tag-027', name: 'CI/CD', color: 'red' }
    ]
  },
  {
    id: 'discord-014',
    name: 'Discord',
    logo: 'discord',
    isStarred: false,
    description: 'Connect with Discord for seamless team communication.',
    dateCreated: '2023-12-20T11:35:00Z',
    dateModified: '2024-01-15T16:05:00Z',
    tags: [
      { id: 'tag-028', name: 'Communication', color: 'purple' },
      { id: 'tag-029', name: 'Gaming', color: 'blue' },
      { id: 'tag-030', name: 'Community', color: 'green' }
    ]
  },
  {
    id: 'whatsapp-015',
    name: 'WhatsApp',
    logo: 'whatsapp',
    isStarred: false,
    description: 'Easily integrate WhatsApp for direct messaging.',
    dateCreated: '2023-09-01T16:45:00Z',
    dateModified: '2024-01-15T13:20:00Z',
    tags: [
      { id: 'tag-031', name: 'Messaging', color: 'green' },
      { id: 'tag-032', name: 'Communication', color: 'blue' }
    ]
  },
]

export const getIconComponent = (iconName: string) => {
  const icons = {
    telegram: IconBrandTelegram,
    notion: IconBrandNotion,
    figma: IconBrandFigma,
    trello: IconBrandTrello,
    slack: IconBrandSlack,
    zoom: IconBrandZoom,
    stripe: IconBrandStripe,
    gmail: IconBrandGmail,
    medium: IconBrandMedium,
    skype: IconBrandSkype,
    docker: IconBrandDocker,
    github: IconBrandGithub,
    gitlab: IconBrandGitlab,
    discord: IconBrandDiscord,
    whatsapp: IconBrandWhatsapp,
  }
  
  const IconComponent = icons[iconName as keyof typeof icons]
  return IconComponent ? <IconComponent /> : null
}
