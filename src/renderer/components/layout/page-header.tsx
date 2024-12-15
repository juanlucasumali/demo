import { generateGradientStyle } from "@/renderer/lib/utils"
import { useMemo } from "react"
import { Icon } from '@tabler/icons-react'

interface PageHeaderProps {
  title: string
  description?: string | null
  projectId?: string
  icon?: Icon
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
    <div className="flex items-center gap-4">
      {/* This div will always maintain its size and position */}
      <div 
        className={`
          flex size-10 items-center justify-center rounded-xl
          ${projectId ? '' : 'bg-muted'} // Optional: add a background for when neither icon nor gradient is present
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
