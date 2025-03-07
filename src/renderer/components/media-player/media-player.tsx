import { cn } from "@renderer/lib/utils"
import { useMediaPlayerStore } from "@renderer/stores/use-media-player-store"
import { Button } from "@renderer/components/ui/button"
import { Play, Pause, Square } from "lucide-react"
import WavesurferPlayer from '@wavesurfer/react'
import { useEffect, useState, useRef, useCallback } from "react"

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

  // Add a ref to track initialization
  const initRef = useRef(false);

  useEffect(() => {
    if (arrayBuffer) {
      const newBlobUrl = URL.createObjectURL(new Blob([arrayBuffer], { type: 'audio/wav' }));
      setBlobUrl(newBlobUrl);
      
      return () => {
        URL.revokeObjectURL(newBlobUrl);
      };
    }
  }, [arrayBuffer]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' && 
        isVisible && 
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        isPlaying ? pauseTrack() : resumeTrack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isVisible, pauseTrack, resumeTrack]);

  // useEffect(() => {
  //   // Cleanup function for wavesurfer
  //   return () => {
  //     const currentWavesurfer = useMediaPlayerStore.getState().wavesurfer;
  //     if (currentWavesurfer) {
  //       console.log('🎵 Cleaning up previous wavesurfer instance');
  //       currentWavesurfer.destroy();
  //       useMediaPlayerStore.getState().setWavesurfer(null);
  //     }
  //   };
  // }, []);

  const onReady = useCallback((ws) => {
    console.log('🎵 MediaPlayer onReady called with wavesurfer instance:', ws);
    
    // Prevent double initialization
    if (initRef.current) {
      console.log('🎵 Skipping duplicate initialization');
      return;
    }
    
    initRef.current = true;
    
    setWavesurfer(ws);
    setDuration(ws.getDuration());
    ws.on('timeupdate', (currentTime) => {
      setCurrentTime(currentTime);
    });
    
    console.log('🎵 About to call ws.play() in onReady');
    ws.play();
    useMediaPlayerStore.setState({ isPlaying: true });
  }, [setWavesurfer]); // Add proper dependencies

  useEffect(() => {
    // Reset initialization flag when arrayBuffer changes
    if (arrayBuffer) {
      initRef.current = false;
    }
  }, [arrayBuffer]);

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
                  key={blobUrl}
                  height={32}
                  waveColor="rgb(182, 182, 182)"
                  progressColor="rgb(var(--primary))"
                  url={blobUrl}
                  onReady={onReady}
                  onPlay={() => {
                    console.log('🎵 WavesurferPlayer onPlay triggered');
                    useMediaPlayerStore.setState({ isPlaying: true });
                  }}
                  onPause={() => {
                    console.log('🎵 WavesurferPlayer onPause triggered');
                    useMediaPlayerStore.setState({ isPlaying: false });
                  }}
                  onFinish={() => {
                    console.log('🎵 WavesurferPlayer onFinish triggered');
                    useMediaPlayerStore.setState({ isPlaying: false });
                  }}
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