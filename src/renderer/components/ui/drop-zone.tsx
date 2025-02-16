import * as React from "react"
import { cn } from "@renderer/lib/utils"
import { Upload } from "lucide-react"

interface DropZoneProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  disabled?: boolean
  isDragging?: boolean
}

const DropZone = React.forwardRef<HTMLDivElement, DropZoneProps>(
  ({ className, disabled, isDragging, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-8 text-center transition-colors",
          isDragging && "border-primary/50 bg-primary/5",
          disabled && "pointer-events-none opacity-60",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center justify-center">
          {children || (
            <>
              <Upload className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Drag and drop files here, or click to select files
              </p>
            </>
          )}
        </div>
      </div>
    )
  }
)
DropZone.displayName = "DropZone"

export { DropZone } 