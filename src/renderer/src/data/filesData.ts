import { DemoItem } from "../types/files";

export const filesData: DemoItem[] = [
  {
    id: "1",
    name: "My Beat 1",
    format: "WAV",
    type: 'file',
    dateUploaded: "2023-10-01T10:00:00Z",
    size: 10485760, // 10 MB
    parentId: null,
  },
  {
    id: "2",
    name: "Guitar Loop",
    format: "MP3",
    type: 'file',
    dateUploaded: "2023-10-02T12:30:00Z",
    size: 5242880, // 5 MB
    parentId: null,
  },
  {
    id: "3",
    name: "Drum Sample",
    format: "AIFF",
    type: 'file',
    dateUploaded: "2023-10-03T15:45:00Z",
    size: 2097152, // 2 MB
    parentId: null,
  },
  // Add more sample files as needed
];
