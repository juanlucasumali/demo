export interface StorageQuota {
  used: number;  // in bytes
  total: number; // in bytes
  percentage: number;
} 

export interface StorageCheckResult {
  allowed: boolean;
  availableSpace: number;  // in bytes
}
