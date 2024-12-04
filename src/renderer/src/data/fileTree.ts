import { FileTreeItem } from "@renderer/types/files";

export const dummyFileTree: FileTreeItem[] = [
    {
      id: '1',
      name: 'Music Projects',
      type: 'folder',
      children: [
        {
          id: '1-1',
          name: 'Project A',
          type: 'folder',
          children: [
            {
              id: '1-1-1',
              name: 'vocals.wav',
              type: 'file',
              format: 'audio/wav',
              size: 15000000,
              dateUploaded: '2024-03-03T12:00:00Z'
            },
            {
              id: '1-1-2',
              name: 'drums.mp3',
              type: 'file',
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
      type: 'folder',
      children: [
        {
          id: '2-1',
          name: 'live_session.m4a',
          type: 'file',
          format: 'audio/x-m4a',
          size: 25000000,
          dateUploaded: '2024-03-02T15:30:00Z'
        }
      ]
    },
    {
      id: '3',
      name: 'demo_track.mp3',
      type: 'file',
      format: 'audio/mpeg',
      size: 5000000,
      dateUploaded: '2024-03-01T10:00:00Z'
    }
  ];