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
    from: UserProfile;
    createdAt: Date;
    type: NotificationType;

    // For REQUEST type
    requestType: RequestType | null;
    description: string | null;

    // For SHARE type
    sharedItem: {
        item: DemoItem;
        message: string | null;
    } | null;
}