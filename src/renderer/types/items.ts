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
    createdAt: Date;
    lastModified: Date;
    lastOpened: Date;
    name: string;
    isStarred: boolean;
    tags: FileTag | null; 
    projectId: string | null;
    parentFolderId: string | null;
    filePath: string | null;
    type: ItemType;


    format: FileFormat | null;
    size: number | null;
    duration: number | null;
    description: string | null;
    icon: string | null;

    owner: UserProfile;
    sharedWith: UserProfile[] | null
}