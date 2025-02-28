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
  visuallyUnreadIds: string[];  // Store IDs of notifications that should show blue dot
  isInitialLoad: boolean;  // Add this to track initial load
  
  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelectedItem: (item: SelectedItem | null) => void;
  clearSelectedItem: () => void;
  toggleShowOnStartup: () => void;
  setVisuallyUnreadIds: (ids: string[]) => void;
  clearVisuallyUnreadIds: () => void;
  setInitialLoadComplete: () => void;  // Add this action
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      isOpen: false,
      selectedItem: null,
      showOnStartup: true,
      visuallyUnreadIds: [],
      isInitialLoad: true,  // Start as true

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setSelectedItem: (item) => set({ selectedItem: item }),
      clearSelectedItem: () => set({ selectedItem: null }),
      toggleShowOnStartup: () => set((state) => ({ showOnStartup: !state.showOnStartup })),
      setVisuallyUnreadIds: (ids) => set({ visuallyUnreadIds: ids }),
      clearVisuallyUnreadIds: () => set({ visuallyUnreadIds: [] }),
      setInitialLoadComplete: () => set({ isInitialLoad: false }),
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        showOnStartup: state.showOnStartup,
        visuallyUnreadIds: state.visuallyUnreadIds, // Persist the visually unread IDs
      }),
    }
  )
); 