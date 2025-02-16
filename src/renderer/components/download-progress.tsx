import { Progress } from "@renderer/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog"
import { ZipProgress } from "@renderer/services/zip-service"

interface DownloadProgressProps {
  isOpen: boolean;
  progress: ZipProgress;
}

export function DownloadProgress({ isOpen, progress }: DownloadProgressProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preparing Download</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <Progress value={progress.percentage} className="w-full" />
          <p className="mt-2 text-sm text-muted-foreground">
            Downloading {progress.currentFile} ({progress.processedFiles} of {progress.totalFiles})
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 