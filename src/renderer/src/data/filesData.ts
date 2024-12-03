import { FileItem } from "../types/files";

export const filesData: FileItem[] = [
  {
    id: "1",
    name: "My Beat 1",
    type: "WAV",
    dateUploaded: "2023-10-01T10:00:00Z",
    size: 10485760, // 10 MB
  },
  {
    id: "2",
    name: "Guitar Loop",
    type: "MP3",
    dateUploaded: "2023-10-02T12:30:00Z",
    size: 5242880, // 5 MB
  },
  {
    id: "3",
    name: "Drum Sample",
    type: "AIFF",
    dateUploaded: "2023-10-03T15:45:00Z",
    size: 2097152, // 2 MB
  },
  // Add more sample files as needed
];
