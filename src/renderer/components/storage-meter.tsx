import { Progress } from "@renderer/components/ui/progress";
import { useStorage } from "@renderer/hooks/use-storage";
import { Button } from "@renderer/components/ui/button";
import { useDialogState } from "@renderer/hooks/use-dialog-state";
import { DialogManager } from "./dialog-manager";
import { cn } from "@renderer/lib/utils";
import { formatBytes } from "@renderer/services/storage-service";
import { useUserStore } from "@renderer/stores/user-store";

export function StorageMeter() {
  const { quota, isLoading } = useStorage();
  const dialogState = useDialogState();
  const profile = useUserStore((state) => state.profile);

  if (isLoading || !quota) {
    return null;
  }

  // For Pro users, just show used storage without progress bar
  if (profile?.subscription === 'pro') {
    return (
      <>
        <div className="px-2 py-2">
          <p className="text-xs text-muted-foreground">
            {formatBytes(quota.used)} used
          </p>
        </div>
        <div className="px-2 pb-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => dialogState.subscription.onOpen()}
          >
            Manage Subscription
          </Button>
        </div>
        <DialogManager
          {...dialogState}
          isLoading={{ deleteItem: false, updateItem: false }}
        />
      </>
    );
  }

  // For other users, show progress bar and total storage
  return (
    <>
      <div className="px-2 py-2">
        <Progress 
          value={quota.percentage} 
          className={cn(
            "h-1 mb-1",
            quota.percentage >= 90 && "bg-destructive/20 [&>div]:bg-destructive"
          )} 
        />
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