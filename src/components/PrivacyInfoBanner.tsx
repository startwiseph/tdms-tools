"use client";

import { Info } from "lucide-react";

export function PrivacyInfoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border-2 border-bc-1/30 bg-bc-1/10 p-4">
      <div className="">
        <Info className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 -mt-1">
        <span className="text-sm font-semibold text-white">Privacy Matters!</span>
        <p className="mt-1 text-sm text-white">
          Any information you enter in this website stays on your device and is NEVER SAVED anywhere.
        </p>
      </div>
    </div>
  );
}
