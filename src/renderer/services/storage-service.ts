import { StorageQuota } from "@renderer/types/storage";
import { b2Service } from './b2-service';
import { getCurrentUserId } from './items-service';

// This is a dummy implementation. In a real app, this would fetch from your backend
export async function getStorageQuota(): Promise<StorageQuota> {
  const userId = getCurrentUserId();
  
  try {
    // Get actual storage usage from B2
    const { used } = await b2Service.getUserStorageUsage(userId);
    
    // Changed from 1024 to 1000 to match display units
    const total = 10 * 1000 * 1000 * 1000;  // 10GB in bytes
    
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