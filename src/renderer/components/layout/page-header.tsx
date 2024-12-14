import { generateGradientStyle } from "@/renderer/lib/utils"
import { useMemo } from "react"
import { Icon } from '@tabler/icons-react'

interface PageHeaderProps {
  title: string
  description?: string
  projectId?: string
  icon?: Icon
}

export function PageHeader({ 
  title, 
  description, 
  projectId,
  icon: Icon 
}: PageHeaderProps) {
  const logoGradientStyle = useMemo(() => {
    if (!projectId) return
    return generateGradientStyle(projectId)
  }, [projectId])

  return (
    <div className="flex items-center gap-4"> {/* Changed gap-3 to gap-4 */}
      <div 
        className="flex size-10 items-center justify-center rounded-xl"
        style={logoGradientStyle}
      >
        {Icon && <Icon size={24} className="" />} {/* Changed size from 28 to 24 */}
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
