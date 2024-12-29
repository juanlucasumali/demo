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

    // SINGLE_SHARE
    itemShared: DemoItem | null;

    // MULTI_SHARE
    itemsShared: DemoItem[] | null;
}

export enum NotificationType {
    ITEM_REQUEST = "item_request",
    SINGLE_SHARE = "single_share",
    MULTI_SHARE = "multi_share",
}