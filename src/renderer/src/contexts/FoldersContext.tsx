import { createContext, useContext, ReactNode, useState } from 'react';
import { FileTreeItem, DemoItem } from '../types/files';
import { supabase } from '../lib/supabaseClient';
import { buildTree } from '../utils/buildTree';

interface FoldersContextType {
  folders: FileTreeItem[];
  currentFolderId: string | null;
  isLoading: boolean;
  error: any;
  setCurrentFolder: (folderId: string | null) => void;
  createFolder: (folderName: string) => Promise<boolean>;
  deleteFolder: (folderId: string) => Promise<boolean>;
  getFolderContents: (folderId: string | null) => Promise<DemoItem[]>;
  refreshFolders: () => Promise<void>;
}

const FoldersContext = createContext<FoldersContextType | undefined>(undefined);

export function FoldersProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<FileTreeItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchFolders = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('owner_id', user.id)
        .eq('type', 'folder');

      if (error) throw error;

      const folderItems = (data || []).map((folder): DemoItem => ({
        id: folder.id,
        name: folder.name,
        format: '',
        type: 'folder',
        dateUploaded: folder.created_at,
        size: 0,
        parentId: folder.parent_id
      }));

      setFolders(buildTree(folderItems));
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  };

  const createFolder = async (folderName: string) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');

    try {
      const { error } = await supabase
        .from('items')
        .insert({
          name: folderName,
          type: 'folder',
          owner_id: user.id,
          parent_id: currentFolderId
        });

      if (error) throw error;
      
      await fetchFolders();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      await fetchFolders();
      return true;
    } catch (error) {
      throw error;
    }
  };

  const getFolderContents = async (folderId: string | null) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('No user found');
    
    try {
      let query = supabase
        .from('items')
        .select('*')
        .eq('owner_id', user.id)
        .order('name');

      if (folderId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', folderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map((item): DemoItem => ({
        id: item.id,
        name: item.name,
        format: item.format,
        type: item.type,
        dateUploaded: item.created_at,
        size: item.size || 0,
        parentId: item.parent_id ?? null
      }));
    } catch (error) {
      throw error;
    }
  };

  const value = {
    folders,
    currentFolderId,
    isLoading,
    error,
    setCurrentFolder: setCurrentFolderId,
    createFolder,
    deleteFolder,
    getFolderContents,
    refreshFolders: fetchFolders
  };

  return (
    <FoldersContext.Provider value={value}>
      {children}
    </FoldersContext.Provider>
  );
}

export function useFolders() {
  const context = useContext(FoldersContext);
  if (context === undefined) {
    throw new Error('useFolders must be used within a FoldersProvider');
  }
  return context;
}