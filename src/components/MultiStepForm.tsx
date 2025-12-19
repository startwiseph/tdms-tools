"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
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

export function MultiStepForm({ initialStep1, initialStep2, onVictoryMemberChange, onStepChange }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [step4Data, setStep4Data] = useState<Step4Data | null>(null);
  const [step4ResetKey, setStep4ResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleStepClick = (step: number) => {
    // Allow navigating to any step
    setCurrentStep(step);
    if (onStepChange) {
      onStepChange(step);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          step1Data?.missionerName &&
          step1Data?.missionerName.trim() !== "" &&
          step1Data?.nation &&
          step1Data?.date &&
          step1Data?.church &&
          step1Data?.church.trim() !== ""
        );
      case 2:
        return !!(
          step2Data?.partnerName &&
          step2Data?.partnerName.trim() !== "" &&
          step2Data?.amount &&
          step2Data?.amount.trim() !== "" &&
          step2Data?.denomination &&
          step2Data?.email &&
          step2Data?.email.trim() !== "" &&
          step2Data?.mobile &&
          step2Data?.mobile.trim() !== "" &&
          step2Data?.localChurch &&
          step2Data?.localChurch.trim() !== "" &&
          step2Data?.isVictoryMember !== null
        );
      case 3:
        if (!step3Data?.answers) return false;
        // Check if all 3 questions are answered
        const answers = step3Data.answers;
        return answers[0] !== undefined && answers[1] !== undefined && answers[2] !== undefined;
      case 4:
        return !!(step4Data?.signatureType && (step4Data?.uploadedFile || step4Data?.signatureDataUrl));
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!isStepValid(currentStep)) {
      return; // Don't proceed if current step is not valid
    }

    if (currentStep < 4) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) {
        onStepChange(nextStep);
      }
    }
  };

  const handleBack = () => {
    // If on step 4 and a method is selected, reset the method selection instead of going back
    if (currentStep === 4 && step4Data?.signatureType) {
      setStep4Data(null);
      setStep4ResetKey((prev) => prev + 1);
      return;
    }

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
        return <Step1Form initialValues={initialStep1} onDataChange={handleStep1DataChange} />;
      case 2:
        return <Step2Form initialValues={initialStep2} onDataChange={handleStep2DataChange} />;
      case 3:
        return (
          <Step3Form
            initialValues={step3Data ? { answers: step3Data.answers } : undefined}
            onDataChange={handleStep3DataChange}
          />
        );
      case 4:
        return (
          <Step4Form key={step4ResetKey} initialValues={step4Data || undefined} onDataChange={handleStep4DataChange} />
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
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="text-lg text-white">Processing...</p>
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
            <div className="h-16 w-16 mx-auto rounded-full bg-green-500 flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-white">All done, the files should be downloaded.</h3>
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
      <ProgressBar currentStep={currentStep} onStepClick={handleStepClick} totalSteps={4} />

      <div className="min-h-[400px]">{renderStep()}</div>

      <div className="flex justify-between">
        {currentStep > 1 ? (
          <Button
            onClick={handleBack}
            variant="outline"
            className="bg-white hover:border-white/80 hover:bg-white/10 hover:text-white"
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
            className="bg-white hover:border-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isStepValid(currentStep)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : isStepValid(4) ? (
          <Button
            onClick={handleFinish}
            variant="outline"
            className="bg-white hover:border-white/80 hover:bg-white/10 hover:text-white"
          >
            Finish
          </Button>
        ) : null}
      </div>
    </div>
  );
}
