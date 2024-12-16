import { supabase } from '../lib/supabase'
import { ProjectItem } from '../components/layout/types'
import { b2Service, mediaService } from './b2Service'

export const projectItemsService = {
  /**
   * Fetch items for a specific project and folder
   */
  async getItems(projectId: string, folderId: string | null): Promise<ProjectItem[]> {
    console.log("Getting items:", projectId, folderId)
    const query = supabase
      .from('project_items')
      .select(`
        *,
        owner:owner_id (
          username,
          avatar_path
        )
      `)
      .eq('project_id', projectId)

    if (folderId === null) {
      query.is('parent_folder_id', null)  // Root items
    } else if (folderId) {
      query.eq('parent_folder_id', folderId)  // Items in specific folder
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    const itemsWithUrls = await Promise.all(
      data.map(async (item) => ({
        ...item,
        url: item.file_path ? await b2Service.getPublicUrl(item.file_path) : null,
        owner: {
          username: item.owner.username,
          avatar_path: item.owner.avatar_path ? await mediaService.getAvatarUrl(item.owner.avatar_path) : null
        }
      }))
    )

    return itemsWithUrls.map(transformDatabaseItem)
  },


  async getParentFolders(folderId: string): Promise<ProjectItem[]> {
    const parents: ProjectItem[] = []
    let currentId = folderId
  
    while (currentId) {
      const { data, error } = await supabase
        .from('project_items')
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_path
          )
        `)
        .eq('id', currentId)
        .single()
  
      if (error || !data) break
  
      const itemWithUrls = {
        ...data,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }
  
      parents.unshift(transformDatabaseItem(itemWithUrls))
      currentId = data.parent_folder_id
    }
  
    return parents
  },
  

  /**
   * Create a new project item
   */
  async createItem(item: Omit<ProjectItem, 'id' | 'createdAt' | 'lastModified'>): Promise<ProjectItem> {
    console.log("Creating item:", item)
    const { data, error } = await supabase
      .from('project_items')
      .insert({
        name: item.name,
        type: item.type,
        description: item.description,
        is_starred: item.isStarred,
        file_format: item.fileFormat,
        size: item.size,
        duration: item.duration,
        owner_id: item.ownerId,
        tags: item.tags,
        project_id: item.projectId,
        parent_folder_id: item.parentFolderId
      })
      .select(`
        *,
        owner:owner_id (
          username,
          avatar_path
        )
      `)
      .single()

      console.log("Create item Data:", data)
    if (error) throw new Error(error.message)

      const itemWithUrls = {
        ...data,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }
  
      return transformDatabaseItem(itemWithUrls)
    },  

  async createItemWithFile(
    itemData: Omit<ProjectItem, 'id' | 'createdAt' | 'lastModified'>,
    file: File,
    onHashProgress?: (progress: number) => void,
    onUploadProgress?: (progress: number) => void
  ): Promise<ProjectItem> {
    try {
      // Upload to B2 first
      const fileType = file.type.startsWith('image/') ? 'image' : 'file'
      const { fileName, url } = await b2Service.uploadFile(
        file,
        itemData.ownerId,
        fileType,
        onHashProgress,
        onUploadProgress
      )

      // Create database entry with file path
      const { data, error } = await supabase
        .from('project_items')
        .insert({
          name: itemData.name,
          type: 'file',
          description: itemData.description,
          is_starred: itemData.isStarred,
          file_format: file.type,
          file_path: fileName,
          size: file.size,
          duration: itemData.duration,
          owner_id: itemData.ownerId,
          tags: itemData.tags,
          project_id: itemData.projectId,
          parent_folder_id: itemData.parentFolderId
        })
        .select(`
          *,
          owner:owner_id (
            username,
            avatar_path
          )
        `)
        .single()

      if (error) {
        // Cleanup uploaded file if database insert fails
        await b2Service.deleteFile(fileName)
        throw error
      }

      const itemWithUrls = {
        ...data,
        url,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }

      return transformDatabaseItem(itemWithUrls)
    } catch (error) {
      console.error('Error creating item with file:', error)
      throw new Error('Failed to create item with file')
    }
  },

  /**
   * Update an existing project item
   */
  async updateItem(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem> {
    const { data, error } = await supabase
      .from('project_items')
      .update({
        name: updates.name,
        description: updates.description,
        is_starred: updates.isStarred,
        file_format: updates.fileFormat,
        size: updates.size,
        duration: updates.duration,
        tags: updates.tags,
        last_modified: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        owner:owner_id (
          username,
          avatar_path
        )
      `)
      .single()

    if (error) throw new Error(error.message)
      
      const itemWithUrls = {
        ...data,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }
  
      return transformDatabaseItem(itemWithUrls)
    },

    /**
   * Delete item and associated file from B2
   */
    async deleteItem(id: string): Promise<void> {
      // Get file path before deletion
      const { data: item, error: fetchError } = await supabase
        .from('project_items')
        .select('file_path')
        .eq('id', id)
        .single()
  
      if (fetchError) throw new Error(fetchError.message)
  
      // Delete database entry
      const { error: deleteError } = await supabase
        .from('project_items')
        .delete()
        .eq('id', id)
  
      if (deleteError) throw new Error(deleteError.message)
  
      // Delete file from B2 if exists
      if (item?.file_path) {
        try {
          await b2Service.deleteFile(item.file_path)
        } catch (error) {
          console.error('Error deleting file from B2:', error)
          // Don't throw here as the database entry is already deleted
        }
      }
    },
  
  /**
   * Toggle the starred status of an item
   */
  async toggleStar(id: string, currentValue: boolean): Promise<ProjectItem> {
    const { data, error } = await supabase
      .from('project_items')
      .update({ is_starred: !currentValue })
      .eq('id', id)
      .select(`
        *,
        owner:owner_id (
          username,
          avatar_path
        )
      `)
      .single()

    if (error) throw new Error(error.message)

      const itemWithUrls = {
        ...data,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }
  
      return transformDatabaseItem(itemWithUrls)
    },

  
  /**
   * Move an item to a different folder
   */
  async moveItem(itemId: string, targetFolderId: string | null): Promise<ProjectItem> {
    const { data, error } = await supabase
      .from('project_items')
      .update({ 
        parent_folder_id: targetFolderId,
        last_modified: new Date().toISOString()
      })
      .eq('id', itemId)
      .select(`
        *,
        owner:owner_id (
          username,
          avatar_path
        )
      `)
      .single()

    if (error) throw new Error(error.message)

      const itemWithUrls = {
        ...data,
        url: data.file_path ? await b2Service.getPublicUrl(data.file_path) : null,
        owner: {
          username: data.owner.username,
          avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
        }
      }
  
      return transformDatabaseItem(itemWithUrls)
    },
  

    /**
   * Upload a file to B2 and create database entry
   */
    async uploadFile(
      file: File,
      projectId: string,
      userId: string,
      folderId?: string,
      onHashProgress?: (progress: number) => void,
      onUploadProgress?: (progress: number) => void
    ): Promise<ProjectItem> {
      try {
        // Upload to B2
        const fileType = file.type.startsWith('image/') ? 'image' : 'file'
        const { fileName, fileId, url } = await b2Service.uploadFile(
          file,
          userId,
          fileType,
          onHashProgress,
          onUploadProgress
        )
  
        // Create database entry
        const { data, error } = await supabase
          .from('project_items')
          .insert({
            name: file.name,
            type: 'file',
            file_path: fileName,
            file_format: file.type,
            size: file.size,
            project_id: projectId,
            parent_folder_id: folderId,
            description: '',
            is_starred: false,
            owner_id: userId,
          })
          .select(`
            *,
            owner:owner_id (
              username,
              avatar_path
            )
          `)
          .single()
  
        if (error) {
          // Cleanup B2 file if database insert fails
          await b2Service.deleteFile(fileName)
          throw error
        }
        
        const itemWithUrls = {
          ...data,
          url,
          owner: {
            username: data.owner.username,
            avatar_path: data.owner.avatar_path ? await mediaService.getAvatarUrl(data.owner.avatar_path) : null
          }
        }
  
        return transformDatabaseItem(itemWithUrls)
      } catch (error) {
        console.error('File upload error:', error)
        throw new Error('Failed to upload file')
      }
    },

    /**
   * Download a file from B2
   */
  async downloadFile(filePath: string): Promise<{ url: string, filename: string }> {
    try {
      const url = await b2Service.getPublicUrl(filePath)
      const filename = filePath.split('/').pop() || 'download'
      return { url, filename }
    } catch (error) {
      console.error('Download error:', error)
      throw new Error('Failed to generate download link')
    }
  }
}

/**
 * Transform database item to frontend model
 */
function transformDatabaseItem(item: any): ProjectItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    isStarred: item.is_starred,
    description: item.description,
    fileFormat: item.file_format,
    size: item.size,
    duration: item.duration,
    lastModified: item.last_modified,
    createdAt: item.created_at,
    ownerId: item.owner_id,
    owner: {
      username: item.owner.username,
      avatarPath: item.owner.avatar_path
    },
    tags: item.tags,
    parentFolderId: item.parent_folder_id,
    filePath: item.file_path,
    projectId: item.project_id
  }
}

/**
 * Error handling utility
 */
class ProjectItemError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'ProjectItemError'
  }
}

/**
 * Utility functions for file handling
 */
export const fileUtils = {
  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Get file type icon
   */
  getFileTypeIcon(fileFormat: string): string {
    // Implement your icon logic here
    if (fileFormat.startsWith('image/')) return 'image-icon'
    if (fileFormat.startsWith('audio/')) return 'audio-icon'
    if (fileFormat.startsWith('video/')) return 'video-icon'
    return 'file-icon'
  },

  /**
   * Validate file before upload
   */
  validateFile(file: File, maxSize: number = 100 * 1024 * 1024): string | null {
    if (file.size > maxSize) {
      return `File size exceeds ${this.formatFileSize(maxSize)}`
    }
    return null
  }
}