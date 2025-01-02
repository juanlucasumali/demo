import { create } from 'zustand'
import { b2Service } from '@renderer/services/b2-service'

interface AudioCache {
  buffer: AudioBuffer;
  lastAccessed: number;
}

interface MediaPlayerStore {
  isVisible: boolean;
  currentTrack: string | null;
  audioContext: AudioContext | null;
  audioSource: AudioBufferSourceNode | null;
  isPlaying: boolean;
  audioCache: Map<string, AudioCache>;
  setIsVisible: (visible: boolean) => void;
  setCurrentTrack: (trackId: string | null) => void;
  playTrack: (fileId: string, filePath: string) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  stopTrack: () => void;
  onPause?: () => void;
  isLoading: boolean;
}

export const useMediaPlayerStore = create<MediaPlayerStore>((set, get) => ({
  isVisible: false,
  currentTrack: null,
  audioContext: null,
  audioSource: null,
  isPlaying: false,
  audioCache: new Map(),
  isLoading: false,

  setIsVisible: (visible) => set({ isVisible: visible }),
  
  setCurrentTrack: (trackId) => set({ 
    currentTrack: trackId, 
    isVisible: !!trackId 
  }),

  playTrack: async (fileId: string, filePath: string) => {
    console.log('🎵 playTrack called with:', { fileId, filePath });
    const state = get();
    console.log('Current state before play:', {
      isPlaying: state.isPlaying,
      currentTrack: state.currentTrack,
      hasAudioSource: !!state.audioSource,
      contextState: state.audioContext?.state
    });
    
    let audioContext = state.audioContext;
    
    // Initialize AudioContext if needed
    if (!audioContext) {
      audioContext = new AudioContext();
      set({ audioContext });
    }

    // Resume context if it's suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    // Stop current playback if any
    if (state.audioSource) {
      state.audioSource.stop();
    }

    // Prevent multiple simultaneous playback attempts
    if (state.isLoading) {
      console.log('🎵 Already loading a track, ignoring play request');
      return;
    }

    set({ isLoading: true });

    try {
      let audioBuffer: AudioBuffer;
      
      // Check cache first
      const cached = state.audioCache.get(filePath);
      if (cached) {
        console.log('🎵 Using cached audio buffer');
        audioBuffer = cached.buffer;
        // Update last accessed time
        state.audioCache.set(filePath, {
          buffer: cached.buffer,
          lastAccessed: Date.now()
        });
      } else {
        // Download and decode if not cached
        console.log('🔄 Downloading audio file...');
        const arrayBuffer = await b2Service.retrieveFile(filePath);
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Cache the decoded audio
        state.audioCache.set(filePath, {
          buffer: audioBuffer,
          lastAccessed: Date.now()
        });

        // Basic cache management (keep last 5 tracks)
        if (state.audioCache.size > 5) {
          let oldest = { key: '', time: Date.now() };
          state.audioCache.forEach((value, key) => {
            if (value.lastAccessed < oldest.time) {
              oldest = { key, time: value.lastAccessed };
            }
          });
          state.audioCache.delete(oldest.key);
        }
      }

      // Create and start new audio source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);

      set({ 
        audioSource: source,
        currentTrack: fileId,
        isPlaying: true,
        isVisible: true,
        isLoading: false
      });

    } catch (error) {
      console.error('Failed to play audio:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  pauseTrack: () => {
    const { audioContext, onPause } = get();
    console.log('🎵 pauseTrack called, current state:', {
      hasContext: !!audioContext,
      hasPauseCallback: !!onPause
    });
    if (audioContext) {
      audioContext.suspend();
      set({ isPlaying: false });
      onPause?.();
    }
  },

  resumeTrack: () => {
    const { audioContext } = get();
    if (audioContext) {
      audioContext.resume();
      set({ isPlaying: true });
    }
  },

  stopTrack: () => {
    const { audioSource } = get();
    if (audioSource) {
      audioSource.stop();
      set({ 
        audioSource: null,
        isPlaying: false,
        currentTrack: null,
        isVisible: false
      });
    }
  }
})); 