import { create } from 'zustand'

interface MediaPlayerStore {
  isVisible: boolean
  currentTrack: string | null
  setIsVisible: (visible: boolean) => void
  setCurrentTrack: (trackId: string | null) => void
}

export const useMediaPlayerStore = create<MediaPlayerStore>((set) => ({
  isVisible: false,
  currentTrack: null,
  setIsVisible: (visible) => set({ isVisible: visible }),
  setCurrentTrack: (trackId) => set({ currentTrack: trackId, isVisible: !!trackId })
})) 