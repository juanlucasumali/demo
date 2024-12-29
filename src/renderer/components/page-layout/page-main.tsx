import { cn } from '@renderer/lib/utils'
import { ReactNode } from 'react'

interface PageContentProps {
    children: ReactNode
    className?: string
}

export function PageMain({ children, className }: PageContentProps) {
    return (
        <div className={cn("flex flex-1 flex-col gap-4 p-4 pt-0", className)}   >
            {children}
        </div>
    )
}