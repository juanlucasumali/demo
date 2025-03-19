import { Progress } from "@renderer/components/ui/progress";
import { useStorage } from "@renderer/hooks/use-storage";
import { Button } from "@renderer/components/ui/button";
import { useDialogState } from "@renderer/hooks/use-dialog-state";
import { DialogManager } from "./dialog-manager";

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function StorageMeter() {
  const { quota, isLoading } = useStorage();
  const dialogState = useDialogState();

  if (isLoading || !quota) {
    return null;
  }

  return (
    <>
      <div className="px-2 py-2">
        <Progress value={quota.percentage} className="h-1 mb-1" />
        <p className="text-xs text-muted-foreground">
          {formatBytes(quota.used)} of {formatBytes(quota.total)} used
        </p>
      </div>
      <div className="px-2 pb-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => dialogState.subscription.onOpen()}
        >
          Upgrade
        </Button>
      </div>
      <DialogManager
        {...dialogState}
        isLoading={{ deleteItem: false, updateItem: false }}
      />
    </>
  );
} 