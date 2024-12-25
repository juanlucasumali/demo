import { Card, CardContent, CardHeader } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"; // Ensure you have an avatar component
import { Table, TableRow, TableCell, TableBody } from "../ui/table"; // Ensure you have table components

// Dummy notifications data
const notifications = [
  { id: 1, avatarUrl: "https://via.placeholder.com/40", avatarFallback: "JD", name: "John Doe", username: 'johndoe', notification: "Sent you a request" },
  { id: 2, avatarUrl: "https://via.placeholder.com/40", avatarFallback: "AM", name: "Alice Miller", username: 'alicemills', notification: "Shared forty.mp3" },
  { id: 3, avatarUrl: "https://via.placeholder.com/40", avatarFallback: "RS", name: "Robert Smith", username: 'robsmithy', notification: "Shared multiple files and folders" },
  // Add more dummy data here to simulate scrolling
];

export function Activity() {
  return (
    <Card className="lg:col-span-2 lg:mb-0 mb-8">
      <CardHeader className="py-4">
      <h1 className="text-base font-semibold tracking-tight">Activity</h1>
      </CardHeader>
      <CardContent>
        {/* Scrollable container */}
        <div className="h-40 overflow-y-auto no-scrollbar">
          <Table>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={notification.avatarUrl} alt={notification.username} />
                      <AvatarFallback>{notification.avatarFallback}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {notification.name}
                    <div className="text-muted-foreground">@{notification.username}</div>
                    </TableCell>
                  <TableCell>{notification.notification}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}