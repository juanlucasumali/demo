import { dummyDemoItems } from "@renderer/components/home/dummy-data"
import { ItemType } from "@renderer/types/items"
import { DemoNotification, NotificationType } from "@renderer/types/notifications"

const dummyUsers = [
  {
    id: "user1",
    name: "Chao Tang",
    username: "chaotang",
    avatar: null,
    email: "chao@example.com",
    description: "Music Producer"
  },
  {
    id: "user2",
    name: "Jimmy",
    username: "jimmy",
    avatar: null,
    email: "jimmy@example.com",
    description: "Sound Engineer"
  },
  {
    id: "user3",
    name: "Sarah Smith",
    username: "ss",
    avatar: null,
    email: "ss@example.com",
    description: "Vocalist"
  },
  {
    id: "user4",
    name: "Mike Johnson",
    username: "mikej",
    avatar: null,
    email: "mike@example.com",
    description: "Drummer"
  },
  {
    id: "user5",
    name: "Emily Chen",
    username: "emilyc",
    avatar: null,
    email: "emily@example.com",
    description: "Bassist"
  }
]

// Generate timestamps for the last 48 hours
const getRecentTimestamp = (hoursAgo: number) => {
  const date = new Date()
  date.setHours(date.getHours() - hoursAgo)
  return date
}

export const dummyNotifications: DemoNotification[] = [
  // Recent requests (last hour)
  {
    id: "notification1",
    from: dummyUsers[2],
    createdAt: getRecentTimestamp(0.5),
    type: NotificationType.REQUEST,
    itemsRequested: [{ ...dummyDemoItems[0], name: "vocals_final.wav" }],
    description: "Need the final vocal stem for mixing",
    sharedItem: null
  },
  // Recent shares
  {
    id: "notification2",
    from: dummyUsers[0],
    createdAt: getRecentTimestamp(1),
    type: NotificationType.SHARE,
    itemsRequested: null,
    description: null,
    sharedItem: {
      item: {
        ...dummyDemoItems[0],
        name: "final_mix_v2.wav",
        type: ItemType.FILE
      },
      message: "Updated mix with new effects"
    }
  },
  // More requests
  {
    id: "notification3",
    from: dummyUsers[1],
    createdAt: getRecentTimestamp(2),
    type: NotificationType.REQUEST,
    itemsRequested: [
      { ...dummyDemoItems[0], name: "guitar_solo.wav" },
      { ...dummyDemoItems[0], name: "guitar_rhythm.wav" }
    ],
    description: "Need both guitar tracks for the bridge section",
    sharedItem: null
  },
  // Project share
  {
    id: "notification4",
    from: dummyUsers[3],
    createdAt: getRecentTimestamp(3),
    type: NotificationType.SHARE,
    itemsRequested: null,
    description: null,
    sharedItem: {
      item: {
        ...dummyDemoItems[2],
        name: "Summer Album 2024",
        type: ItemType.PROJECT
      },
      message: "New project structure ready for review"
    }
  },
  // Folder share
  {
    id: "notification5",
    from: dummyUsers[4],
    createdAt: getRecentTimestamp(4),
    type: NotificationType.SHARE,
    itemsRequested: null,
    description: null,
    sharedItem: {
      item: {
        ...dummyDemoItems[1],
        name: "Bass Recordings",
        type: ItemType.FOLDER
      },
      message: "All bass tracks from today's session"
    }
  },
  // Another request
  {
    id: "notification6",
    from: dummyUsers[2],
    createdAt: getRecentTimestamp(5),
    type: NotificationType.REQUEST,
    itemsRequested: [{ ...dummyDemoItems[1], name: "Backing Vocals", type: ItemType.FOLDER }],
    description: "Can you share the backing vocals folder?",
    sharedItem: null
  },
  // More notifications with varied types and timestamps
  {
    id: "notification7",
    from: dummyUsers[0],
    createdAt: getRecentTimestamp(6),
    type: NotificationType.SHARE,
    itemsRequested: null,
    description: null,
    sharedItem: {
      item: {
        ...dummyDemoItems[0],
        name: "synth_lead_processed.wav",
        type: ItemType.FILE
      },
      message: "Processed synth with new plugins"
    }
  },
  {
    id: "notification8",
    from: dummyUsers[1],
    createdAt: getRecentTimestamp(8),
    type: NotificationType.REQUEST,
    itemsRequested: [{ ...dummyDemoItems[2], name: "Remix Project", type: ItemType.PROJECT }],
    description: "Can you share the remix project files?",
    sharedItem: null
  }
]

export async function getNotifications(): Promise<DemoNotification[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  return dummyNotifications
} 