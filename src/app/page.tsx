"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { MultiStepForm } from "@/components/MultiStepForm";
import { PrivacyInfoBanner } from "@/components/PrivacyInfoBanner";

function HomeContent() {
  const searchParams = useSearchParams();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(1);
  const [isVictoryMember, setIsVictoryMember] = useState<boolean | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isFlippingIn, setIsFlippingIn] = useState(false);
  const [displayImage, setDisplayImage] = useState<string | null>(null);

  // Extract query parameters for pre-filling
  const initialStep1 = {
    missionerName: searchParams.get("name") || undefined,
    nation: searchParams.get("nation") || undefined,
    date: searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
    church: searchParams.get("church") || undefined,
  };

  useEffect(() => {
    // Determine which image should be shown based on step
    const shouldShowPIC = currentStep === 1 || currentStep === 2;
    const shouldShowSAF = currentStep === 3 || currentStep === 4;
    const newImage = shouldShowPIC
      ? "/images/PIC.png"
      : shouldShowSAF
        ? isVictoryMember === true
          ? "/images/SAF_victory.png"
          : "/images/SAF.png"
        : null;

    if (!newImage) return;

    // Check if we need to flip (transitioning between PIC and SAF)
    const wasShowingPIC = previousStep === 1 || previousStep === 2;
    const isShowingPIC = currentStep === 1 || currentStep === 2;
    const needsFlip = wasShowingPIC !== isShowingPIC && displayImage !== null;

    if (needsFlip) {
      // Start flip-out animation
      setIsFlipping(true);
      setIsFlippingIn(false);

      // Change image early in flip-out for seamless transition (no pause)
      setTimeout(() => {
        setDisplayImage(newImage);
        setIsFlipping(false);
        setIsFlippingIn(true);

        // Remove flip-in class after animation completes
        setTimeout(() => {
          setIsFlippingIn(false);
        }, 500);
      }, 200); // Switch image early for seamless transition
    } else {
      // No flip needed, just update the image
      if (!displayImage || newImage !== displayImage) {
        setDisplayImage(newImage);
      }
      setIsFlipping(false);
      setIsFlippingIn(false);
    }

    setPreviousStep(currentStep);
    setPreviewImage(newImage);
  }, [currentStep, isVictoryMember]);

  return (
    <div className="flex min-h-screen bg-bc-1">
      {/* Left Panel - Settings */}
      <div className="w-full lg:w-1/3 bg-bc-2 p-4 md:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Image
              src="/images/logo_full.png"
              alt="TDMS Tools Logo"
              width={560}
              height={1000}
              className="h-24 md:h-20 w-auto object-contain shrink-0"
              priority
            />
            <div className="flex-1 min-w-0">
              <PrivacyInfoBanner />
            </div>
          </div>
          <MultiStepForm
            initialStep1={initialStep1}
            onStepChange={setCurrentStep}
            onVictoryMemberChange={setIsVictoryMember}
          />

          {/* Footer */}
          <footer className="mt-3 pt-6">
            <p className="text-xs text-white/70 leading-relaxed">
              {new Date().getFullYear()} © TDMS Tools. All rights reserved. Made by{" "}
              <a
                href="https://instagram.com/louislemsic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                James Louis Lemsic
              </a>
              . This project is made open source for developers to audit the source code and enable others to
              contribute,{" "}
              <a
                href="https://github.com/startwiseph/tdms-tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                click here to see the GitHub Repository
              </a>
              .
            </p>
          </footer>
        </div>
      </div>

      {/* Right Panel - Preview (Desktop Only) */}
      <div className="hidden lg:flex lg:w-2/3 bg-bc-1/20 items-center justify-center p-8">
        <div className="w-full max-w-4xl flip-container">
          {displayImage && (
            <div
              className={`bg-white rounded-lg shadow-lg p-4 flip-image ${isFlipping ? "flipping" : isFlippingIn ? "flipping-in" : ""}`}
            >
              <Image src={displayImage} alt="Preview" width={800} height={1000} className="w-full h-auto" priority />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-bc-1 items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
