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
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(username)) {
    return 'Username must start with a letter and can only contain letters, numbers, and underscores'
  }
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

export const generateGradientStyle = (id: string) => {
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  // Color ranges for masculine design
  const colorRanges = [
    { min: 200, max: 240 },  // Blues
    { min: 170, max: 190 },  // Teals
    { min: 270, max: 290 },  // Deep purples
    { min: 0, max: 15 },     // Deep reds
    { min: 145, max: 165 },  // Deep greens
  ];

  // Select two different ranges for more contrast
  const range1 = colorRanges[hash(id) % colorRanges.length];
  const range2 = colorRanges[hash(id + 'second') % colorRanges.length];
  
  const h1 = range1.min + (hash(id + '1') % (range1.max - range1.min));
  const h2 = range2.min + (hash(id + '2') % (range2.max - range2.min));

  const angle = hash(id + 'angle') % 360;

  // Adjusted lightness values: 40% → 45%, 25% → 35%
  const color1 = `hsl(${h1}, 90%, 45%)`;
  const color2 = `hsl(${h2}, 85%, 35%)`;

  return {
    background: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
    // Slightly increased brightness from 0.9 to 0.95
    filter: 'contrast(110%) brightness(0.95)',
    backgroundImage: `
      linear-gradient(${angle}deg, ${color1}, ${color2}),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
    `,
    backgroundBlendMode: 'soft-light'
  };
};
