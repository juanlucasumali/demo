import { BookOpen, Bot, Eye, Folder, Frame, LifeBuoy, Link, Send, Settings2, Stars } from "lucide-react";

export const sidebarData = {
  user: {
    name: "Juan Lucas Umali",
    email: "juanlucasumali@berkeley.edu",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "My Files",
      url: "#",
      icon: Folder,
      isActive: true,
      viewType: "files",
      items: [
        {
          id: '1',
          name: 'Music Projects',
          type: 'folder' as const,  // Use const assertion
          children: [
            {
              id: '1-1',
              name: 'Project A',
              type: 'folder' as const,
              children: [
                {
                  id: '1-1-1',
                  name: 'vocals.wav',
                  type: 'file' as const,
                  format: 'audio/wav',
                  size: 15000000,
                  dateUploaded: '2024-03-03T12:00:00Z'
                },
                {
                  id: '1-1-2',
                  name: 'drums.mp3',
                  type: 'file' as const,
                  format: 'audio/mpeg',
                  size: 8000000,
                  dateUploaded: '2024-03-03T12:01:00Z'
                }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Recordings',
          type: 'folder' as const,
          children: [
            {
              id: '2-1',
              name: 'live_session.m4a',
              type: 'file' as const,
              format: 'audio/x-m4a',
              size: 25000000,
              dateUploaded: '2024-03-02T15:30:00Z'
            }
          ]
        },
        {
          id: '3',
          name: 'demo_track.mp3',
          type: 'file' as const,
          format: 'audio/mpeg',
          size: 5000000,
          dateUploaded: '2024-03-01T10:00:00Z'
        },
      ],
    },
      {
        title: "Models",
        url: "#",
        icon: Bot,
        viewType: "models",
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
        viewType: "documentation",
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        viewType: "settings",
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Connect to a DAW",
        url: "#",
        icon: Link,
        viewType: "connect"
      },
      {
        title: "Support",
        url: "#",
        icon: LifeBuoy,
      },
      {
        title: "Feedback",
        url: "#",
        icon: Send,
      },
    ],
    projects: [
      {
        name: "EP 001",
        url: "#",
        icon: Frame,
      },
      {
        name: "MY EYES",
        url: "#",
        icon: Eye,
      },
      {
        name: "chill lo-fi beats",
        url: "#",
        icon: Stars,
      },
    ],
  }