import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { useUserStore } from '@renderer/stores/user-store'
import { UserProfile } from '@renderer/types/users'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

export async function getFilesAndFolders(
  parentFolderId?: string | null,
  projectId?: string | null,
  collectionId?: string | null
): Promise<DemoItem[]> {
  const userId = getCurrentUserId()
  
  let query = supabase
    .from('files')
    .select(`
      *,
      owner:owner_id(*),
      shared_with:shared_items(
        shared_with:shared_with_id(*)
      )
    `)
    .eq('owner_id', userId)
    .filter('type', 'in', '("file","folder")')

  if (parentFolderId) {
    query = query.eq('parent_folder_id', parentFolderId)
  } else {
    query = query.is('parent_folder_id', null)
  }

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (collectionId) {
    query = query.eq('collection_id', collectionId)
  }

  const { data, error } = await query

  if (error) throw error

  return data.map(item => ({
    ...item,
    owner: item.owner,
    sharedWith: item.shared_with?.map(share => share.shared_with),
    type: item.type as ItemType,
    createdAt: new Date(item.created_at),
    lastModified: new Date(item.last_modified),
    lastOpened: new Date(item.last_opened),
  }))
}

export async function getProjects(): Promise<DemoItem[]> {
  const userId = getCurrentUserId()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      owner:owner_id(*),
      shared_with:shared_items(
        shared_with:shared_with_id(*)
      )
    `)
    .eq('owner_id', userId)

  if (error) throw error

  return data.map(item => ({
    ...item,
    owner: item.owner,
    sharedWith: item.shared_with?.map(share => share.shared_with),
    type: ItemType.PROJECT,
    createdAt: new Date(item.created_at),
    lastModified: new Date(item.last_modified),
    lastOpened: new Date(item.last_opened),
  }))
}

export async function addFileOrFolder(item: Omit<DemoItem, 'id'>) {
  const { error } = await supabase
    .from('files')
    .insert({
      project_id: item.projectId,
      collection_id: item.collectionId,
      parent_folder_id: item.parentFolderId,
      owner_id: getCurrentUserId(),
      type: item.type,
      name: item.name,
      description: item.description,
      icon_url: item.icon,
      is_starred: item.isStarred,
      tags: item.tags,
      format: item.format,
      size: item.size,
      duration: item.duration,
      file_path: item.filePath,
    })

    console.log("error", error);

  if (error) throw error
}

export async function addProject(item: Omit<DemoItem, 'id'>) {
  const { error } = await supabase
    .from('projects')
    .insert({
      owner_id: getCurrentUserId(),
      name: item.name,
      description: item.description,
      icon_url: item.icon,
      is_starred: item.isStarred,
    })

  if (error) throw error
}

export async function removeItem(id: string) {
  const userId = getCurrentUserId()
  
  // Try to delete from both tables - one will succeed based on where the item exists
  await Promise.all([
    supabase
      .from('files')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId),
    supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId)
  ])
}

export async function updateItem(item: DemoItem) {
  const userId = getCurrentUserId()
  
  if (item.type === ItemType.PROJECT) {
    const { error } = await supabase
      .from('projects')
      .update({
        name: item.name,
        description: item.description,
        icon_url: item.icon,
        is_starred: item.isStarred,
        last_modified: new Date().toISOString(),
      })
      .eq('id', item.id)
      .eq('owner_id', userId)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('files')
      .update({
        name: item.name,
        description: item.description,
        icon_url: item.icon,
        is_starred: item.isStarred,
        tags: item.tags,
        format: item.format,
        size: item.size,
        duration: item.duration,
        file_path: item.filePath,
        last_modified: new Date().toISOString(),
      })
      .eq('id', item.id)
      .eq('owner_id', userId)

    if (error) throw error
  }
}

export async function toggleItemStar(id: string, isStarred: boolean) {
  const userId = getCurrentUserId()
  
  // Try to update in both tables - one will succeed based on where the item exists
  await Promise.all([
    supabase
      .from('files')
      .update({ is_starred: isStarred })
      .eq('id', id)
      .eq('owner_id', userId),
    supabase
      .from('projects')
      .update({ is_starred: isStarred })
      .eq('id', id)
      .eq('owner_id', userId)
  ])
}

export async function getFolder(folderId: string): Promise<DemoItem | null> {
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      owner:owner_id(*),
      shared_with:shared_items(
        shared_with:shared_with_id(*)
      )
    `)
    .eq('id', folderId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    owner: data.owner,
    sharedWith: data.shared_with?.map(share => share.shared_with),
    type: data.type as ItemType,
    createdAt: new Date(data.created_at),
    lastModified: new Date(data.last_modified),
    lastOpened: new Date(data.last_opened),
  };
}

export async function createCollection(projectId: string, name: string) {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      project_id: projectId,
      name: name,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getProject(projectId: string): Promise<DemoItem | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      owner:owner_id(*),
      shared_with:shared_items(
        shared_with:shared_with_id(*)
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    owner: data.owner,
    sharedWith: data.shared_with?.map(share => share.shared_with),
    type: ItemType.PROJECT,
    createdAt: new Date(data.created_at),
    lastModified: new Date(data.last_modified),
    lastOpened: new Date(data.last_opened),
  };
}

export async function getCollections(projectId: string | undefined): Promise<DemoItem[]> {
  if (!projectId) return [];
  
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(collection => ({
    id: collection.id,
    name: collection.name,
    createdAt: new Date(collection.created_at),
    projectId: collection.project_id,
    // Add other necessary fields with default values
    type: ItemType.FOLDER,
    lastModified: new Date(collection.created_at),
    lastOpened: new Date(collection.created_at),
    isStarred: false,
    description: null,
    icon: null,
    tags: null,
    format: null,
    size: null,
    duration: null,
    filePath: null,
    parentFolderId: null,
    collectionId: null,
    owner: null,
    sharedWith: [],
  }));
}

export async function getCollection(collectionId: string): Promise<DemoItem | null> {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      project:project_id(*)
    `)
    .eq('id', collectionId)
    .single();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    createdAt: new Date(data.created_at),
    projectId: data.project_id,
    type: ItemType.FOLDER,
    lastModified: new Date(data.created_at),
    lastOpened: new Date(data.created_at),
    isStarred: false,
    description: null,
    icon: null,
    tags: null,
    format: null,
    size: null,
    duration: null,
    filePath: null,
    parentFolderId: null,
    collectionId: null,
    owner: null,
    sharedWith: [],
  };
}

export async function removeCollection(collectionId: string) {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId);

  if (error) throw error;
}

export async function searchFriends(searchTerm?: string): Promise<UserProfile[]> {
  const userId = getCurrentUserId();
  
  let query = supabase
    .from('users')
    .select('*')
    .neq('id', userId) // Exclude current user
    .limit(5);

  if (searchTerm) {
    const cleanSearchTerm = searchTerm.replace('@', '').toLowerCase();
    query = query.ilike('username', `%${cleanSearchTerm}%`)
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(user => ({
    id: user.id,
    username: user.username,
    name: user.name,
    avatar: user.avatar_url,
    email: user.email,
    description: user.description
  }));
} 