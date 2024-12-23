import { dummyData } from '@renderer/components/home/dummy-data';
import { DemoItem } from '@renderer/types/items';
import { create } from 'zustand';

interface ItemsStore {
  data: DemoItem[];
  toggleIsStarred: (id: string) => void;
}

export const useDataStore = create<ItemsStore>((set) => ({
  data: dummyData,
  toggleIsStarred: (id: string) =>
    set((state) => ({
      data: state.data.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      ),
    })),
}));