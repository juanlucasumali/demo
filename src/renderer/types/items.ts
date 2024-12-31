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

export enum ItemType {
    FILE = "file",
    FOLDER = "folder",
    PROJECT = "project"
}

export interface DemoItem {
    id: string;
    projectId: string | null;
    parentFolderId: string | null;
    collectionId: string | null;

    createdAt: Date;
    lastModified: Date;
    lastOpened: Date;

    type: ItemType;

    icon: string | null;
    name: string;
    description: string | null;
    tags: FileTag | null; 
    isStarred: boolean;
    
    format: FileFormat | null;
    size: number | null;
    duration: number | null;
    filePath: string | null;
    
    owner: UserProfile | null;
    sharedWith: UserProfile[] | null
}