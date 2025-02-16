import JSZip from 'jszip';
import { b2Service } from './b2-service';
import { DemoItem } from '@renderer/types/items';
import { getFilesAndFolders } from './items-service';

export interface ZipProgress {
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
  percentage: number;
}

// Helper function to join paths for zip entries
function joinPaths(...parts: string[]): string {
  return parts
    .filter(part => part !== '')
    .join('/')
    .replace(/\/+/g, '/');
}

// Track processed files to avoid duplicates
const processedFiles = new Set<string>();

async function processFolder(
  folderId: string,
  parentPath: string,
  zip: JSZip,
  progress: { processed: number; total: number },
  onProgress?: (progress: ZipProgress) => void,
  processedPaths = new Set<string>()
): Promise<void> {
  console.log(`📂 Processing folder structure:`, {
    folderId,
    parentPath,
    processedPaths: Array.from(processedPaths)
  });
  
  // Create empty folder in zip
  if (!processedPaths.has(parentPath)) {
    console.log(`📁 Creating empty folder: ${parentPath}`);
    zip.folder(parentPath);
    processedPaths.add(parentPath);
  }
  
  const items = await getFilesAndFolders(folderId);
  console.log(`📑 Items in folder ${parentPath}:`, items.map(i => ({
    name: i.name,
    type: i.type,
    parentFolderIds: i.parentFolderIds
  })));

  for (const item of items) {
    const itemPath = joinPaths(parentPath, item.name);
    
    // Skip if we've already processed this path
    if (processedPaths.has(itemPath)) {
      console.log(`⏭️ Skipping already processed path: ${itemPath}`);
      continue;
    }

    if (item.type === 'file' && item.filePath) {
      try {
        console.log(`⬇️ Processing file: ${itemPath}`);
        const fileData = await b2Service.downloadFile(item.filePath);
        
        console.log(`📦 Adding to zip: ${itemPath}`);
        zip.file(itemPath, fileData);
        
        processedPaths.add(itemPath);
        
        progress.processed++;
        onProgress?.({
          currentFile: item.name,
          processedFiles: progress.processed,
          totalFiles: progress.total,
          percentage: Math.round((progress.processed / progress.total) * 100)
        });
      } catch (error) {
        console.error(`❌ Failed to add file ${itemPath} to zip:`, error);
      }
    } else if (item.type === 'folder') {
      await processFolder(
        item.id!,
        itemPath,
        zip,
        progress,
        onProgress,
        processedPaths
      );
    }
  }
}

async function countTotalFiles(folderId: string): Promise<number> {
  let total = 0;
  const items = await getFilesAndFolders(folderId);
  
  for (const item of items) {
    if (item.type === 'file') {
      total++;
    } else if (item.type === 'folder') {
      total += await countTotalFiles(item.id!);
    }
  }
  
  return total;
}

export async function createFolderZip(
  items: DemoItem[], 
  folderName: string,
  onProgress?: (progress: ZipProgress) => void
): Promise<ArrayBuffer> {
  console.log('🏁 Starting zip creation with items:', items.map(i => ({
    name: i.name,
    type: i.type,
    parentFolderIds: i.parentFolderIds
  })));

  const zip = new JSZip();
  const processedPaths = new Set<string>();
  
  let totalFiles = 0;
  for (const item of items) {
    if (item.type === 'file') {
      totalFiles++;
    } else if (item.type === 'folder') {
      totalFiles += await countTotalFiles(item.id!);
    }
  }
  
  console.log(`📊 Total files to process: ${totalFiles}`);
  const progress = { processed: 0, total: totalFiles };

  for (const item of items) {
    const itemPath = joinPaths(folderName, item.name);
    
    if (item.type === 'file' && item.filePath && !processedPaths.has(itemPath)) {
      try {
        console.log(`⬇️ Processing root file: ${itemPath}`);
        const fileData = await b2Service.downloadFile(item.filePath);
        
        console.log(`📦 Adding to zip: ${itemPath}`);
        zip.file(itemPath, fileData);
        
        processedPaths.add(itemPath);
        progress.processed++;
        onProgress?.({
          currentFile: item.name,
          processedFiles: progress.processed,
          totalFiles: progress.total,
          percentage: Math.round((progress.processed / progress.total) * 100)
        });
      } catch (error) {
        console.error(`❌ Failed to add file ${itemPath} to zip:`, error);
      }
    } else if (item.type === 'folder') {
      await processFolder(
        item.id!,
        itemPath,
        zip,
        progress,
        onProgress,
        processedPaths
      );
    }
  }

  console.log('🎉 Generating final zip file...');
  const zipData = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  
  console.log('✅ Zip file generated successfully');
  return zipData;
} 