import { dummyDemoItems } from '@renderer/components/home/dummy-data';
import { DemoItem } from '@renderer/types/items';
import { create } from 'zustand';

interface ItemsStore {
  data: DemoItem[];
  // Data selectors
  filesAndFolders: DemoItem[];
  projects: DemoItem[];
  starredItems: DemoItem[];
  // Actions
  toggleIsStarred: (id: string) => void;
  addItem: (item: DemoItem) => void;
  removeItem: (id: string) => void;
  updateItem: (updatedItem: DemoItem) => void;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  data: dummyDemoItems,

  // Pre-computed selectors using derived state
  filesAndFolders: dummyDemoItems.filter(item => item.type === "file" || item.type === "folder"),
  projects: dummyDemoItems.filter(item => item.type === "project"),
  starredItems: dummyDemoItems.filter(item => item.isStarred),

  // Update actions to maintain computed properties
  toggleIsStarred: (id: string) =>
    set((state) => {
      const newData = state.data.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      );
      return {
        data: newData,
        starredItems: newData.filter(item => item.isStarred),
        filesAndFolders: newData.filter(item => item.type === "file" || item.type === "folder"),
        projects: newData.filter(item => item.type === "project"),
      };
    }),

  // Other actions similarly need to update computed properties
  addItem: (item: DemoItem) =>
    set((state) => {
      const newData = [...state.data, item];
      return {
        data: newData,
        filesAndFolders: newData.filter(item => item.type === "file" || item.type === "folder"),
        projects: newData.filter(item => item.type === "project"),
        starredItems: newData.filter(item => item.isStarred),
      };
    }),

  removeItem: (id: string) =>
    set((state) => ({
      data: state.data.filter((item) => item.id !== id),
    })),

  updateItem: (updatedItem: DemoItem) =>
    set((state) => ({
      data: state.data.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      ),
    })),
}));