import { dummyDemoItems, dummyProjectItems } from '@renderer/components/home/dummy-data';
import { DemoItem } from '@renderer/types/items';
import { create } from 'zustand';

interface ItemsStore {
  // Separate storage for files/folders and projects
  filesAndFolders: DemoItem[];
  projects: DemoItem[];
  
  // Computed state
  starredItems: DemoItem[];
  
  // Actions
  toggleIsStarred: (id: string) => void;
  addFileOrFolder: (item: DemoItem) => void;
  addProject: (item: DemoItem) => void;
  removeItem: (id: string) => void;
  updateItem: (updatedItem: DemoItem) => void;
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  // Initialize with separated data
  filesAndFolders: dummyDemoItems,
  projects: dummyProjectItems,
  
  // Compute starred items from both arrays
  starredItems: [...dummyDemoItems, ...dummyProjectItems].filter(item => item.isStarred),

  toggleIsStarred: (id: string) =>
    set((state) => {
      const newFilesAndFolders = state.filesAndFolders.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      );
      
      const newProjects = state.projects.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      );

      return {
        filesAndFolders: newFilesAndFolders,
        projects: newProjects,
        starredItems: [...newFilesAndFolders, ...newProjects].filter(item => item.isStarred),
      };
    }),

  addFileOrFolder: (item: DemoItem) =>
    set((state) => {
      const newFilesAndFolders = [...state.filesAndFolders, item];
      return {
        filesAndFolders: newFilesAndFolders,
        starredItems: [...newFilesAndFolders, ...state.projects].filter(item => item.isStarred),
      };
    }),

  addProject: (item: DemoItem) =>
    set((state) => {
      const newProjects = [...state.projects, item];
      return {
        projects: newProjects,
        starredItems: [...state.filesAndFolders, ...newProjects].filter(item => item.isStarred),
      };
    }),

  removeItem: (id: string) =>
    set((state) => {
      const newFilesAndFolders = state.filesAndFolders.filter(item => item.id !== id);
      const newProjects = state.projects.filter(item => item.id !== id);
      
      return {
        filesAndFolders: newFilesAndFolders,
        projects: newProjects,
        starredItems: [...newFilesAndFolders, ...newProjects].filter(item => item.isStarred),
      };
    }),

  updateItem: (updatedItem: DemoItem) =>
    set((state) => {
      const newFilesAndFolders = state.filesAndFolders.map(item =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );
      
      const newProjects = state.projects.map(item =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      );

      return {
        filesAndFolders: newFilesAndFolders,
        projects: newProjects,
        starredItems: [...newFilesAndFolders, ...newProjects].filter(item => item.isStarred),
      };
    }),
}));