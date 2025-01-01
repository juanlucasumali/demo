import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export const maxFileNameLength = 100; // Set maximum length for file name

/**
 * Checks if a router match contains the specified nested property path in its loaderData
 * @param match The router match object to check
 * @param path Dot-notation path to check (e.g. 'loaderData.breadcrumb')
 */
export function isMatch(match: any, path: string): boolean {
  if (!match || !path) return false
  
  const parts = path.split('.')
  let current = match

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return false
    }
    current = current[part]
  }

  return true
}

export function toCamelCase<T extends object>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [key.replace(/([-_][a-z])/g, group =>
          group.toUpperCase().replace('-', '').replace('_', '')
        )]: toCamelCase((obj as any)[key])
      }),
      {}
    );
  }
  return obj;
}

export const mimeTypes = {
  'mp3': 'audio/mpeg',
  'wav': 'audio/wav',
  'pdf': 'application/pdf',
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'mp4': 'video/mp4',
  'flp': 'audio/flac',
  'als': 'audio/x-aiff',
  'zip': 'application/zip'
};