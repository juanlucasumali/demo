import { useQuery } from "@tanstack/react-query";
import * as storageService from "@renderer/services/storage-service";

export function useStorage() {
  const { data: quota, isLoading } = useQuery({
    queryKey: ["storage-quota"],
    queryFn: storageService.getStorageQuota,
  });

  return {
    quota,
    isLoading,
  };
} 