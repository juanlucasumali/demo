import { create } from 'zustand';
import { DemoItem } from '@renderer/types/items';
import * as itemsService from '@renderer/services/items-service';

interface ItemsStore {
  filesAndFolders: DemoItem[];
  projects: DemoItem[];
  starredItems: DemoItem[];
  
  // Actions
  fetchItems: () => Promise<void>;
  toggleIsStarred: (id: string) => Promise<void>;
  addFileOrFolder: (item: DemoItem) => Promise<void>;
  addProject: (item: DemoItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateItem: (updatedItem: DemoItem) => Promise<void>;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  filesAndFolders: [],
  projects: [],
  starredItems: [],

  fetchItems: async () => {
    const [filesAndFolders, projects] = await Promise.all([
      itemsService.getFilesAndFolders(),
      itemsService.getProjects()
    ]);

    set({
      filesAndFolders,
      projects,
      starredItems: [...filesAndFolders, ...projects].filter(item => item.isStarred)
    });
  },

  toggleIsStarred: async (id: string) => {
    const state = get();
    const item = [...state.filesAndFolders, ...state.projects].find(item => item.id === id);
    if (!item) return;

    await itemsService.toggleItemStar(id, !item.isStarred);
    await state.fetchItems();
  },

  addFileOrFolder: async (item: DemoItem) => {
    await itemsService.addFileOrFolder(item);
    await get().fetchItems();
  },

  addProject: async (item: DemoItem) => {
    await itemsService.addProject(item);
    await get().fetchItems();
  },

  removeItem: async (id: string) => {
    await itemsService.removeItem(id);
    await get().fetchItems();
  },

  updateItem: async (updatedItem: DemoItem) => {
    await itemsService.updateItem(updatedItem);
    await get().fetchItems();
  }
}));