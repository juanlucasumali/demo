import { ProjectTag } from "./tags";
import { UserProfile } from "./users";

export interface Project {
    id: string;
    createdAt: Date;
    lastModified: Date;
    sharedWithMe: Date | null;
    name: string;
    description: string | null;
    isStarred: boolean;
    tags: ProjectTag | null; 

    icon: string | null;

    ownerId: string;
    ownerAvatar: string | null;
    ownerUsername: string;
    sharedWith: UserProfile[] | null
}

export interface DisplayPreferences {
    tags: boolean
    createdAt: boolean
    lastModified: boolean
  }