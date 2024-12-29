import { DemoItem } from "./items";
import { UserProfile } from "./users";

export interface DemoNotification {
    id: string;
    from: UserProfile;
    createdAt: Date;
    type: NotificationType;

    // ITEM_REQUEST
    itemsRequested: DemoItem[] | null;
    description: string | null;

    // SINGLE_ITEM_SHARE
    itemShared: DemoItem | null;

    // MULTI_ITEM_SHARE
    itemsShared: DemoItem[] | null;

    // PROJECT_SHARE
    projectShared: DemoItem | null;
}

export enum NotificationType {
    ITEM_REQUEST = "item_request",
    SINGLE_ITEM_SHARE = "single_item_share",
    MULTI_ITEM_SHARE = "multi_item_share",
    PROJECT_SHARE = "project_share",
}