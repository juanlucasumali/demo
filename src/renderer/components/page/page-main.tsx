import { ReactNode } from 'react'

interface PageContentProps {
    children: ReactNode
}

export function PageMain({ children }: PageContentProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
        </div>
    )
}