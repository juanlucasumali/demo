import { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Table, TableRow, TableCell, TableBody } from "../ui/table";
import { File, FileQuestion, Files, Box } from "lucide-react";
import { dummyDemoItems, dummyProjectItems } from "./dummy-data";
import { friendsData } from "./dummy-data";
import { DemoNotification, NotificationType } from "@renderer/types/notifications";
import { useNotifications } from "@renderer/hooks/use-notifications";

// Updated notifications data with proper types
// const notifications: DemoNotification[] = [
//   { 
//     id: "notification-1",
//     from: friendsData[0],
//     createdAt: new Date("2024-03-20T14:30:00Z"),
//     type: NotificationType.ITEM_REQUEST,
//     itemsRequested: [dummyDemoItems[3]], // GuitarStem.wav
//     itemShared: null,
//     itemsShared: null,
//     projectShared: null,
//     description: "Hey, could you send over the guitar stem for the song?"
//   },
//   { 
//     id: "notification-2",
//     from: friendsData[1],
//     createdAt: new Date("2024-03-20T12:15:00Z"),
//       type: NotificationType.SINGLE_ITEM_SHARE,
//       itemsRequested: null,
//     itemShared: dummyDemoItems[1], // LeadVocal_Take1
//     itemsShared: null,
//     projectShared: null,
//     description: null
//   },
//   { 
//     id: "notification-3",
//     from: friendsData[2],
//     createdAt: new Date("2024-03-19T16:45:00Z"),
//     type: NotificationType.MULTI_ITEM_SHARE,
//     itemsRequested: null,
//     itemShared: null,
//     itemsShared: [
//       dummyDemoItems[0], // Vocal Recordings folder
//       dummyDemoItems[1], // LeadVocal_Take1
//       dummyDemoItems[2], // Instrumentals folder
//     ],
//     projectShared: null,
//     description: null
//   },
//   { 
//     id: "notification-4",
//     from: friendsData[3],
//     createdAt: new Date("2024-03-19T10:30:00Z"),
//     type: NotificationType.PROJECT_SHARE,
//     itemsRequested: null,
//     itemShared: null,
//     itemsShared: null,
//     projectShared: dummyProjectItems[1], // Assuming this is a project item
//     description: null
//   },
// ];

export function Activity() {
  const { data: notifications = [] } = useNotifications();
  const [selectedNotification, setSelectedNotification] = useState<typeof notifications[0] | null>(null);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    setSelectedNotification(notification);
  };

  const NotificationContent = ({ type, notification }: { 
    type: NotificationType, 
    notification: typeof notifications[0]
  }) => {
    const sharedStyles = "ml-1 inline-flex items-center gap-1 underline underline-offset-4 cursor-pointer text-muted-foreground";
    const textContainerStyles = "flex items-center overflow-hidden";
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      handleNotificationClick(notification);
    };

    switch (type) {
      case NotificationType.ITEM_REQUEST:
        return (
          <span className={textContainerStyles}>
            Sent you a{" "}
            <span 
              className={sharedStyles} 
              onClick={handleClick}
              // style={{ maxWidth: "calc(100% - 80px)" }} // Accounting for "Sent you a" text
            >
              <FileQuestion className="h-4 w-4 flex-shrink-0" />
              <span>request</span>
            </span>
          </span>
        );
      
      case NotificationType.SINGLE_ITEM_SHARE:
        return (
          <span className={textContainerStyles}>
            Shared{" "}
            <span 
              className={sharedStyles} 
              onClick={handleClick}
              style={{ maxWidth: "calc(100% - 60px)" }} // Accounting for "Shared" text
            >
              <File className="h-4 w-4 flex-shrink-0" />
              <span>{notification.itemShared?.name}</span>
            </span>
          </span>
        );
      
      case NotificationType.MULTI_ITEM_SHARE:
        return (
          <span className={textContainerStyles}>
            Shared{" "}
            <span 
              className={sharedStyles} 
              onClick={handleClick}
              style={{ maxWidth: "calc(100% - 60px)" }} // Accounting for "Shared" text
            >
              <Files className="h-4 w-4 flex-shrink-0" />
              <span>
                {notification.itemsShared ? `${notification.itemsShared.length} items` : 'multiple items'}
              </span>
            </span>
          </span>
        );
      
      case NotificationType.PROJECT_SHARE:
        return (
          <span className={textContainerStyles}>
            Shared project{" "}
            <span 
              className={sharedStyles} 
              onClick={handleClick}
              style={{ maxWidth: "calc(100% - 100px)" }}
            >
              <Box className="h-4 w-4 flex-shrink-0" />
              <span>{notification.projectShared?.name}</span>
            </span>
          </span>
        );
    }
  };

  return (
    <Card className="lg:col-span-2 lg:mb-0 mb-8 shadow-none">
      <CardHeader className="py-4">
        <h1 className="text-base font-semibold tracking-tight">Activity</h1>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            No recent activity to show
          </div>
        ) : (
          <div className="h-40 overflow-y-auto overflow-x-auto no-scrollbar">
            <Table>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} className="whitespace-nowrap">
                    <TableCell className="w-[50px]">
                      <Avatar>
                        <AvatarImage src={notification.from.avatar || undefined} alt={notification.from.username} />
                        <AvatarFallback>
                          {notification.from.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="truncate max-w-[150px]">
                        {notification.from.name}
                        <div className="text-muted-foreground">@{notification.from.username}</div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <NotificationContent 
                        type={notification.type} 
                        notification={notification}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}