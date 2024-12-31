import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { useUserStore } from '@renderer/stores/user-store'
import { UserProfile } from '@renderer/types/users'
import { toCamelCase } from '@renderer/lib/utils'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

// Helper function to build base select query
const buildBaseSelect = (tableName: 'files' | 'projects') => {
  return supabase
    .from(tableName)
    .select(`
      *,
      owner:owner_id(*),
      shared_with:shared_items(
        shared_with:shared_with_id(*)
      )
    `)
}

// Helper function to apply common filters
const applyCommonFilters = (
  query: any, 
  {
    parentFolderId,
    projectId,
    collectionId,
    fileTypes
  }: {
    parentFolderId?: string | null,
    projectId?: string | null,
    collectionId?: string | null,
    fileTypes?: string[]
  }
) => {
  if (parentFolderId !== undefined) {
    query = parentFolderId ? 
      query.eq('parent_folder_id', parentFolderId) :
      query.is('parent_folder_id', null)
  }

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (collectionId) {
    query = query.eq('collection_id', collectionId)
  }

  if (fileTypes) {
    query = query.filter('type', 'in', `(${fileTypes.map(t => `"${t}"`).join(',')})`)
  }

  return query
}

// Helper function to fetch both owned and shared items
async function fetchItems(
  tableName: 'files' | 'projects',
  userId: string,
  filters: {
    parentFolderId?: string | null,
    projectId?: string | null,
    collectionId?: string | null,
    fileTypes?: string[]
  }
) {
  // Get owned items
  const ownedQuery = buildBaseSelect(tableName)
    .eq('owner_id', userId)
  
  // Get shared items
  const sharedQuery = buildBaseSelect(tableName)
    .eq('shared_items.shared_with_id', userId)
    .neq('owner_id', userId)
    .select('*, owner:owner_id(*), shared_with:shared_items(shared_with:shared_with_id(*)), my_share:shared_items!inner(shared_with:shared_with_id(*))')

  // Apply filters to both queries
  const [ownedFiltered, sharedFiltered] = [ownedQuery, sharedQuery].map(q => 
    applyCommonFilters(q, filters)
  )

  const [{ data: owned = [], error: ownedError }, { data: shared = [], error: sharedError }] = 
    await Promise.all([ownedFiltered, sharedFiltered])

  if (ownedError) throw ownedError
  if (sharedError) throw sharedError

  return [...owned, ...shared]
}

export async function getFilesAndFolders(
  parentFolderId?: string | null,
  projectId?: string | null,
  collectionId?: string | null
): Promise<DemoItem[]> {
  const userId = getCurrentUserId()
  
  const items = await fetchItems('files', userId, {
    parentFolderId,
    projectId,
    collectionId,
    fileTypes: ['file', 'folder']
  })

  return items.map(formatItemResponse)
}

export async function getProjects(): Promise<DemoItem[]> {
  const userId = getCurrentUserId()
  
  const projects = await fetchItems('projects', userId, {})
  
  return projects.map(formatItemResponse)
}

// Helper to format response consistently
function formatItemResponse(item: any): DemoItem {
  const camelCaseItem = toCamelCase(item)
  return {
    ...camelCaseItem,
    owner: toCamelCase(item.owner),
    sharedWith: item.shared_with?.map(share => toCamelCase(share.shared_with)) || [],
    type: item.type as ItemType,
    createdAt: new Date(item.created_at),
    lastModified: new Date(item.last_modified),
    lastOpened: new Date(item.last_opened),
  }
}

interface ShareRecord {
  file_id: string | null;
  project_id: string | null;
  shared_with_id: string;
  shared_by_id: string;
}

async function createShareRecords(
  itemId: string,
  itemType: 'file' | 'project',
  sharedWith: UserProfile[],
  sharedById: string
) {
  if (!sharedWith || sharedWith.length === 0) return;

  const shareRecords: ShareRecord[] = sharedWith.map(user => ({
    file_id: itemType === 'file' ? itemId : null,
    project_id: itemType === 'project' ? itemId : null,
    shared_with_id: user.id,
    shared_by_id: sharedById,
  }));

  const { error: shareError } = await supabase
    .from('shared_items')
    .upsert(shareRecords, {
      onConflict: `${itemType}_id,shared_with_id`,
      ignoreDuplicates: true
    });

  if (shareError) throw shareError;
}

export async function addFileOrFolder(
  item: Omit<DemoItem, 'id'>, 
  sharedWith?: UserProfile[]
): Promise<DemoItem> {
  const currentUserId = getCurrentUserId();

  // Start a Supabase transaction
  const { data, error } = await supabase
    .from('files')
    .insert({
      name: item.name,
      type: item.type,
      parent_folder_id: item.parentFolderId,
      project_id: item.projectId,
      collection_id: item.collectionId,
      owner_id: currentUserId,
      description: item.description,
      icon_url: item.icon,
      is_starred: item.isStarred,
      tags: item.tags,
      format: item.format,
      size: item.size,
      duration: item.duration,
      file_path: item.filePath,
    })
    .select()
    .single();

  if (error) throw error;

  // If we have users to share with, create the share records
  if (sharedWith && sharedWith.length > 0) {
    await createShareRecords(data.id, 'file', sharedWith || [], currentUserId);
  }

  return {
    ...toCamelCase(data),
    id: data.id,
    owner: item.owner,
    sharedWith: sharedWith || [],
    type: item.type,
    createdAt: new Date(data.created_at),
    lastModified: new Date(data.last_modified),
    lastOpened: new Date(data.last_opened),
  };
}

export async function addProject(item: Omit<DemoItem, 'id'>, sharedWith?: UserProfile[]) {
  const currentUserId = getCurrentUserId();

  // Insert the project
  const { data, error } = await supabase
    .from('projects')
    .insert({
      owner_id: currentUserId,
      name: item.name,
      description: item.description,
      icon_url: item.icon,
      is_starred: item.isStarred,
    })
    .select()
    .single();

  if (error) throw error;

  // If we have users to share with, create the share records
  if (sharedWith && sharedWith.length > 0) {
    await createShareRecords(data.id, 'project', sharedWith || [], currentUserId);
  }

  return {
    ...toCamelCase(data),
    id: data.id,
    owner: item.owner,
    sharedWith: sharedWith || [],
    type: ItemType.PROJECT,
    createdAt: new Date(data.created_at),
    lastModified: new Date(data.last_modified),
    lastOpened: new Date(data.last_opened),
  };
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
  
  const dbItem = {
    name: item.name,
    description: item.description,
    icon_url: item.icon,
    is_starred: item.isStarred,
    last_modified: new Date().toISOString(),
    tags: item.tags,
    format: item.format,
    size: item.size,
    duration: item.duration,
    file_path: item.filePath,
  }

  if (item.type === ItemType.PROJECT) {
    const { error } = await supabase
      .from('projects')
      .update(dbItem)
      .eq('id', item.id)
      .eq('owner_id', userId)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('files')
      .update(dbItem)
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
    ...toCamelCase(data),
    owner: toCamelCase(data.owner),
    sharedWith: data.shared_with?.map(share => toCamelCase(share.shared_with)) || [],
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
  return toCamelCase(data);
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
    ...toCamelCase(data),
    owner: toCamelCase(data.owner),
    sharedWith: data.shared_with?.map(share => toCamelCase(share.shared_with)) || [],
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
    ...toCamelCase(collection),
    type: ItemType.FOLDER,
    createdAt: new Date(collection.created_at),
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
    ...toCamelCase(data),
    type: ItemType.FOLDER,
    createdAt: new Date(data.created_at),
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

  return data
} 