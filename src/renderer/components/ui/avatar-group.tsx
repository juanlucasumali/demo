import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import { MoreHorizontal, X } from "lucide-react"
import { UserProfile } from "@renderer/types/users"
import { Link } from "@tanstack/react-router"

interface AvatarGroupProps {
  owner?: UserProfile
  users?: UserProfile[]
  limit?: number
  size?: "sm" | "md" | "lg"
  onRemove?: (userId: string) => void
  showRemove?: boolean
  variant?: "stack" | "grid"
  className?: string
}

// Grid layout positions matching the original GridItem implementation
const avatarPositions = [
  "top-[8px] right-[-12px] z-[2]",    // First avatar (top right corner)
  "top-[2px] right-[8px] z-[3]",      // Second avatar (above and left)
  "top-[24px] right-[-22px] z-[3]",   // Third avatar (below and right)
  "top-[2px] right-[29px] z-[1]",     // Fourth avatar (left of second)
  "top-[45px] right-[-22px] z-[1]",   // Fifth avatar (below third)
]

export function AvatarGroup({ 
  owner, 
  users = [], 
  limit = 5,
  size = "md",
  onRemove,
  showRemove = false,
  variant = "stack",
  className
}: AvatarGroupProps) {
  const allUsers = owner ? [owner, ...users] : users
  const visibleUsers = allUsers.slice(0, limit - 1)
  const remainingUsers = allUsers.slice(limit - 1)
  const hasMoreUsers = remainingUsers.length > 0

  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-11 w-11"
  }

  const avatarSize = sizeClasses[size]

  const renderDropdownContent = () => (
    <DropdownMenuContent align="end">
      {remainingUsers.map((user) => (
        <DropdownMenuItem key={user.id} className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to={`/profiles/${user.id}` as any}>
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={user.avatar || ""} alt={user.username} />
                <AvatarFallback>
                {user.username[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <span>@{user.username}</span>
          </div>
          {showRemove && onRemove && user.id !== owner?.id && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onRemove(user.id)
              }}
              className="ml-2 text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-100/10"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  )

  if (variant === "grid") {
    return (
      <div className="relative w-full h-full">
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className={`absolute ${avatarPositions[index]}`}>
                <Link to={`/profiles/${user.id}` as any}>
                  <Avatar className={`${avatarSize} border-2 border-background`}>
                    <AvatarImage src={user.avatar || ""} alt={user.username} />
                    <AvatarFallback className="text-sm">
                      {user.username[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex items-center gap-1">
                <p className="text-xs">@{user.username}</p>
                {index === 0 && owner && (
                  <span className="text-xs text-muted-foreground">(Owner)</span>
                )}
                {showRemove && onRemove && user.id !== owner?.id && (
                  <button
                    onClick={() => onRemove(user.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {hasMoreUsers && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={`absolute ${avatarPositions[4]}`}>
                <Link to={`/profiles/${owner?.id}` as any}>
                  <Avatar className={`${avatarSize} border-2 border-background cursor-pointer`}>
                    <AvatarFallback>
                      <MoreHorizontal className="h-4 w-4" />
                  </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </DropdownMenuTrigger>
            {renderDropdownContent()}
          </DropdownMenu>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex -space-x-3">
        {visibleUsers.map((user, index) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className={`cursor-${onRemove ? "pointer" : "default"}`}>
              <Link to={`/profiles/${user.id}` as any}>
                  <Avatar className={`${avatarSize} border-2 border-background`}>
                    <AvatarImage src={user.avatar || ""} alt={user.username} />
                    <AvatarFallback>
                      {user.username[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="flex items-center gap-1">
                <span>@{user.username}</span>
                {index === 0 && owner && (
                  <span className="text-xs text-muted-foreground">(Owner)</span>
                )}
                {showRemove && onRemove && user.id !== owner?.id && (
                  <button 
                    onClick={() => onRemove(user.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {hasMoreUsers && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <Link to={`/profiles/${owner?.id}` as any}>
                  <Avatar className={`${avatarSize} border-2 border-background`}>
                    <AvatarFallback>
                      <MoreHorizontal className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </DropdownMenuTrigger>
            {renderDropdownContent()}
          </DropdownMenu>
        )}
      </div>
    </div>
  )
} 