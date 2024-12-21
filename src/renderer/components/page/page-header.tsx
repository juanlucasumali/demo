import { generateGradientStyle } from "../../lib/utils"
import { LucideIcon } from "lucide-react";
import { useMemo } from "react"

interface PageHeaderProps {
  title: string
  description?: string | null
  projectId?: string
  icon?: LucideIcon
}

export function PageHeader({ 
  title, 
  description, 
  projectId,
  icon: Icon 
}: PageHeaderProps) {
  const iconGradientStyle = useMemo(() => {
    if (!projectId) return
    return generateGradientStyle(projectId)
  }, [projectId])

  return (
    <div className="flex items-center gap-4 container mx-auto pt-10 px-10">
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
  )
}
