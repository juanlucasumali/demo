import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  history: string[];
  currentIndex: number;
  
  // Actions
  addPath: (path: string) => void;
  goBack: () => string | null;
  goForward: () => string | null;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      history: [],
      currentIndex: -1,

      addPath: (path: string) => {
        const { history, currentIndex } = get();
        
        // If we're not at the end of the history, remove all future entries
        const newHistory = history.slice(0, currentIndex + 1);
        
        // Only add the path if it's different from the current one
        if (newHistory[newHistory.length - 1] !== path) {
          newHistory.push(path);
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
    }),
    {
      name: 'navigation-storage',
    }
  )
); 