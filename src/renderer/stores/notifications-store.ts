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
  
  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSelectedItem: (item: SelectedItem | null) => void;
  clearSelectedItem: () => void;
  toggleShowOnStartup: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      selectedItem: null,
      showOnStartup: true,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setSelectedItem: (item) => set({ selectedItem: item }),
      clearSelectedItem: () => set({ selectedItem: null }),
      toggleShowOnStartup: () => set((state) => ({ showOnStartup: !state.showOnStartup })),
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({
        showOnStartup: state.showOnStartup,
      }),
    }
  )
); 