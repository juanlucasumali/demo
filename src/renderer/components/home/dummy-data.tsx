import {
    DemoItem,
    FileFormat,
  } from '../../types/items'; // <-- Replace with the actual path to your types
  
  export const dummyData: DemoItem[] = [
    // 1. "Folder-like" item (no file-specific fields)
    {
      id: "folder-001",
      createdAt: new Date("2024-01-01T12:00:00Z"),
      lastModified: new Date("2024-01-05T08:00:00Z"),
      name: "Vocal Recordings",
      isStarred: false,
      tags: {
        fileType: "Recording",
        instruments: ["Vocals"],
        status: "Draft",
        versions: ["Dry"],
      },
      projectId: "project-abc",
      parentFolderId: "root",
      filePath: "/project-abc/Vocal Recordings",
      ownerId: "user-123",
      ownerAvatar: "https://example.com/avatars/user123.png",
      ownerUsername: "singer123",
      sharedWith: [
        {
          id: "user-999",
          avatar: "https://example.com/avatars/user999.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "producer999",
        },
      ],
      type: "folder"
      // format, size, duration are omitted → indicating folder-like behavior
    },
  
    // 2. "File-like" item (file-specific fields included)
    {
      id: "file-101",
      createdAt: new Date("2024-01-02T10:15:00Z"),
      lastModified: new Date("2024-01-03T11:20:00Z"),
      name: "LeadVocal_Take1",
      isStarred: false,
      tags: {
        fileType: "Recording",
        instruments: ["Vocals"],
        status: "Draft",
        versions: ["Dry"],
      },
      projectId: "project-abc",
      parentFolderId: "folder-001",
      filePath: "/project-abc/Vocal Recordings/LeadVocal_Take1.mp3",
      ownerId: "user-123",
      ownerAvatar: "https://example.com/avatars/user123.png",
      ownerUsername: "singer123",
      sharedWith: [
        {
          id: "user-999",
          avatar: "https://example.com/avatars/user999.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "producer999",
        },
      ],
      // File-specific (optional) fields
      format: FileFormat.MP3,
      size: 3_150_000,
      duration: 180,
      type: "file"
    },
  
    // 3. Another "folder-like" item
    {
      id: "folder-002",
      createdAt: new Date("2024-02-10T09:00:00Z"),
      lastModified: new Date("2024-02-12T07:30:00Z"),
      name: "Instrumentals",
      isStarred: true,
      tags: {
        fileType: "Stems",
        instruments: ["Drums", "Guitar", "Bass"],
        status: "Draft",
        versions: ["Dry", "Compressed"],
      },
      projectId: "project-abc",
      parentFolderId: "root",
      filePath: "/project-abc/Instrumentals",
      ownerId: "user-999",
      ownerAvatar: "https://example.com/avatars/user999.png",
      ownerUsername: "producer999",
      sharedWith: [
        {
          id: "user-123",
          avatar: "https://example.com/avatars/user123.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "singer123",
        },
        {
          id: "user-555",
          avatar: "https://example.com/avatars/user555.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "engineer555",
        },
      ],
      type: "folder"
      // No file-specific fields
    },
  
    // 4. Another "file-like" item
    {
      id: "file-201",
      createdAt: new Date("2024-02-10T09:05:00Z"),
      lastModified: new Date("2024-02-10T09:06:00Z"),
      name: "GuitarStem.wav",
      isStarred: false,
      tags: {
        fileType: "Stems",
        instruments: ["Guitar"],
        status: "Draft",
        versions: ["Dry"],
      },
      projectId: "project-abc",
      parentFolderId: "folder-002",
      filePath: "/project-abc/Instrumentals/GuitarStem.wav",
      ownerId: "user-999",
      ownerAvatar: "https://example.com/avatars/user999.png",
      ownerUsername: "producer999",
      sharedWith: [
        {
          id: "user-123",
          avatar: "https://example.com/avatars/user123.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "singer123",
        },
        {
          id: "user-555",
          avatar: "https://example.com/avatars/user555.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "engineer555",
        },
      ],
      // File-specific
      format: FileFormat.WAV,
      size: 6_200_000,
      duration: 240,
      type: "file"
    },
  
    // 5. Another "file-like" item in the same "Instrumentals" folder
    {
      id: "file-202",
      createdAt: new Date("2024-02-11T10:00:00Z"),
      lastModified: new Date("2024-02-11T12:45:00Z"),
      name: "DrumsStem_v2",
      isStarred: false,
      tags: {
        fileType: "Stems",
        instruments: ["Drums"],
        status: "Needs Revision",
        versions: ["Compressed"],
      },
      projectId: "project-abc",
      parentFolderId: "folder-002",
      filePath: "/project-abc/Instrumentals/DrumsStem_v2.wav",
      ownerId: "user-555",
      ownerAvatar: "https://example.com/avatars/user555.png",
      ownerUsername: "engineer555",
      sharedWith: [
        {
          id: "user-123",
          avatar: "https://example.com/avatars/user123.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "singer123",
        },
        {
          id: "user-999",
          avatar: "https://example.com/avatars/user999.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "producer999",
        },
      ],
      // File-specific
      format: FileFormat.WAV,
      size: 8_400_000,
      duration: 210,
      type: "file",
    },
  
    // 6. "Folder-like" item for final mixes
    {
      id: "folder-003",
      createdAt: new Date("2024-03-01T08:00:00Z"),
      lastModified: new Date("2024-03-05T18:00:00Z"),
      name: "Final Mixes",
      isStarred: true,
      tags: {
        fileType: "Mix",
        instruments: ["Vocals", "Bass", "Guitar", "Drums"],
        status: "Final",
        versions: ["Clean", "Tuned"],
      },
      projectId: "project-abc",
      parentFolderId: "root",
      filePath: "/project-abc/Final Mixes",
      ownerId: "user-555",
      ownerAvatar: "https://example.com/avatars/user555.png",
      ownerUsername: "engineer555",
      sharedWith: [
        {
          id: "user-123",
          avatar: "https://example.com/avatars/user123.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "singer123",
        },
        {
          id: "user-999",
          avatar: "https://example.com/avatars/user999.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "producer999",
        },
      ],
      type: "folder",
      // No file-specific fields
    },
  
    // 7. "File-like" item within the "Final Mixes" folder
    {
      id: "file-301",
      createdAt: new Date("2024-03-02T14:30:00Z"),
      lastModified: new Date("2024-03-03T09:00:00Z"),
      name: "AlbumVersion_Master.mp3",
      isStarred: false,
      tags: {
        fileType: "Master",
        instruments: ["Vocals", "Guitar", "Drums", "Synth"],
        status: "Approved",
        versions: ["Clean"],
      },
      projectId: "project-abc",
      parentFolderId: "folder-003",
      filePath: "/project-abc/Final Mixes/AlbumVersion_Master.mp3",
      ownerId: "user-555",
      ownerAvatar: "https://example.com/avatars/user555.png",
      ownerUsername: "engineer555",
      sharedWith: [
        {
          id: "user-123",
          avatar: "https://example.com/avatars/user123.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "singer123",
        },
        {
          id: "user-999",
          avatar: "https://example.com/avatars/user999.png",
          email: "producer@gmail.com", 
name: "Name", 
description: "omg no wayyyy", 
username: "producer999",
        },
      ],
      // File-specific
      format: FileFormat.MP3,
      size: 9_100_000,
      duration: 200,
      type: "file",
    },
  ];