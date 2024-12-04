import { FileItem } from "@renderer/types/files";

export const isValidYoutubeUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return pattern.test(url)
}

export const sanitizeFileName = (fileName: string): string => {
  // First, handle the extension separately
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : '';
  const nameWithoutExt = fileName.slice(0, fileName.length - ext.length);

  // Replace all special characters, including parentheses, with underscores
  const sanitized = nameWithoutExt
    .replace(/[\[\]#%&{}\\<>*?/$!'":@+`|=()]/g, '_') // Added () to the list
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple consecutive underscores with a single one
    .trim();

  return sanitized + ext;
};
  
export const getNextFileName = (baseName: string, existingFiles: FileItem[]): string => {
  const ext = baseName.includes('.') ? '.' + baseName.split('.').pop() : '';
  const nameWithoutExt = baseName.replace(ext, '');
  
  // Updated regex to handle existing numbers in parentheses
  const pattern = /(.*?)(?:\s*\((\d+)\))?$/;
  const match = nameWithoutExt.match(pattern);
  if (!match) return baseName;

  const [, originalName] = match;
  let highestNumber = 0;

  // Check existing files with similar names
  existingFiles.forEach(file => {
    const existingNameWithoutExt = file.name.replace(ext, '');
    const existingMatch = existingNameWithoutExt.match(pattern);
    
    if (existingMatch && existingMatch[1].trim() === originalName.trim()) {
      const num = existingMatch[2] ? parseInt(existingMatch[2]) : 0;
      highestNumber = Math.max(highestNumber, num);
    }
  });

  // If the file exists (either exact match or with number), increment the highest number
  if (existingFiles.some(f => f.name === baseName) || highestNumber > 0) {
    return `${originalName.trim()} (${highestNumber + 1})${ext}`;
  }

  return baseName;
};

export const getDisplayFormat = (mimeType: any): string => {

  // Handle null or undefined
  if (!mimeType) {
    console.log('Warning: mimeType is null or undefined');
    return 'UNKNOWN';
  }

  // Handle common audio MIME types
  const mimeTypeMap: { [key: string]: string } = {
    'audio/mpeg': 'MP3',
    'audio/mp3': 'MP3',
    'audio/wav': 'WAV',
    'audio/x-wav': 'WAV',
    'audio/m4a': 'M4A',
    'audio/x-m4a': 'M4A',
    'audio/aac': 'AAC',
    'audio/x-aac': 'AAC',
    'audio/ogg': 'OGG',
    'audio/x-ogg': 'OGG',
    'audio/flac': 'FLAC',
    'audio/x-flac': 'FLAC',
    'audio/alac': 'ALAC',
    'audio/x-alac': 'ALAC',
    'audio/aiff': 'AIFF',
    'audio/x-aiff': 'AIFF',
  };

  // If found in map, return mapped value
  if (mimeTypeMap[mimeType]) {
    return mimeTypeMap[mimeType];
  }

  // Clean up the MIME type
  const cleaned = mimeType
    .replace('audio/', '')
    .replace('x-', '')
    .toUpperCase();

  console.log('Cleaned value:', cleaned); // Debug: show cleaned value

  return cleaned;
};

export const audioFormats = [
  { value: "all", label: "All Formats", mimeTypes: [] },
  { 
    value: "mp3", 
    label: "MP3", 
    mimeTypes: ["audio/mpeg"] 
  },
  { 
    value: "wav", 
    label: "WAV", 
    mimeTypes: ["audio/wav"] // Simplified to match exactly what's in database
  },
  { 
    value: "m4a", 
    label: "M4A", 
    mimeTypes: ["audio/m4a", "audio/x-m4a"] 
  },
  { 
    value: "aac", 
    label: "AAC", 
    mimeTypes: ["audio/aac", "audio/x-aac"] 
  },
  { 
    value: "ogg", 
    label: "OGG", 
    mimeTypes: ["audio/ogg", "audio/x-ogg"] 
  },
  { 
    value: "flac", 
    label: "FLAC", 
    mimeTypes: ["audio/flac", "audio/x-flac"] 
  }
] as const;
