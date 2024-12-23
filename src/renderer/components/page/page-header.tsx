import { generateGradientStyle } from "../../lib/utils"
import { LucideIcon } from "lucide-react";
import { useMemo, ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string | null
  projectId?: string
  icon?: LucideIcon
  children?: ReactNode // 1. Add children prop
}

export function PageHeader({ 
  title, 
  description, 
  projectId,
  icon: Icon,
  children // 1. Destructure children
}: PageHeaderProps) {
  const iconGradientStyle = useMemo(() => {
    if (!projectId) return
    return generateGradientStyle(projectId)
  }, [projectId])

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 container mx-auto pt-10 px-10">
      {/* Left Side: Icon and Text */}
      <div className="flex items-center gap-4">
        <div 
          className={`
            flex size-12 items-center justify-center top-0 rounded-xl
            ${projectId ? '' : 'bg-muted'}
          `}
          style={projectId ? iconGradientStyle : undefined}
        >
          {Icon && <Icon size={24} />}
        </div>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className='text-sm text-muted-foreground'>
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* Right Side: Children */}
      {children && (
        <div className="flex items-center space-x-4">
          {children}
        </div>
      )}
    </div>
  )
}