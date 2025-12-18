"use client";

import { Info } from "lucide-react";

export function PrivacyInfoBanner() {
  return (
    <div 
      className="flex items-start gap-3 rounded-lg border-2 p-4"
      style={{ 
        borderColor: "#2596be",
        backgroundColor: "rgba(37, 150, 190, 0.15)"
      }}
    >
      <div className="">
        <Info className="h-4 w-4 text-bc-1 text-[#2596be]" />
      </div>
      <div className="flex-1 -mt-1">
        <span 
          className="text-sm font-semibold"
          style={{ color: "#2596be" }}
        >
          Your Privacy Matters!
        </span>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Any information you enter in this website stays on your device and is never saved or stored anywhere.
        </p>
      </div>
    </div>
  );
}

