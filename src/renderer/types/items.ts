import { FileTag } from "./tags";
import { UserProfile } from "./users";

export enum FileFormat {
    MP3 = "mp3",
    WAV = "wav",
    MP4 = "mp4",
    FLP = "flp",
    ALS = "als",
    ZIP = "zip"
    }

export interface DemoItem {
    id: string;
    createdAt: Date;
    lastModified: Date;
    lastOpened: Date;
    name: string;
    isStarred: boolean;
    tags: FileTag | null; 
    projectId: string | null;
    parentFolderId: string | null;
    filePath: string;
    type: string

    // File-specific fields
    format: FileFormat | null;
    size: number | null;
    duration: number | null;

    ownerId: string;
    ownerAvatar: string | null;
    ownerUsername: string;
    sharedWith: UserProfile[] | null
}