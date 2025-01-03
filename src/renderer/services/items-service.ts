import { supabase } from '@renderer/lib/supabase'
import { DemoItem, ItemType } from '@renderer/types/items'
import { useUserStore } from '@renderer/stores/user-store'
import { UserProfile } from '@renderer/types/users'
import { toCamelCase } from '@renderer/lib/utils'
import { b2Service } from '@renderer/services/b2-service'
import { shareNewItem } from './share-service'

// Helper function to get current user ID
const getCurrentUserId = () => {
  const user = useUserStore.getState().user
  if (!user) throw new Error('User not authenticated')
  return user.id
}

// Helper function to get sharing information for an item
async function getItemSharing(itemId: string, itemType: 'file' | 'project'): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('shared_items')
    .select(`
      shared_with:shared_with_id(*)
    `)
    .eq(itemType === 'file' ? 'file_id' : 'project_id', itemId);

  if (error) throw error;
  return data?.map(share => toCamelCase(share.shared_with)) || [];
}

// Generic function to fetch items with sharing info
async function getProjectsWithSharing(userId: string): Promise<DemoItem[]> {
  const ownedQuery = supabase
    .from('projects')
    .select(`
      *,
      owner:owner_id(*)
    `)
    .eq('owner_id', userId);

  const sharedQuery = supabase
    .from('projects')
    .select(`
      *,
      owner:owner_id(*),
      my_share:shared_items!inner(shared_with:shared_with_id(*))
    `)
    .eq('shared_items.shared_with_id', userId)
    .neq('owner_id', userId);

  const [{ data: owned = [], error: ownedError }, { data: shared = [], error: sharedError }] = 
    await Promise.all([ownedQuery, sharedQuery]);

  if (ownedError) throw ownedError;
  if (sharedError) throw sharedError;

  const items = [...(owned || []), ...(shared || [])];
  return Promise.all(items.map(async (item) => {
    const sharedWith = await getItemSharing(item.id, 'project');
    return {
      ...toCamelCase(item),
      id: item.id,
      owner: toCamelCase(item.owner),
      sharedWith,
      type: ItemType.PROJECT,
      createdAt: new Date(item.created_at),
      lastModified: new Date(item.last_modified),
      lastOpened: new Date(item.last_opened),
      projectIds: [],
      collectionIds: [],
      parentFolderIds: [],
    };
  }));
}

async function getFilesWithSharing(
  userId: string, 
  filters?: {
    parentFolderId?: string | null,
    projectId?: string | null,
    collectionId?: string | null,
  }
): Promise<DemoItem[]> {
  console.log('📂 getFilesWithSharing called with filters:', filters);

  // First, get all files (both owned and shared)
  const ownedQuery = supabase
    .from('files')
    .select(`
      *,
      owner:owner_id(*),
      file_projects!file_projects_file_id_fkey(project_id),
      file_collections!file_collections_file_id_fkey(collection_id),
      file_folders!file_folders_file_id_fkey(folder_id)
    `)
    .eq('owner_id', userId);

  const sharedQuery = supabase
    .from('files')
    .select(`
      *,
      owner:owner_id(*),
      my_share:shared_items!inner(shared_with:shared_with_id(*)),
      file_projects!file_projects_file_id_fkey(project_id),
      file_collections!file_collections_file_id_fkey(collection_id),
      file_folders!file_folders_file_id_fkey(folder_id)
    `)
    .eq('shared_items.shared_with_id', userId)
    .neq('owner_id', userId);

  const [{ data: owned = [], error: ownedError }, { data: shared = [], error: sharedError }] = 
    await Promise.all([ownedQuery, sharedQuery]);

  if (ownedError) throw ownedError;
  if (sharedError) throw sharedError;

  // Combine all items
  let items = [...(owned || []), ...(shared || [])];

  // Apply filters after fetching
  if (filters) {
    if (filters.parentFolderId !== undefined) {
      items = items.filter(item => 
        item.file_folders?.some(ff => ff.folder_id === filters.parentFolderId)
      );
    }
    
    if (filters.projectId) {
      items = items.filter(item => 
        item.file_projects?.some(fp => fp.project_id === filters.projectId)
      );
    }
    
    if (filters.collectionId) {
      items = items.filter(item => 
        item.file_collections?.some(fc => fc.collection_id === filters.collectionId)
      );
    }
  }

  // Process and return the filtered items
  return Promise.all(items.map(async (item) => {
    const sharedWith = await getItemSharing(item.id, 'file');
    return {
      ...toCamelCase(item),
      id: item.id,
      owner: toCamelCase(item.owner),
      sharedWith,
      type: item.type as ItemType,
      createdAt: new Date(item.created_at),
      lastModified: new Date(item.last_modified),
      lastOpened: new Date(item.last_opened),
      projectIds: (item.file_projects || []).map(fp => fp.project_id),
      collectionIds: (item.file_collections || []).map(fc => fc.collection_id),
      parentFolderIds: (item.file_folders || []).map(ff => ff.folder_id),
    };
  }));
}

async function getItemsWithSharing(
  tableName: 'files' | 'projects',
  userId: string,
  filters?: {
    parentFolderId?: string | null,
    projectId?: string | null,
    collectionId?: string | null,
  }
): Promise<DemoItem[]> {
  return tableName === 'projects' 
    ? getProjectsWithSharing(userId)
    : getFilesWithSharing(userId, filters);
}

export async function getFilesAndFolders(
  parentFolderId?: string | null,
  projectId?: string | null,
  collectionId?: string | null
): Promise<DemoItem[]> {
  const userId = getCurrentUserId();
  return getItemsWithSharing('files', userId, { parentFolderId, projectId, collectionId });
}

export async function getProjects(): Promise<DemoItem[]> {
  const userId = getCurrentUserId();
  return getItemsWithSharing('projects', userId);
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

// Helper functions for managing relationships
async function addToProjects(fileId: string, projectIds: string[]) {
  if (!projectIds.length) return;
  
  const { error } = await supabase
    .from('file_projects')
    .insert(
      projectIds.map(projectId => ({
        file_id: fileId,
        project_id: projectId
      }))
    );
  
  if (error) throw error;
}

async function addToCollections(fileId: string, collectionIds: string[]) {
  if (!collectionIds.length) return;
  
  const { error } = await supabase
    .from('file_collections')
    .insert(
      collectionIds.map(collectionId => ({
        file_id: fileId,
        collection_id: collectionId
      }))
    );
  
  if (error) throw error;
}

async function addToFolders(fileId: string, folderIds: string[]) {
  if (!folderIds.length) return;
  
  const { error } = await supabase
    .from('file_folders')
    .insert(
      folderIds.map(folderId => ({
        file_id: fileId,
        folder_id: folderId
      }))
    );
  
  if (error) throw error;
}

export async function addFileOrFolder(
  item: Omit<DemoItem, 'id'>, 
  sharedWith?: UserProfile[],
  fileContent?: ArrayBuffer
): Promise<DemoItem> {
  const currentUserId = getCurrentUserId();


  try {
    // Create the base file/folder record
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: item.name,
        type: item.type,
        owner_id: currentUserId,
        description: item.description,
        icon_url: item.icon,
        is_starred: item.isStarred,
        tags: item.tags,
        format: item.format,
        size: fileContent ? fileContent.byteLength : item.size,
        duration: item.duration,
        file_path: item.filePath,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert failed:', error);
      throw error;
    }

    console.log('✅ Database record created:', { id: data.id });

    // Add relationships in parallel
    const relationshipPromises = [
      addToProjects(data.id, item.projectIds),
      addToCollections(data.id, item.collectionIds),
      addToFolders(data.id, item.parentFolderIds)
    ];

    // Handle B2 upload if it's a file with content
    if (item.type === ItemType.FILE && fileContent) {
      try {
        console.log('📤 Starting B2 upload process');
        const b2FileId = await b2Service.storeFile(
          currentUserId,
          data.id,
          item.name,
          fileContent
        );
        console.log('✅ B2 upload complete:', { b2FileId });

        relationshipPromises.push(
          Promise.resolve(
            supabase
              .from('files')
              .update({ file_path: b2FileId })
              .eq('id', data.id)
              .then(async ({ error }) => {
                if (error) {
                  console.error('❌ Failed to update storage_file_id:', error);
                  await b2Service.removeFile(b2FileId, item.name);
                  throw error;
                }
              })
          )
        );
      } catch (error: any) {
        console.error('❌ B2 upload process failed:', {
          error,
          stack: error.stack
        });
        // Clean up the file record
        await supabase.from('files').delete().eq('id', data.id);
        throw error;
      }
    }

    // Handle sharing if needed
    if (sharedWith?.length) {
      relationshipPromises.push(
        shareNewItem(data.id, 'file', sharedWith)
      );
    }

    // Wait for all operations to complete
    await Promise.all(relationshipPromises);

    return {
      ...toCamelCase(data),
      id: data.id,
      owner: item.owner,
      sharedWith: sharedWith || [],
      type: item.type,
      projectIds: item.projectIds,
      collectionIds: item.collectionIds,
      parentFolderIds: item.parentFolderIds,
      createdAt: new Date(data.created_at),
      lastModified: new Date(data.last_modified),
      lastOpened: new Date(data.last_opened),
    };
  } catch (error: any) {
    console.error('❌ addFileOrFolder failed:', {
      error,
      stack: error.stack,
      item: {
        name: item.name,
        type: item.type
      }
    });
    throw error;
  }
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

export async function deleteItem(id: string) {
  const userId = getCurrentUserId()
  
  try {
    // First check if this is a folder
    const { data: folder } = await supabase
      .from('files')
      .select('type')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    console.log('📂 Folder data:', folder);

    if (folder?.type === 'folder') {
      console.log('📂 Deleting folder:', id);
      // Get all files and folders in this folder recursively
      const itemsToDelete = await getItemsToDeleteRecursively(id);

      console.log('📂 Items to delete:', itemsToDelete);
      
      if (itemsToDelete.length > 0) {
        // Delete all items in batches to avoid timeout
        const batchSize = 50;
        for (let i = 0; i < itemsToDelete.length; i += batchSize) {
          const batch = itemsToDelete.slice(i, i + batchSize);
          const { error: deleteError } = await supabase
            .from('files')
            .delete()
            .in('id', batch)
            .eq('owner_id', userId);
            
          if (deleteError) throw deleteError;
        }
      }
    }

    // Finally delete the original item itself
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
    ]);

    console.log('✅ Item deleted:', id);

  } catch (error) {
    console.error('Failed to delete item:', error);
    throw error;
  }
}

async function getItemsToDeleteRecursively(folderId: string): Promise<string[]> {
  const itemsToDelete: string[] = [];
  
  type FileResponse = {
    file: {
      id: string;
      type: string;
    }
  }
  
  // Get immediate children with proper typing
  const { data: children } = await supabase
    .from('file_folders')
    .select(`
      file:file_id (
        id,
        type
      )
    `)
    .eq('folder_id', folderId) as { data: FileResponse[] | null };

  if (!children) return itemsToDelete;

  // Process each child
  for (const child of children) {
    if (!child.file) continue;
    
    itemsToDelete.push(child.file.id);
    
    if (child.file.type === 'folder') {
      const nestedItems = await getItemsToDeleteRecursively(child.file.id);
      itemsToDelete.push(...nestedItems);
    }
  }

  return itemsToDelete;
}

export async function updateItem(item: DemoItem, originalItem: DemoItem) {
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

  // Handle basic item update
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

  // Handle sharing changes
  const originalSharedUsers = originalItem.sharedWith || [];
  const newSharedUsers = item.sharedWith || [];

  // Find users to add and remove
  const usersToAdd = newSharedUsers.filter(
    newUser => !originalSharedUsers.some(origUser => origUser.id === newUser.id)
  );
  const usersToRemove = originalSharedUsers.filter(
    origUser => !newSharedUsers.some(newUser => newUser.id === origUser.id)
  );

  // Create new share records if needed
  if (usersToAdd.length > 0) {
    const shareRecords = usersToAdd.map(user => ({
      file_id: item.type === ItemType.PROJECT ? null : item.id,
      project_id: item.type === ItemType.PROJECT ? item.id : null,
      shared_with_id: user.id,
      shared_by_id: userId,
    }));

    const { error: shareError } = await supabase
      .from('shared_items')
      .upsert(shareRecords, {
        onConflict: item.type === ItemType.PROJECT ? 'project_id,shared_with_id' : 'file_id,shared_with_id',
        ignoreDuplicates: true
      });

    if (shareError) throw shareError;
  }

  // Remove share records if needed
  if (usersToRemove.length > 0) {
    const { error: removeError } = await supabase
      .from('shared_items')
      .delete()
      .eq(item.type === ItemType.PROJECT ? 'project_id' : 'file_id', item.id)
      .in('shared_with_id', usersToRemove.map(user => user.id));

    if (removeError) throw removeError;
  }
}

export async function toggleItemStar(id: string, isStarred: boolean) {
  const userId = getCurrentUserId()

  console.log('Toggling star for item:', id, isStarred)
  
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

export async function shareItems(
  items: DemoItem[], 
  users: UserProfile[]
) {
  const currentUserId = getCurrentUserId();
  
  // Split items into files and projects
  const fileItems = items.filter(item => item.type === ItemType.FILE || item.type === ItemType.FOLDER);
  const projectItems = items.filter(item => item.type === ItemType.PROJECT);

  // Create share records for files
  if (fileItems.length > 0) {
    const fileShares = fileItems.flatMap(item =>
      users.map(user => ({
        file_id: item.id,
        project_id: null,
        shared_with_id: user.id,
        shared_by_id: currentUserId
      }))
    );

    const { error: fileError } = await supabase
      .from('shared_items')
      .upsert(fileShares, {
        onConflict: 'file_id,shared_with_id',
        ignoreDuplicates: true
      });

    if (fileError) throw fileError;
  }

  // Create share records for projects
  if (projectItems.length > 0) {
    const projectShares = projectItems.flatMap(item =>
      users.map(user => ({
        file_id: null,
        project_id: item.id,
        shared_with_id: user.id,
        shared_by_id: currentUserId
      }))
    );

    const { error: projectError } = await supabase
      .from('shared_items')
      .upsert(projectShares, {
        onConflict: 'project_id,shared_with_id',
        ignoreDuplicates: true
      });

    if (projectError) throw projectError;
  }
} 