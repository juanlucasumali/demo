import { UserProfile } from "./users";
import { ProjectTags } from "./tags";

export interface Project {
    id: string;
    createdAt: Date;
    lastModified: Date;
    name: string;
    description: string | null;
    isStarred: boolean;
    tags: ProjectTags | null; 

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