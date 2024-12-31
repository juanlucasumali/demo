import { create } from 'zustand';

interface FolderNavigationState {
  history: (string | null)[];
  currentIndex: number;
  
  // Actions
  addFolder: (folderId: string | null) => void;
  goBack: () => string | null;
  goForward: () => string | null;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  reset: () => void;
  initializeHistory: () => void;
}

export const useFolderNavigationStore = create<FolderNavigationState>()(
  (set, get) => ({
    history: [],
    currentIndex: -1,

    initializeHistory: () => {
        set({
            history: [null],
            currentIndex: 0
        })
    },

    addFolder: (folderId: string | null) => {
      const { history, currentIndex } = get();
      const newHistory = history.slice(0, currentIndex + 1);
      
      if (newHistory[newHistory.length - 1] !== folderId) {
        newHistory.push(folderId);
        set({
          history: newHistory,
          currentIndex: newHistory.length - 1
        });
      }
    },

    goBack: () => {
      const { history, currentIndex } = get();
      if (currentIndex > 0) {
        set({ currentIndex: currentIndex - 1 });
        return history[currentIndex - 1];
      }
      return null;
    },

    goForward: () => {
      const { history, currentIndex } = get();
      if (currentIndex < history.length - 1) {
        set({ currentIndex: currentIndex + 1 });
        return history[currentIndex + 1];
      }
      return null;
    },

    canGoBack: () => {
      const { currentIndex } = get();
      return currentIndex > 0;
    },

    canGoForward: () => {
      const { history, currentIndex } = get();
      return currentIndex < history.length - 1;
    },

    reset: () => {
      set({ history: [], currentIndex: -1 });
    },
  }),
); 