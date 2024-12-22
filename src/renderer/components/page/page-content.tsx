import { ReactNode } from "react"

interface PageContentProps {
    children: ReactNode
}

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="min-h-[50vh] flex-1 rounded-xl md:min-h-min container mx-auto py-5 px-10">
        {children}
    </div>
  )
}
