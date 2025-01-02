import { cn } from "@renderer/lib/utils"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"

export function MediaPlayer() {
  const isVisible = useMediaPlayerStore(state => state.isVisible);
  const currentTrack = useMediaPlayerStore(state => state.currentTrack);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "h-24 bg-primary/10 border-t",
      "transition-all duration-300 ease-in-out",
      "z-50",
      "flex items-center justify-center"
    )}>
      <div>Now Playing: Track {currentTrack}</div>
    </div>
  );
} 