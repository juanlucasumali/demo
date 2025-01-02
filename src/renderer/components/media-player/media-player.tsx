import { cn } from "@renderer/lib/utils"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"
import { Button } from "@renderer/components/ui/button"
import { Play, Pause, Square } from "lucide-react"

export function MediaPlayer() {
  const isVisible = useMediaPlayerStore(state => state.isVisible);
  const currentTrack = useMediaPlayerStore(state => state.currentTrack);
  const isPlaying = useMediaPlayerStore(state => state.isPlaying);
  const pauseTrack = useMediaPlayerStore(state => state.pauseTrack);
  const resumeTrack = useMediaPlayerStore(state => state.resumeTrack);
  const stopTrack = useMediaPlayerStore(state => state.stopTrack);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "h-24 bg-muted border-t",
      "transition-all duration-300 ease-in-out",
      "z-50",
      "flex items-center justify-center gap-4"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => isPlaying ? pauseTrack() : resumeTrack()}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={stopTrack}
      >
        <Square className="h-4 w-4" />
      </Button>

      <div>Now Playing: Track {currentTrack}</div>
    </div>
  );
} 