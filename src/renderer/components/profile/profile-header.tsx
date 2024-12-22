import { UserProfile } from "@renderer/types/users";
import { ChevronDown, Ellipsis, Package, Plus, PlusCircle, Share, TriangleAlertIcon, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

interface ProfileHeaderProps {
  user: UserProfile;
}

export function ProfileHeader({
  user,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-6 container mx-auto pt-10 px-10">
      
      {/* Avatar Column */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-48 h-48 rounded-full">
          <Avatar className="h-48 w-48">
            <AvatarImage src={user.avatar ?? undefined} alt={user.username} />
            <AvatarFallback className="text-8xl font-bold rounded-full">
              {user.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Name, Dropdown, and Description Column */}
      <div className="flex flex-col items-start flex-grow gap-4">
        {/* Username and Dropdown */}
        <div className="flex items-end gap-2 -mb-3">
          <h1 className="text-4xl font-bold tracking-tight pr-2">{user.name}</h1>
        </div>
        {/* Username */}
        <div className="text-center text-sm text-muted-foreground">@{user.username}</div>

        {/* If you're current user, this button will be an EditProfile dropdown */}

        <div className="flex items-center gap-2 whitespace-nowrap">
          <Button
              variant="default"
              className="flex w-16 h-7 p-0"
            >
                <Plus className="-mr-1" />
                Add
          </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Ellipsis className="w-6 h-6 text-primary cursor-pointer pl-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onSelect={() => console.log("Option 2 selected")}>
              <Share /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Option 3 selected")}>
              <Package /> Invite to project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onSelect={() => console.log("Option 4 selected")}>
              <TriangleAlertIcon /> Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        {/* Description at the bottom */}
        {user.description && (
          <p className="text-sm mt-auto">{user.description}</p>
        )}
      </div>
    </div>
  );
}