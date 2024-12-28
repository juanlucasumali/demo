export interface Notification {
    id: string;
    avatar: string;
    username: string;
    name: string;
    notification: string;
}

export enum NotificationType {
    ITEM_REQUEST = "item_request",
    SINGLE_SHARE = "single_share",
    MULTI_SHARE = "multi_share",
}