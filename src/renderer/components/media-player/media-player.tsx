import { cn } from "@renderer/lib/utils"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"
import { Button } from "@renderer/components/ui/button"
import { Play, Pause, Square } from "lucide-react"
import WavesurferPlayer from '@wavesurfer/react'
import { useEffect, useState } from "react"

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function MediaPlayer() {
  const isVisible = useMediaPlayerStore(state => state.isVisible);
  const currentTrackId = useMediaPlayerStore(state => state.currentTrackId);
  const currentTrackName = useMediaPlayerStore(state => state.currentTrackName);
  const isPlaying = useMediaPlayerStore(state => state.isPlaying);
  const arrayBuffer = useMediaPlayerStore(state => state.arrayBuffer);
  const setWavesurfer = useMediaPlayerStore(state => state.setWavesurfer);
  const pauseTrack = useMediaPlayerStore(state => state.pauseTrack);
  const resumeTrack = useMediaPlayerStore(state => state.resumeTrack);
  const stopTrack = useMediaPlayerStore(state => state.stopTrack);
  
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (arrayBuffer) {
      const newBlobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: 'audio/wav' }));
      setBlobUrl(newBlobUrl);
      
      return () => {
        URL.revokeObjectURL(newBlobUrl);
      };
    }
  }, [arrayBuffer]);

  const onReady = (ws) => {
    setWavesurfer(ws);
    setDuration(ws.getDuration());
    ws.on('timeupdate', (currentTime) => {
      setCurrentTime(currentTime);
    });
    ws.play();
    useMediaPlayerStore.setState({ isPlaying: true });
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0",
      "h-24 bg-muted border-t",
      "transition-all duration-300 ease-in-out",
      "z-50"
    )}>
      <div className="flex flex-col h-full">
        <div className="flex-1 pt-4 px-4">
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-12 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-1">
              {arrayBuffer && blobUrl && (
                <WavesurferPlayer
                  height={32}
                  waveColor="rgb(182, 182, 182)"
                  progressColor="rgb(var(--primary))"
                  url={blobUrl}
                  onReady={onReady}
                  onPlay={() => useMediaPlayerStore.setState({ isPlaying: true })}
                  onPause={() => useMediaPlayerStore.setState({ isPlaying: false })}
                  onFinish={() => useMediaPlayerStore.setState({ isPlaying: false })}
                  onError={(error) => {
                    console.error('🌊 Wavesurfer error:', error);
                  }}
                />
              )}
            </div>

            <span className="text-xs text-muted-foreground w-12">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-4 p-2">
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

          <div>{currentTrackName}</div>
        </div>
      </div>
    </div>
  );
} 