import { StorageQuota } from "@renderer/types/storage";

// This is a dummy implementation. In a real app, this would fetch from your backend
export async function getStorageQuota(): Promise<StorageQuota> {
  // Simulating an API call with dummy data
  // 7.5GB used of 15GB total
  const used = 7.5 * 1024 * 1024 * 1024;  // 7.5GB in bytes
  const total = 15 * 1024 * 1024 * 1024;  // 15GB in bytes
  
  return {
    used,
    total,
    percentage: (used / total) * 100
  };
} 