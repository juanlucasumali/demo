import { Row } from "@tanstack/react-table"
import { Checkbox } from "@renderer/components/ui/checkbox"
import TagBadge from "@renderer/components/tag-badge"
import { FileTag } from "@renderer/types/tags"
import folderImage from "@renderer/assets/macos-folder.png"
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"
import { UserProfile } from "@renderer/types/users"
import { Tooltip, TooltipContent, TooltipTrigger } from "@renderer/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@renderer/components/ui/dropdown-menu"

interface GridItemProps<TData> {
  row: Row<TData>;
  isSelected: boolean
  onSelectionChange: (checked: boolean) => void
}

export function GridItem<DemoItem>({ 
  row, 
  isSelected, 
  onSelectionChange 
}: GridItemProps<DemoItem>) {
  const sharedWith = row.getValue("sharedWith") as UserProfile[] | null;
  const hasCollaborators = !row.getValue("icon") && sharedWith && sharedWith.length > 0;

  const avatarPositions = [
    "top-0 right-0 z-[2]", // First avatar (top right corner) - above folder, below 2nd/3rd
    "top-[-5px] right-5 z-[3]", // Second avatar (above and left) - topmost layer
    "top-5 right-[-22px] z-[3]", // Third avatar (below and right) - topmost layer
    "top-[-5px] right-10 z-[1]", // Fourth avatar (left of second) - behind folder
    "top-10 right-[-22px] z-[1]", // Fifth avatar (below third) - behind folder
  ];

  return (
    <div 
      className="group relative flex flex-col items-center p-4 rounded-lg border hover:shadow-md transition-shadow"
      data-state={isSelected ? "selected" : undefined}
    >
      {/* Icon/Thumbnail with Collaborators */}
      <div className="relative">
        <div className="w-32 h-32 rounded-2xl mb-2 flex items-center justify-center text-4xl">
          {row.getValue("icon") ? (
            <img src={row.getValue("icon")} alt="Icon" className="w-full h-full object-cover" />
          ) : (
            <>
              <img 
                src={folderImage} 
                alt="Folder Icon" 
                className="w-full h-full object-cover relative z-[2]" 
              />
              {hasCollaborators && (
                <div className="absolute top-0 right-0 w-full h-full">
                  {/* First 5 collaborators */}
                  {sharedWith.slice(0, sharedWith.length > 5 ? 4 : 5).map((user, index) => (
                    <Tooltip key={user.id}>
                      <TooltipTrigger asChild>
                        <div className={`absolute ${avatarPositions[index]}`}>
                          <Avatar className="h-7 w-7 border-2 border-background">
                            <AvatarImage src={user.avatar || ""} alt={user.username} />
                            <AvatarFallback className="text-sm">
                              {user.username[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">{user.username}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}

                  {/* Show more dropdown if there are additional collaborators */}
                  {sharedWith.length > 5 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className={`absolute ${avatarPositions[4]}`}>
                          <Avatar className="h-7 w-7 border-2 border-background cursor-pointer">
                            <AvatarFallback>
                              <MoreHorizontal className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {sharedWith.slice(4).map((user) => (
                          <DropdownMenuItem key={user.id}>
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={user.avatar || ""} alt={user.username} />
                              <AvatarFallback>
                                {user.username[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {user.username}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="font-normal text-sm mb-1 text-center truncate max-w-[8rem]">
        {row.getValue("name")}
      </h3>

      {/* Bottom Row: Checkbox and Tag */}
      <div className="flex items-center justify-center w-full space-x-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label={`Select ${row.getValue("name")}`}
        />
        
        {row.getValue("tags") as FileTag && (
          <div className="flex-shrink-0">
            <TagBadge tag={row.getValue("tags")} />
          </div>
        )}
      </div>
    </div>
  )
} 