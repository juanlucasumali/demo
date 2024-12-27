import { dummyDemoItems } from '@renderer/components/home/dummy-data';
import { DemoItem } from '@renderer/types/items';
import { create } from 'zustand';

interface ItemsStore {
  data: DemoItem[];
  toggleIsStarred: (id: string) => void;
  addItem: (item: DemoItem) => void;
  removeItem: (id: string) => void;
  updateItem: (updatedItem: DemoItem) => void;
}

export const useItemsStore = create<ItemsStore>((set) => ({
  data: dummyDemoItems,
  toggleIsStarred: (id: string) =>
    set((state) => ({
      data: state.data.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      ),
    })),
  addItem: (item: DemoItem) =>
    set((state) => ({
      data: [...state.data, item],
    })),
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