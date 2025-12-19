"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { MultiStepForm } from "@/components/MultiStepForm";
import { PrivacyInfoBanner } from "@/components/PrivacyInfoBanner";
import { LivePreview } from "@/components/LivePreview";
import type { Step1Data } from "@/components/Step1Form";
import type { Step2Data } from "@/components/Step2Form";
import type { Step3Data } from "@/components/Step3Form";
import type { Step4Data } from "@/components/Step4Form";

function HomeContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVictoryMember, setIsVictoryMember] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<{
    step1: Step1Data | null;
    step2: Step2Data | null;
    step3: Step3Data | null;
    step4: Step4Data | null;
  }>({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
  });
  const [countriesData, setCountriesData] = useState<Array<{ name: string; code: string }> | null>(null);

  // Extract query parameters for pre-filling
  const initialStep1 = {
    missionerName: searchParams.get("name") || undefined,
    nation: searchParams.get("nation") || undefined,
    date: searchParams.get("date") ? new Date(searchParams.get("date")!) : undefined,
    church: searchParams.get("church") || undefined,
  };

  // Load countries data
  useEffect(() => {
    fetch("/countries.json")
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

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
            onFormDataChange={setFormData}
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
        <LivePreview
          currentStep={currentStep}
          step1Data={formData.step1}
          step2Data={formData.step2}
          step3Data={formData.step3}
          step4Data={formData.step4}
          isVictoryMember={isVictoryMember}
          countriesData={countriesData}
        />
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
