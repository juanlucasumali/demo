export interface StorageQuota {
  used: number;  // in bytes
  total: number; // in bytes
  percentage: number;
} 

export interface StorageCheckResult {
  allowed: boolean;
  availableSpace: number;  // in bytes
}

export const STORAGE_LIMITS = {
  free: 10 * 1000 * 1000 * 1000,      // 10GB
  essentials: 5 * 1000 * 1000 * 1000 * 1000,  // 5TB
  pro: Number.MAX_SAFE_INTEGER        // Unlimited (practically)
};