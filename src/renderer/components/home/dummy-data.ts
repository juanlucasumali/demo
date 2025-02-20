import { DemoItem, ItemType, FileFormat } from "@renderer/types/items"

const dummyUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Demo User",
  username: "demo_user",
  avatar: null,
  email: "demo@example.com",
  description: "Demo Account"
}

export const dummyDemoItems: DemoItem[] = [
  {
    id: "file-1",
    projectIds: [],
    parentFolderIds: [],
    collectionIds: [],
    createdAt: new Date("2024-03-20T10:00:00Z"),
    lastModified: new Date("2024-03-20T10:00:00Z"),
    lastOpened: new Date("2024-03-20T10:00:00Z"),
    type: ItemType.FILE,
    icon: null,
    name: "Vocals_Take1.mp3",
    description: "First take of the vocals",
    tags: null,
    isStarred: false,
    format: FileFormat.MP3,
    size: 5242880, // 5MB
    duration: 180, // 3 minutes
    filePath: "/vocals/take1.mp3",
    owner: dummyUser,
    sharedWith: []
  },
  {
    id: "folder-1",
    projectIds: [],
    parentFolderIds: [],
    collectionIds: [],
    createdAt: new Date("2024-03-19T15:00:00Z"),
    lastModified: new Date("2024-03-19T15:00:00Z"),
    lastOpened: new Date("2024-03-19T15:00:00Z"),
    type: ItemType.FOLDER,
    icon: null,
    name: "Recordings",
    description: "All recording sessions",
    tags: null,
    isStarred: true,
    format: null,
    size: null,
    duration: null,
    filePath: null,
    owner: dummyUser,
    sharedWith: []
  },
  {
    id: "project-1",
    projectIds: [],
    parentFolderIds: [],
    collectionIds: [],
    createdAt: new Date("2024-03-18T09:00:00Z"),
    lastModified: new Date("2024-03-20T16:00:00Z"),
    lastOpened: new Date("2024-03-20T16:00:00Z"),
    type: ItemType.PROJECT,
    icon: null,
    name: "Summer Album",
    description: "Summer release project",
    tags: null,
    isStarred: true,
    format: null,
    size: null,
    duration: null,
    filePath: null,
    owner: dummyUser,
    sharedWith: []
  },
  {
    id: "file-2",
    projectIds: ["project-1"],
    parentFolderIds: ["folder-1"],
    collectionIds: [],
    createdAt: new Date("2024-03-20T11:30:00Z"),
    lastModified: new Date("2024-03-20T11:30:00Z"),
    lastOpened: new Date("2024-03-20T11:30:00Z"),
    type: ItemType.FILE,
    icon: null,
    name: "Guitar_Main.wav",
    description: "Main guitar track",
    tags: null,
    isStarred: false,
    format: FileFormat.WAV,
    size: 52428800, // 50MB
    duration: 240, // 4 minutes
    filePath: "/recordings/guitar_main.wav",
    owner: dummyUser,
    sharedWith: []
  },
  {
    id: "file-3",
    projectIds: ["project-1"],
    parentFolderIds: ["folder-1"],
    collectionIds: [],
    createdAt: new Date("2024-03-20T14:00:00Z"),
    lastModified: new Date("2024-03-20T14:00:00Z"),
    lastOpened: new Date("2024-03-20T14:00:00Z"),
    type: ItemType.FILE,
    icon: null,
    name: "Project.flp",
    description: "FL Studio project file",
    tags: null,
    isStarred: true,
    format: FileFormat.FLP,
    size: 15728640, // 15MB
    duration: null,
    filePath: "/projects/summer_album.flp",
    owner: dummyUser,
    sharedWith: []
  }
]

export const dummyProjectItems = dummyDemoItems.filter(item => item.type === ItemType.PROJECT) 