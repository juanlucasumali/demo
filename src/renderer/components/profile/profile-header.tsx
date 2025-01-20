import { UserProfile } from "@renderer/types/users";
import { Ban, Ellipsis, Box, Plus, Share, TriangleAlertIcon, PencilIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useUserStore } from "@renderer/stores/user-store";
import { useState } from "react";
import { useToast } from "@renderer/hooks/use-toast";

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({
  profile,
}: ProfileHeaderProps) {
  const { uploadAvatar, updateProfile } = useUserStore();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const avatarInfo = await uploadAvatar(profile.id, file);
      
      await updateProfile({
        ...profile,
        avatar: avatarInfo.b2FileId
      });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-6 container mx-auto pt-10 px-10">
      
      {/* Avatar Column */}
      <div className="flex flex-col items-center relative">
        <div className="flex items-center justify-center w-48 h-48 rounded-full group">
          <Avatar className="h-48 w-48">
            <AvatarImage src={profile.avatar ?? undefined} alt={profile.username} />
            <AvatarFallback className="text-8xl font-bold rounded-full">
              {profile.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
              opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <PencilIcon className="h-8 w-8 text-white" />
          </label>
          <Input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Name, Dropdown, and Description Column */}
      <div className="flex flex-col items-start flex-grow gap-4">
        {/* Username and Dropdown */}
        <div className="flex items-end gap-2 -mb-3">
          <h1 className="text-4xl font-bold tracking-tight pr-2">{profile.name}</h1>
        </div>
        {/* Username */}
        <div className="text-center text-sm text-muted-foreground">@{profile.username}</div>

        {/* If you're current user, this button will be an EditProfile dropdown */}

        <div className="flex items-center gap-2 whitespace-nowrap">
          {/* <Button
              variant="default"
              className="flex w-16 h-7 p-0"
            >
                <Plus className="-mr-1" />
                Add
          </Button> */}

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Ellipsis className="w-6 h-6 text-primary cursor-pointer pl-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onSelect={() => console.log("Option 2 selected")}>
              <Share /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => console.log("Option 3 selected")}>
              <Box /> Invite to project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onSelect={() => console.log("Option 4 selected")}>
              <TriangleAlertIcon /> Report
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500" onSelect={() => console.log("Option 4 selected")}>
              <Ban /> Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        </div>

        {/* Description at the bottom */}
        {profile.description && (
          <p className="text-sm mt-auto">{profile.description}</p>
        )}
      </div>
    </div>
  );
}