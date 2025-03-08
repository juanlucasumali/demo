import { create } from 'zustand';
import { ItemType } from '@renderer/types/items';
import { persist } from 'zustand/middleware';

interface SelectedItem {
  name: string;
  type: ItemType;
  id?: string;
}

interface NotificationsState {
  isOpen: boolean;
  selectedItem: SelectedItem | null;
  showOnStartup: boolean;
  visuallyUnreadIds: string[];
  isInitialLoad: boolean;
  searchTerm: string;  // Add search state
  
  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelectedItem: (item: SelectedItem | null) => void;
  clearSelectedItem: () => void;
  toggleShowOnStartup: () => void;
  setVisuallyUnreadIds: (ids: string[]) => void;
  clearVisuallyUnreadIds: () => void;
  setInitialLoadComplete: () => void;
  setSearchTerm: (term: string) => void;  // Add search action
  clearSearch: () => void;  // Add clear search action
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      isOpen: false,
      selectedItem: null,
      showOnStartup: true,
      visuallyUnreadIds: [],
      isInitialLoad: true,
      searchTerm: '',  // Initialize search term

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setSelectedItem: (item) => set({ selectedItem: item }),
      clearSelectedItem: () => set({ selectedItem: null }),
      toggleShowOnStartup: () => set((state) => ({ showOnStartup: !state.showOnStartup })),
      setVisuallyUnreadIds: (ids) => set({ visuallyUnreadIds: ids }),
      clearVisuallyUnreadIds: () => set({ visuallyUnreadIds: [] }),
      setInitialLoadComplete: () => set({ isInitialLoad: false }),
      setSearchTerm: (term) => set({ searchTerm: term }),  // Add search setter
      clearSearch: () => set({ searchTerm: '' }),  // Add clear search
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        showOnStartup: state.showOnStartup,
        visuallyUnreadIds: state.visuallyUnreadIds,
        // Don't persist searchTerm as it should reset on page refresh
      }),
    }
  )
); 