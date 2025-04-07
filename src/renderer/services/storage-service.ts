import { STORAGE_LIMITS, StorageCheckResult, StorageQuota } from "@renderer/types/storage";
import { b2Service } from './b2-service';
import { getCurrentUserId } from './items-service';
import * as userService from './user-service';

// This is a dummy implementation. In a real app, this would fetch from your backend
export async function getStorageQuota(): Promise<StorageQuota> {
  const userId = getCurrentUserId();
  
  try {
    // Get actual storage usage from B2
    const { used } = await b2Service.getUserStorageUsage(userId);
    // const used = 1000000000000000000;
    
    // Get user's subscription to determine storage limit
    const profile = await userService.getProfile(userId);
    const total = profile.subscription ? STORAGE_LIMITS[profile.subscription as keyof typeof STORAGE_LIMITS] : STORAGE_LIMITS.free;
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    console.error('Failed to get storage quota:', error);
    throw error;
  }
}

export async function checkStorageLimit(): Promise<StorageCheckResult> {
  try {
    // Get current quota info
    const quota = await getStorageQuota();
    console.log('Quota:', quota);
    
    // Calculate available space and round it to 1 decimal place
    const availableSpace = quota.total - quota.used;
    const roundedAvailableSpace = Math.round(availableSpace / 100000000) * 100000000; // Round to nearest 0.1 GB
    console.log('Available space:', formatBytes(roundedAvailableSpace));

    // Check if would exceed limit
    if (roundedAvailableSpace <= 0) {
      return {
        allowed: false,
        availableSpace: roundedAvailableSpace,
      };
    }
    
    return {
      allowed: true,
      availableSpace: roundedAvailableSpace,
    };
  } catch (error) {
    console.error('Failed to check storage limit:', error);
    throw error;
  }
}

// Helper function to calculate total size of files
export function calculateTotalFileSize(files: File[]): number {
  return files.reduce((total, file) => total + file.size, 0);
}

export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1000 && unitIndex < units.length - 1) {
    size /= 1000;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
} 