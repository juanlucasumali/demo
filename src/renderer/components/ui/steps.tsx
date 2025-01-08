import * as React from "react"
import { cn } from "@renderer/lib/utils"

interface StepsProps {
  children: React.ReactNode
}

interface StepProps {
  value: number
  title: string
  children: React.ReactNode
  canProceedToStep2?: boolean
}

export function Steps({ children }: StepsProps) {
  const steps = React.Children.toArray(children)
  
  return (
    <div className="space-y-4">
      <div className="mt-8 space-y-6">
        {steps.map((step) => step)}
      </div>
    </div>
  )
}

export function Step({ children, value, canProceedToStep2 }: StepProps) {
  return (
    <div className={cn(
      "transition-opacity",
      value === 2 ? "opacity-50 pointer-events-none" : "opacity-100",
      value === 2 && canProceedToStep2 && "opacity-100 pointer-events-auto"
    )}>
      {children}
    </div>
  )
} 