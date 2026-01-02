"use client";

import { useState, useEffect } from "react";
import type { Step1Data } from "@/components/Step1Form";

interface Country {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
}

interface MissionerReminderProps {
  step1Data: Step1Data | null;
}

export function MissionerReminder({ step1Data }: MissionerReminderProps) {
  const [countriesData, setCountriesData] = useState<Country[]>([]);

  useEffect(() => {
    fetch("/countries.json")
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  if (!step1Data) return null;

  const country = step1Data.nation && countriesData.length > 0 
    ? countriesData.find((c) => c.code === step1Data.nation) 
    : null;
  const nationName = country?.name || step1Data.nation || "";

  const formattedDate = step1Data.date
    ? step1Data.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (!step1Data.missionerName || !step1Data.nation || !step1Data.date) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-yellow-200/10 border border-yellow-200 rounded-lg">
      <p className="text-sm text-white/90">
        You&apos;re filling this form for <span className="font-semibold underline text-white">{step1Data.missionerName}</span> who will go to{" "}
        <span className="font-semibold underline text-white">{nationName}</span> on{" "}
        <span className="font-semibold underline text-white">{formattedDate}</span>.
      </p>
    </div>
  );
}

