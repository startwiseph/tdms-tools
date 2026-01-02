"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ProgressBar";
import { Step1Form, type Step1Data } from "@/components/Step1Form";
import { Step2Form, type Step2Data } from "@/components/Step2Form";
import { Step3Form, type Step3Data } from "@/components/Step3Form";
import { Step4Form, type Step4Data } from "@/components/Step4Form";
import { Loader2, ChevronLeft, ChevronRight, Link } from "lucide-react";
import { generatePIC, generateSAF, downloadBlob } from "@/lib/imageEditor";
import { accountabilityQuestions } from "@/lib/questions";
import { PersonalLinkModal } from "@/components/PersonalLinkModal";

interface MultiStepFormProps {
  initialStep1?: Partial<Step1Data>;
  initialStep2?: Partial<Step2Data>;
  onVictoryMemberChange?: (isVictoryMember: boolean | null) => void;
  onStepChange?: (step: number) => void;
  onFormDataChange?: (data: {
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3: Step3Data | null;
    step4: Step4Data | null;
  }) => void;
}

// Helper function to parse date strings in multiple formats (same as Step1Form)
function parseDateString(dateInput: string | Date | undefined): Date | undefined {
  if (!dateInput) return undefined;
  if (dateInput instanceof Date) return dateInput;

  const dateStr = String(dateInput).trim();
  if (!dateStr) return undefined;

  // Try YYYY-MM-DD format (ISO format)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  // Try MM-DD-YYYY format
  const usMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) {
      date.setHours(0, 0, 0, 0);
      return date;
    }
  }

  // Fall back to native Date parsing
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  return undefined;
}

export function MultiStepForm({
  initialStep1,
  initialStep2,
  onVictoryMemberChange,
  onStepChange,
  onFormDataChange,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null);
  const [step4Data, setStep4Data] = useState<Step4Data | null>(null);
  const [step4ResetKey, setStep4ResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [picBlob, setPicBlob] = useState<Blob | null>(null);
  const [safBlob, setSafBlob] = useState<Blob | null>(null);
  const [isPersonalLinkModalOpen, setIsPersonalLinkModalOpen] = useState(false);

  // Check if initialStep1 has all required fields and auto-advance to Step 2
  useEffect(() => {
    if (initialStep1 && !step1Data) {
      // Parse date if it's a string
      const parsedDate = parseDateString(initialStep1.date);

      // Validate that date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isValidDate = parsedDate && parsedDate >= today;

      // Check if all required fields are present and valid
      const hasMissionerName = initialStep1.missionerName && initialStep1.missionerName.trim() !== "";
      const hasNation = !!initialStep1.nation;
      const hasDate = isValidDate;
      const hasChurch = initialStep1.church && initialStep1.church.trim() !== "";

      if (hasMissionerName && hasNation && hasDate && hasChurch && parsedDate) {
        // All fields are present and valid, populate step1Data and advance to Step 2
        const completeStep1Data: Step1Data = {
          missionerName: initialStep1.missionerName!.trim(),
          nation: initialStep1.nation!,
          date: parsedDate,
          church: initialStep1.church!.trim(),
        };
        setStep1Data(completeStep1Data);
        setCurrentStep(2);
        if (onStepChange) {
          onStepChange(2);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep1]);

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

  // Notify parent of form data changes for live preview
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        step1: step1Data,
        step2: step2Data,
        step3: step3Data,
        step4: step4Data,
      });
    }
  }, [step1Data, step2Data, step3Data, step4Data, onFormDataChange]);

  const handleFinish = async () => {
    if (!step1Data || !step2Data || !step3Data || !step4Data) {
      console.error("Missing form data");
      return;
    }

    setIsSubmitting(true);

    try {
      // Load countries data
      const countriesResponse = await fetch("/countries.json");
      const countriesData = await countriesResponse.json();

      // Convert uploaded file to data URL if needed
      let signatureDataUrl = step4Data.signatureDataUrl;
      if (step4Data.uploadedFile && !signatureDataUrl) {
        signatureDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(step4Data.uploadedFile!);
        });
      }

      // Prepare Step 4 data with converted signature
      const step4DataWithSignature = {
        ...step4Data,
        signatureDataUrl: signatureDataUrl || step4Data.signatureDataUrl,
      };

      // Generate PIC image
      const generatedPicBlob = await generatePIC(step1Data, step2Data, countriesData);
      setPicBlob(generatedPicBlob);
      downloadBlob(generatedPicBlob, "PIC.png");

      // Add delay to ensure browser permission for multiple downloads
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate SAF image
      const generatedSafBlob = await generateSAF(step2Data, step3Data, step4DataWithSignature, accountabilityQuestions);
      setSafBlob(generatedSafBlob);
      // Always use SAF.png as filename regardless of which base image was used
      downloadBlob(generatedSafBlob, "SAF.png");

      setIsSubmitting(false);
      setIsComplete(true);
    } catch (error) {
      console.error("Error generating images:", error);
      setIsSubmitting(false);
      alert("An error occurred while generating the forms. Please try again.");
    }
  };

  const handleReset = () => {
    setIsComplete(false);
    setCurrentStep(1);
    setStep1Data(null);
    setStep2Data(null);
    setStep3Data(null);
    setStep4Data(null);
    setPicBlob(null);
    setSafBlob(null);
    if (onStepChange) {
      onStepChange(1);
    }
  };

  const handleDownloadPIC = () => {
    if (picBlob) {
      downloadBlob(picBlob, "PIC.png");
    }
  };

  const handleDownloadSAF = () => {
    if (safBlob) {
      downloadBlob(safBlob, "SAF.png");
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Form initialValues={step1Data || initialStep1} onDataChange={handleStep1DataChange} />;
      case 2:
        return (
          <Step2Form
            initialValues={step2Data || initialStep2}
            onDataChange={handleStep2DataChange}
            step1Data={step1Data}
          />
        );
      case 3:
        return (
          <Step3Form
            initialValues={step3Data ? { answers: step3Data.answers } : undefined}
            onDataChange={handleStep3DataChange}
            step1Data={step1Data}
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
        <div className="min-h-[400px] flex flex-col justify-center gap-6">
          <div className="space-y-4 mt-9">
            <h2 className="text-2xl font-semibold text-white">Thank you, {step2Data?.partnerName || "Partner"}!</h2>
            <h5 className="text-md font-normal text-white/90">
              Your PIC and SAF should be downloading now. Please submit these files to{" "}
              <span className="underline">{step1Data?.missionerName || "the Missioner"}</span>, who will upload them to
              their portal.
            </h5>
            <p className="text-sm text-white/80">
              In case the download did not start automatically, you may click the buttons below to download the files.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleDownloadPIC}
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:border-white/80"
            >
              Download PIC
            </Button>
            <Button
              onClick={handleDownloadSAF}
              variant="outline"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10 hover:border-white/80"
            >
              Download SAF
            </Button>
          </div>

          <div className="border-t border-bc-3/90 mt-6 pt-6" />

          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-white hover:border-white/80 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
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

      <div className="flex justify-between mt-7">
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
          <Button
            onClick={() => setIsPersonalLinkModalOpen(true)}
            variant="outline"
            className="border border-white bg-transparent text-white hover:border-white/80 hover:bg-white/10"
          >
            <Link className="h-4 w-4" />
            Get Personal Link
          </Button>
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

      <PersonalLinkModal
        open={isPersonalLinkModalOpen}
        onOpenChange={setIsPersonalLinkModalOpen}
        initialValues={step1Data || undefined}
      />
    </div>
  );
}
