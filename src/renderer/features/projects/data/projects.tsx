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
    name: 'Telegram',
    logo: <IconBrandTelegram />,
    connected: false,
    desc: 'Connect with Telegram for real-time communication.',
    dateCreated: '2023-12-15T10:30:00Z',
    dateModified: '2024-01-20T15:45:00Z',
    tags: [
      { name: 'Communication', color: 'blue' },
      { name: 'Messaging', color: 'sky' }
    ]
  },
  {
    name: 'Notion',
    logo: <IconBrandNotion />,
    connected: true,
    desc: 'Effortlessly sync Notion pages for seamless collaboration.',
    dateCreated: '2023-11-20T08:00:00Z',
    dateModified: '2024-02-01T11:20:00Z',
    tags: [
      { name: 'Productivity', color: 'purple' },
      { name: 'Documentation', color: 'gray' },
      { name: 'Team', color: 'blue' }
    ]
  },
  {
    name: 'Figma',
    logo: <IconBrandFigma />,
    connected: true,
    desc: 'View and collaborate on Figma designs in one place.',
    dateCreated: '2023-10-05T14:15:00Z',
    dateModified: '2024-01-25T09:30:00Z',
    tags: [
      { name: 'Design', color: 'pink' },
      { name: 'Collaboration', color: 'purple' }
    ]
  },
  {
    name: 'Trello',
    logo: <IconBrandTrello />,
    connected: false,
    desc: 'Sync Trello cards for streamlined project management.',
    dateCreated: '2023-10-12T09:30:00Z',
    dateModified: '2024-01-18T14:25:00Z',
    tags: [
      { name: 'Project Management', color: 'blue' },
      { name: 'Organization', color: 'sky' }
    ]
  },
  {
    name: 'Slack',
    logo: <IconBrandSlack />,
    connected: false,
    desc: 'Integrate Slack for efficient team communication',
    dateCreated: '2023-11-05T11:45:00Z',
    dateModified: '2024-02-02T16:30:00Z',
    tags: [
      { name: 'Communication', color: 'green' },
      { name: 'Team', color: 'blue' }
    ]
  },
  {
    name: 'Zoom',
    logo: <IconBrandZoom />,
    connected: true,
    desc: 'Host Zoom meetings directly from the dashboard.',
    dateCreated: '2023-09-28T13:15:00Z',
    dateModified: '2024-01-30T10:45:00Z',
    tags: [
      { name: 'Meetings', color: 'blue' },
      { name: 'Video', color: 'sky' }
    ]
  },
  {
    name: 'Stripe',
    logo: <IconBrandStripe />,
    connected: false,
    desc: 'Easily manage Stripe transactions and payments.',
    dateCreated: '2023-12-03T15:20:00Z',
    dateModified: '2024-01-22T09:15:00Z',
    tags: [
      { name: 'Payments', color: 'purple' },
      { name: 'Finance', color: 'green' }
    ]
  },
  {
    name: 'Gmail',
    logo: <IconBrandGmail />,
    connected: true,
    desc: 'Access and manage Gmail messages effortlessly.',
    dateCreated: '2023-10-18T08:45:00Z',
    dateModified: '2024-02-05T11:30:00Z',
    tags: [
      { name: 'Email', color: 'red' },
      { name: 'Communication', color: 'blue' }
    ]
  },
  {
    name: 'Medium',
    logo: <IconBrandMedium />,
    connected: false,
    desc: 'Explore and share Medium stories on your dashboard.',
    dateCreated: '2023-11-22T14:10:00Z',
    dateModified: '2024-01-28T13:45:00Z',
    tags: [
      { name: 'Content', color: 'orange' },
      { name: 'Writing', color: 'yellow' }
    ]
  },
  {
    name: 'Skype',
    logo: <IconBrandSkype />,
    connected: false,
    desc: 'Connect with Skype contacts seamlessly.',
    dateCreated: '2023-09-15T10:25:00Z',
    dateModified: '2024-01-20T15:30:00Z',
    tags: [
      { name: 'Communication', color: 'blue' },
      { name: 'Video', color: 'sky' }
    ]
  },
  {
    name: 'Docker',
    logo: <IconBrandDocker />,
    connected: false,
    desc: 'Effortlessly manage Docker containers on your dashboard.',
    dateCreated: '2023-12-08T16:40:00Z',
    dateModified: '2024-02-01T08:20:00Z',
    tags: [
      { name: 'DevOps', color: 'blue' },
      { name: 'Containers', color: 'sky' }
    ]
  },
  {
    name: 'GitHub',
    logo: <IconBrandGithub />,
    connected: false,
    desc: 'Streamline code management with GitHub integration.',
    dateCreated: '2023-10-30T12:15:00Z',
    dateModified: '2024-01-25T14:50:00Z',
    tags: [
      { name: 'Development', color: 'purple' },
      { name: 'Version Control', color: 'orange' }
    ]
  },
  {
    name: 'GitLab',
    logo: <IconBrandGitlab />,
    connected: false,
    desc: 'Efficiently manage code projects with GitLab integration.',
    dateCreated: '2023-11-14T09:55:00Z',
    dateModified: '2024-02-03T10:40:00Z',
    tags: [
      { name: 'Development', color: 'orange' },
      { name: 'CI/CD', color: 'red' }
    ]
  },
  {
    name: 'Discord',
    logo: <IconBrandDiscord />,
    connected: false,
    desc: 'Connect with Discord for seamless team communication.',
    dateCreated: '2023-12-20T11:35:00Z',
    dateModified: '2024-01-15T16:05:00Z',
    tags: [
      { name: 'Communication', color: 'purple' },
      { name: 'Gaming', color: 'blue' },
      { name: 'Community', color: 'green' }
    ]
  },
  {
    name: 'WhatsApp',
    logo: <IconBrandWhatsapp />,
    connected: false,
    desc: 'Easily integrate WhatsApp for direct messaging.',
    dateCreated: '2023-09-01T16:45:00Z',
    dateModified: '2024-01-15T13:20:00Z',
    tags: [
      { name: 'Messaging', color: 'green' },
      { name: 'Communication', color: 'blue' }
    ]
  },
]
