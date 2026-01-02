"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { accountabilityQuestions } from "@/lib/questions";
import { MissionerReminder } from "@/components/MissionerReminder";
import type { Step1Data } from "@/components/Step1Form";

export interface Step3Data {
  answers: Record<number, string>;
}

interface Step3FormProps {
  initialValues?: Partial<Step3Data>;
  onDataChange?: (data: Step3Data) => void;
  step1Data?: Step1Data | null;
}

export function Step3Form({ initialValues, onDataChange, step1Data }: Step3FormProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(initialValues?.answers || {});

  useEffect(() => {
    if (onDataChange) {
      onDataChange({ answers });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <MissionerReminder step1Data={step1Data || null} />
      
      <div>
        <h2 className="text-xl font-semibold text-white">Support Accountability Form</h2>
        <p className="text-sm text-white/80 mt-1">
          I confirm the options I&apos;ve selected below as my instructions to the Gift Processing Office on how to
          handle my support in each specified scenario.
        </p>
      </div>

      <div className="">
        {accountabilityQuestions.map((questionData, index) => (
          <div key={index}>
            <div className="space-y-4">
              <Label className="text-base font-semibold text-white">
                {index + 1}. {questionData.question.split("*")[0]}
                {questionData.question.includes("*") && <span className="text-white">*</span>}
              </Label>
              <RadioGroup
                value={answers[index] || ""}
                onValueChange={(value) => handleAnswerChange(index, value)}
                className="mt-4"
              >
                {questionData.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex items-center space-x-1 ml-5">
                    <RadioGroupItem value={choice} id={`q${index}-c${choiceIndex}`} />
                    <Label htmlFor={`q${index}-c${choiceIndex}`} className="font-normal cursor-pointer ml-1 text-white">
                      {choice}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {index < accountabilityQuestions.length - 1 && <div className="border-t border-bc-3/90 mt-6 pt-6" />}
          </div>
        ))}
      </div>
    </div>
  );
}
