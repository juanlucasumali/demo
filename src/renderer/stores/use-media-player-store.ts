import { create } from 'zustand'
import { b2Service } from '@renderer/services/b2-service'

interface MediaPlayerStore {
  isVisible: boolean;
  currentTrackId: string | null;
  currentTrackName: string | null;
  isPlaying: boolean;
  isLoading: boolean;
  arrayBuffer: ArrayBuffer | null;
  audioCache: Map<string, ArrayBuffer>;
  wavesurfer: any | null;
  setWavesurfer: (ws: any) => void;
  setIsVisible: (visible: boolean) => void;
  setCurrentTrack: (trackId: string | null, trackName: string | null) => void;
  playTrack: (fileId: string, fileName: string, filePath: string) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  onPause?: () => void;
}

export const useMediaPlayerStore = create<MediaPlayerStore>((set, get) => ({
  isVisible: false,
  currentTrackId: null,
  currentTrackName: null,
  isPlaying: false,
  isLoading: false,
  arrayBuffer: null,
  audioCache: new Map(),
  wavesurfer: null,

  setWavesurfer: (ws) => set({ wavesurfer: ws }),
  setIsVisible: (visible) => set({ isVisible: visible }),
  setCurrentTrack: (trackId, trackName) => set({ currentTrackId: trackId, currentTrackName: trackName, isVisible: !!trackId }),

  playTrack: async (fileId: string, fileName: string, filePath: string) => {
    const state = get();
    
    if (state.isLoading) return;
    set({ isLoading: true });

    try {
      // Stop current track if any
      if (state.wavesurfer) {
        state.wavesurfer.stop();
      }

      let audioData = state.audioCache.get(filePath);
      
      if (!audioData) {
        audioData = await b2Service.retrieveFile(filePath);
        state.audioCache.set(filePath, audioData);
      }

      set({ 
        arrayBuffer: audioData,
        currentTrackId: fileId,
        currentTrackName: fileName,
        isVisible: true,
        isLoading: false
      });
    } catch (error) {
      console.error('Failed to load audio:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  pauseTrack: () => {
    const { wavesurfer, onPause } = get();
    if (wavesurfer) {
      wavesurfer.pause();
      set({ isPlaying: false });
      onPause?.();
    }
  },

  resumeTrack: () => {
    const { wavesurfer } = get();
    if (wavesurfer) {
      wavesurfer.play();
      set({ isPlaying: true });
    }
  },

  stopTrack: () => {
    const { wavesurfer } = get();
    if (wavesurfer) {
      wavesurfer.stop();
      set({ 
        isPlaying: false,
        currentTrackId: null,
        currentTrackName: null,
        isVisible: false,
        arrayBuffer: null
      });
    }
  }
})); 