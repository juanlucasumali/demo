import * as React from "react"
import { cn } from "@renderer/lib/utils"

interface StepsProps {
  children: React.ReactNode
  currentStep: number
}

interface StepProps {
  value: number
  title: string
  children: React.ReactNode
  canProceedToNext?: boolean
  currentStep: number
}

export function Steps({ children, currentStep }: StepsProps) {
  const steps = React.Children.toArray(children)
  
  return (
    <div className="space-y-4">
      <div className="mt-8 space-y-6">
        {steps.map((step) => 
          React.isValidElement(step) 
            ? React.cloneElement(step, { currentStep, ...step.props })
            : step
        )}
      </div>
    </div>
  )
}

export function Step({ children, value, title, currentStep, canProceedToNext, ...props }: StepProps) {
  return (
    <div className={cn(
      "transition-opacity",
      value > currentStep && "opacity-50 pointer-events-none",
      value > currentStep && canProceedToNext && "opacity-100 pointer-events-auto"
    )}>
      {children}
    </div>
  )
} 