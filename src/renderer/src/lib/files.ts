import { FileItem } from "@renderer/types/files";

export const isValidYoutubeUrl = (url: string) => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return pattern.test(url)
}

export const sanitizeFileName = (fileName: string): string => {
  // Replace square brackets and other potentially problematic characters
  return fileName
    .replace(/[\[\]#%&{}\\<>*?/$!'":@+`|=]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
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