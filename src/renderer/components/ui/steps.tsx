import * as React from "react"
import { cn } from "@renderer/lib/utils"

interface StepsProps {
  value: number
  onChange: (step: number) => void
  children: React.ReactNode
}

interface StepProps {
  value: number
  title: string
  children: React.ReactNode
}

export function Steps({ value, onChange, children }: StepsProps) {
  const steps = React.Children.toArray(children)
  
  return (
    <div className="space-y-4">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          {steps.map((step, index) => {
            const stepProps = (step as React.ReactElement<StepProps>).props
            return (
              <li key={stepProps.value} className="md:flex-1">
                <button
                  className={cn(
                    "group flex w-full flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0",
                    value === stepProps.value
                      ? "border-primary"
                      : "border-border cursor-pointer"
                  )}
                  onClick={() => onChange(stepProps.value)}
                >
                  <span className="text-sm font-medium">{stepProps.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      <div className="mt-8">
        {steps.find((step) => (step as React.ReactElement<StepProps>).props.value === value)}
      </div>
    </div>
  )
}

export function Step({ children }: StepProps) {
  return <>{children}</>
} 