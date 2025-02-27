import { DemoItem } from "./items";
import { UserProfile } from "./users";

export enum NotificationType {
    REQUEST = "request",
    SHARE = "share"
}

export enum RequestType {
    FILE = "file",
    FOLDER = "folder",
    PROJECT = "project"
}

export interface DemoNotification {
    id: string;
    createdAt: Date;
    from: UserProfile;
    isRead: boolean;

    type: NotificationType;

    // For REQUEST type
    requestType: RequestType | null;
    requestDescription: string | null;

    // For SHARE type
    sharedItem: DemoItem | null;
    sharedMessage: string | null;
}