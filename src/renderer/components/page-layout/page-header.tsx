import { cn, generateGradientStyle } from "../../lib/utils"
import { LucideIcon } from "lucide-react";
import { useMemo, ReactNode } from "react"
import { FileTag } from "@renderer/types/tags"
import TagBadge from "@renderer/components/tag-badge"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { UserProfile } from "@renderer/types/users"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@renderer/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string | null
  projectId?: string
  icon?: LucideIcon
  tag?: FileTag | null
  owner?: UserProfile
  sharedWith?: UserProfile[] | null
  children?: ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  description, 
  projectId,
  icon: Icon,
  tag,
  owner,
  sharedWith = [],
  children,
  className
}: PageHeaderProps) {
  const iconGradientStyle = useMemo(() => {
    if (!projectId) return
    return generateGradientStyle(projectId)
  }, [projectId])

  return (
    <div className={cn("flex flex-col lg:flex-row lg:items-center items-start justify-between gap-4 container mx-auto pt-10 px-10", className)}>
      {/* Left Side: Icon and Text */}
      <div className="flex items-center gap-4 lg:pb-0 pb-2 min-w-[400px]">
        <div 
          className={`
            flex size-16 items-center justify-center top-0 rounded-xl shrink-0
            ${projectId ? '' : 'bg-muted'}
          `}
          style={projectId ? iconGradientStyle : undefined}
        >
          {Icon && <Icon size={37} />}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-bold tracking-tight truncate max-w-[300px]">{title}</h1>
            {tag && <TagBadge tag={tag} className="shrink-0" />}
          </div>
          {description && (
            <p className='text-sm text-muted-foreground truncate max-w-[400px]'>
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Right Side: Shared Users + Children */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Shared Users */}
        {owner && (
          <div className="flex items-center shrink-0">
            <div className="flex -space-x-3">
              {/* Owner Avatar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    <Avatar className="h-9 w-9 border-2 border-background">
                      <AvatarImage src={owner.avatar || ""} alt={owner.username} />
                      <AvatarFallback>
                        {owner.username[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="flex items-center gap-1">
                    <span>@{owner.username}</span>
                    <span className="text-xs text-muted-foreground">(Owner)</span>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* First 4 Shared Users */}
              {sharedWith && sharedWith.slice(0, 4).map((profile) => (
                <Tooltip key={profile.id}>
                  <TooltipTrigger asChild>
                    <div className="cursor-default">
                      <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarImage src={profile.avatar || ""} alt={profile.username} />
                        <AvatarFallback>
                          {profile.username[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    @{profile.username}
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* Dropdown for additional users */}
              {sharedWith && sharedWith.length > 4 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer">
                      <Avatar className="h-9 w-9 border-2 border-background">
                        <AvatarFallback>
                          <MoreHorizontal className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {sharedWith.slice(4).map((profile) => (
                      <DropdownMenuItem key={profile.id}>
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={profile.avatar || ""} alt={profile.username} />
                          <AvatarFallback>
                            {profile.username[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        @{profile.username}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {children && (
          <div className="flex items-center space-x-4 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}