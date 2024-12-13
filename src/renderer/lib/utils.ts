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

export const validateUsername = (username: string) => {
  if (!username) return 'Username is required'
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 20) return 'Username must be less than 20 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
  return ''
}

export const validateDisplayName = (displayName: string): string => {
  // Required check
  if (!displayName) return 'Display name is required'

  // Minimum length check (typically 2-3 characters)
  if (displayName.length < 3) {
    return 'Display name must be at least 3 characters long'
  }
  
  // Maximum length check (commonly between 30-50 characters)
  if (displayName.length > 50) {
    return 'Display name must be less than 50 characters'
  }

  // Check for valid characters (allowing letters, numbers, spaces, and some special characters)
  const validCharactersRegex = /^[a-zA-Z0-9\s\-_.]+$/
  if (!validCharactersRegex.test(displayName)) {
    return 'Display name can only contain letters, numbers, spaces, and basic punctuation'
  }

  // Unicode-aware letter check for first character
  if (!/^[\p{L}]/u.test(displayName)) {
    return 'Display name must start with a letter'
  }

  return ''
}

export const debug = {
  log: (component: string, data: any) => {
    console.log(`[${component}]`, data)
  }
}