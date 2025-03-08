import { cn, generateGradientStyle } from "../../lib/utils"
import { LucideIcon } from "lucide-react";
import { useMemo, ReactNode } from "react"
import { FileTag } from "@renderer/types/tags"
import TagBadge from "@renderer/components/tag-badge"
import { UserProfile } from "@renderer/types/users";
import { AvatarGroup } from "../ui/avatar-group"
import folderImage from "@renderer/assets/macos-folder.png"

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
    <div className="overflow-x-auto no-scrollbar z-10">
      <div className={cn(
        "flex flex-row items-center justify-between gap-4 container mx-auto pt-10 px-10 pb-6 min-w-[800px]", 
        className
      )}>
        {/* Left Side: Icon and Text */}
        <div className="flex items-center gap-4 shrink-0">
          <div 
            className={`
              flex size-16 items-center justify-center top-0 rounded-xl shrink-0
              // ${projectId ? '' : 'bg-muted'}
              ${'bg-muted'}
            `}
            // style={projectId ? iconGradientStyle : undefined}
          >
            {projectId ? (
              <img 
                src={folderImage} 
                alt="Folder Icon" 
                className="w-10 h-10 object-contain" 
              />
            ) : Icon && <Icon size={37} />}
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
              {tag && <TagBadge tag={tag} className="shrink-0 ml-2" />}
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
          {owner && (
            <div className="flex items-center shrink-0">
              <AvatarGroup
                owner={owner}
                users={sharedWith || []}
                size="lg"
              />
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
    </div>
  )
}