export interface UserProfile {
    id: string;
    avatar: string;
    username: string
}

export interface DemoItem {
    id: string;
    createdAt: Date;
    lastModified: Date;
    name: string;
    isStarred: boolean;
    tags: FileTags | null; 
    projectId: string;
    parentFolderId: string | null;
    filePath: string;
    type: "folder" | "file"

    // File-specific fields
    format?: FileFormat;
    size?: number;
    duration?: number;

    ownerId: string;
    ownerAvatar: string | null;
    ownerUsername: string;
    sharedWith: UserProfile[] | null
}


export enum FileFormat {
    MP3 = "mp3",
    WAV = "wav",
    MP4 = "mp4",
    FLP = "flp",
    ALS = "als",
    ZIP = "zip"
  }
  
  export type FileTagType = 'Stems' | 'Mix' | 'Master' | 'Reference' | 'Project File' | 'Sample Pack' | 'Recording' | 'Bounce';
  export type StatusType = 'Draft' | 'Final' | 'Approved' | 'Needs Revision' | 'Reference Only' | 'Archive';
  export type InstrumentType = 'Vocals' | 'Drums' | 'Bass' | 'Keys' | 'Synth' | 'Guitar' | 'Strings' | 'Brass' | 'FX' | 'Percussion';
  export type VersionType = 'Dry' | 'Wet' | 'Edited' | 'Tuned' | 'Compressed' | 'Clean';
  
  export interface FileTags {
    fileType: FileTagType;
    status: StatusType;
    instruments: InstrumentType[];
    version: VersionType[];
  }
  
  export const tagColors = {
    fileType: 'green',
    status: 'purple',
    instruments: 'blue',
    version: 'red'
  } as const;

  export const tagBgClasses = {
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
  } as const
  
  export const tagOptions = {
    fileType: ['Stems', 'Mix', 'Master', 'Reference', 'Project File', 'Sample Pack', 'Recording', 'Bounce'],
    status: ['Draft', 'Final', 'Approved', 'Needs Revision', 'Reference Only', 'Archive'],
    instruments: ['Vocals', 'Drums', 'Bass', 'Keys', 'Synth', 'Guitar', 'Strings', 'Brass', 'FX', 'Percussion'],
    version: ['Dry', 'Wet', 'Edited', 'Tuned', 'Compressed', 'Clean']
  } as const;




//   Check if a tag is valid:
// typescript

// Copy
// const isValidFileType = (tag: string): tag is FileTagType => tagOptions.fileType.includes(tag as FileTagType);
// Use tags in components:
// typescript

// Copy
// // Example usage
// const file: File = {
//   // ... other properties
//   tags: {
//     fileType: 'Mix',
//     instruments: ['Drums', 'Bass'],
//     status: 'Draft',
//     version: 'Wet'
//   }
// };

// // Easy access to tags
// console.log(file.tags.fileType);  // 'Mix'
// console.log(file.tags.instruments);  // ['Drums', 'Bass']
// Get tag colors:
// typescript

// Copy
// const getTagColor = (tagType: keyof typeof tagColors) => tagColors[tagType];
// Get available options:
// typescript

// Copy
// const getTagOptions = (tagType: keyof typeof tagOptions) => tagOptions[tagType];