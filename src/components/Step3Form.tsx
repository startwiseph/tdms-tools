"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { accountabilityQuestions } from "@/lib/questions";

export interface Step3Data {
  answers: Record<number, string>;
}

interface Step3FormProps {
  initialValues?: Partial<Step3Data>;
  onDataChange?: (data: Step3Data) => void;
}

export function Step3Form({ initialValues, onDataChange }: Step3FormProps) {
  const [answers, setAnswers] = useState<Record<number, string>>(
    initialValues?.answers || {}
  );

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
      <h2 className="text-xl font-semibold text-foreground">
        Support Accountability Form
      </h2>
      <p className="text-sm text-muted-foreground">
        I confirm the options I&apos;ve selected below as my instructions to the Gift Processing Office on how to handle my support in each specified scenario.
      </p>

      <div className="">
        {accountabilityQuestions.map((questionData, index) => (
          <div key={index}>
            <div className="space-y-4">
              <Label className="text-base font-medium">
                {questionData.question.split("*")[0]}
                {questionData.question.includes("*") && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <RadioGroup
                value={answers[index] || ""}
                onValueChange={(value) => handleAnswerChange(index, value)}
                className="mt-4"
              >
                {questionData.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex items-center space-x-1">
                    <RadioGroupItem value={choice} id={`q${index}-c${choiceIndex}`} />
                    <Label
                      htmlFor={`q${index}-c${choiceIndex}`}
                      className="font-normal cursor-pointer"
                    >
                      {choice}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {index < accountabilityQuestions.length - 1 && (
              <div className="border-t border-gray-200 mt-6 pt-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

