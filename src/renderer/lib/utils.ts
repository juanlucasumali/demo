import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type FileType = 'image' | 'audio'

interface StoragePathOptions {
  userId: string
  fileName: string
  fileType: FileType
  timestamp?: boolean
}

export function generateStoragePath({
  userId,
  fileName,
  fileType,
  timestamp = true
}: StoragePathOptions): string {
  // Get file extension
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  // Generate unique identifier
  const uniqueId = timestamp 
    ? `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    : Math.random().toString(36).substring(2, 15)

  // Sanitize original filename (remove special characters, spaces)
  const sanitizedName = fileName
    .split('.')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 32) // limit length

  // Build path based on file type
  switch (fileType) {
    case 'image':
      return `users/${userId}/image/${sanitizedName}-${uniqueId}.${extension}`
    case 'audio':
      return `users/${userId}/audio/${sanitizedName}-${uniqueId}.${extension}`
    default:
      throw new Error(`Unsupported file type: ${fileType}`)
  }
}

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}