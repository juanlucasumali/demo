import { ReactNode } from "react"
import { cn } from "@renderer/lib/utils"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"

interface PageContentProps {
    children: ReactNode
}

export function PageContent({ children }: PageContentProps) {
  const isPlayerVisible = useMediaPlayerStore(state => state.isVisible);
  
  return (
    <div className={cn(
      "min-h-[50vh] flex-1 rounded-xl md:min-h-min container mx-auto px-10",
      "transition-[height] duration-300 ease-in-out",
      isPlayerVisible && "mb-24" // Add margin bottom when player is visible
    )}>
      {children}
    </div>
  )
}
