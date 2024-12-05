import useSWR from 'swr';
import { supabase } from '../lib/supabaseClient';
import { FileTreeItem } from '../types/files';
import { buildTree } from '@renderer/utils/buildTree';

interface UseFoldersReturn {
  folders: FileTreeItem[];
  isLoading: boolean;
  error: any;
  createLocalFolderStructure: (basePath: string) => Promise<void>;
}

const fetcher = async () => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('No user found');

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'folder');

  if (error) throw error;

  const folderTree = buildTree(data);
  return folderTree;
};

export function useFolders(): UseFoldersReturn {
  const { data: folders, error, isLoading } = useSWR('folders', fetcher);

  const createLocalFolderStructure = async (basePath: string) => {
    if (!folders) return;

    if (!window.electron?.createFolderStructure) {
      throw new Error('createFolderStructure is not available');
    }

    const result = await window.electron.createFolderStructure(basePath, folders);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create folder structure');
    }
  };

  return {
    folders: folders || [],
    isLoading,
    error,
    createLocalFolderStructure
  };
}
