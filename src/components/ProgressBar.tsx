"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  totalSteps?: number;
}

export function ProgressBar({ currentStep, onStepClick, totalSteps = 4 }: ProgressBarProps) {
  return (
    <div className="flex gap-2 w-full">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        return (
          <button
            key={stepNumber}
            type="button"
            onClick={() => onStepClick(stepNumber)}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors cursor-pointer",
              isActive ? "bg-bc-1" : "bg-bc-1/20",
            )}
            aria-label={`Go to step ${stepNumber}`}
          />
        );
      })}
    </div>
  );
}
