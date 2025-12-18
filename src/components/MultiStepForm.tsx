"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { PrivacyInfoBanner } from "@/components/PrivacyInfoBanner";
import { Step1Form, type Step1Data } from "@/components/Step1Form";
import { Step2Form, type Step2Data } from "@/components/Step2Form";
import { Step3Form, type Step3Data } from "@/components/Step3Form";
import { Step4Form, type Step4Data } from "@/components/Step4Form";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface MultiStepFormProps {
  initialStep1?: Partial<Step1Data>;
  initialStep2?: Partial<Step2Data>;
  onVictoryMemberChange?: (isVictoryMember: boolean | null) => void;
  onStepChange?: (step: number) => void;
}

export function MultiStepForm({ 
  initialStep1, 
  initialStep2,
  onVictoryMemberChange,
  onStepChange,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [step4Data, setStep4Data] = useState<Step4Data | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleStepClick = (step: number) => {
    // Allow navigating to any step
    setCurrentStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) {
        onStepChange(prevStep);
      }
    }
  };

  const handleStep1DataChange = (data: Step1Data) => {
    setStep1Data(data);
  };

  const handleStep2DataChange = (data: Step2Data) => {
    setStep2Data(data);
    if (onVictoryMemberChange) {
      onVictoryMemberChange(data.isVictoryMember);
    }
  };

  const handleStep3DataChange = (data: Step3Data) => {
    setStep3Data(data);
  };

  const handleStep4DataChange = (data: Step4Data) => {
    setStep4Data(data);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    
    // Call your submission function here (empty for now)
    const submitForm = async () => {
      // TODO: Add your form submission logic here
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000); // Simulate API call
      });
    };

    try {
      await submitForm();
      setIsSubmitting(false);
      setIsComplete(true);
    } catch (error) {
      console.error("Submission error:", error);
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsComplete(false);
    setCurrentStep(1);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setStep4Data(null);
    if (onStepChange) {
      onStepChange(1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Form
            initialValues={initialStep1}
            onDataChange={handleStep1DataChange}
          />
        );
      case 2:
        return (
          <Step2Form
            initialValues={initialStep2}
            onDataChange={handleStep2DataChange}
          />
        );
      case 3:
        return (
          <Step3Form
            initialValues={step3Data ? { answers: step3Data.answers } : undefined}
            onDataChange={handleStep3DataChange}
          />
        );
      case 4:
        return (
          <Step4Form
            initialValues={step4Data || undefined}
            onDataChange={handleStep4DataChange}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state
  if (isSubmitting) {
    return (
      <div className="space-y-6">
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-lg text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  // Show completion state
  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-6">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">
              All done, the files should be downloaded.
            </h3>
          </div>
          <Button onClick={handleReset} size="lg">
            Fill up another one
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar
        currentStep={currentStep}
        onStepClick={handleStepClick}
        totalSteps={4}
      />
      
      <PrivacyInfoBanner />
      
      <div className="min-h-[400px]">
        {renderStep()}
      </div>

      <div className="flex justify-between">
        {currentStep > 1 ? (
          <Button
            onClick={handleBack}
            variant="outline"
            className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}
        {currentStep < 4 ? (
          <Button
            onClick={handleNext}
            variant="outline"
            className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : step4Data?.signatureType && (step4Data?.uploadedFile || step4Data?.signatureDataUrl) ? (
          <Button
            onClick={handleFinish}
            variant="outline"
            className="border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            Finish
          </Button>
        ) : null}
      </div>
    </div>
  );
}

