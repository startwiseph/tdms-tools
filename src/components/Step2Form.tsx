"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MissionerReminder } from "@/components/MissionerReminder";
import type { Step1Data } from "@/components/Step1Form";

export interface Step2Data {
  partnerName: string;
  amount: string;
  denomination: "PHP" | "USD";
  email: string;
  mobile: string;
  localChurch: string;
  isVictoryMember: boolean | null;
}

interface Step2FormProps {
  initialValues?: Partial<Step2Data>;
  onDataChange?: (data: Step2Data) => void;
  step1Data?: Step1Data | null;
}

export function Step2Form({ initialValues, onDataChange, step1Data }: Step2FormProps) {
  const [partnerName, setPartnerName] = useState(initialValues?.partnerName || "");
  const [amount, setAmount] = useState(initialValues?.amount || "");
  const [denomination, setDenomination] = useState<"PHP" | "USD">(initialValues?.denomination || "PHP");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [mobile, setMobile] = useState(initialValues?.mobile || "");
  const [localChurch, setLocalChurch] = useState(initialValues?.localChurch || "");
  const [isVictoryMember, setIsVictoryMember] = useState<boolean | null>(initialValues?.isVictoryMember ?? null);

  // Sync state when initialValues change
  useEffect(() => {
    if (initialValues?.partnerName !== undefined && initialValues.partnerName !== partnerName) {
      setPartnerName(initialValues.partnerName);
    }
    if (initialValues?.amount !== undefined && initialValues.amount !== amount) {
      setAmount(initialValues.amount);
    }
    if (initialValues?.denomination !== undefined && initialValues.denomination !== denomination) {
      setDenomination(initialValues.denomination);
    }
    if (initialValues?.email !== undefined && initialValues.email !== email) {
      setEmail(initialValues.email);
    }
    if (initialValues?.mobile !== undefined && initialValues.mobile !== mobile) {
      setMobile(initialValues.mobile);
    }
    if (initialValues?.localChurch !== undefined && initialValues.localChurch !== localChurch) {
      setLocalChurch(initialValues.localChurch);
    }
    if (initialValues?.isVictoryMember !== undefined && initialValues.isVictoryMember !== isVictoryMember) {
      setIsVictoryMember(initialValues.isVictoryMember);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        partnerName,
        amount,
        denomination,
        email,
        mobile,
        localChurch,
        isVictoryMember,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerName, amount, denomination, email, mobile, localChurch, isVictoryMember]);

  return (
    <div className="space-y-4">
      <MissionerReminder step1Data={step1Data || null} />
      
      <div>
        <h2 className="text-xl font-semibold text-white">Partner Information</h2>
        <p className="text-sm text-white/80 mt-1">
          Enter your personal information as this will be needed in the form.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="partner-name" className="text-white">
          Partner&apos;s Name
        </Label>
        <Input
          id="partner-name"
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-white">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="denomination" className="text-white">
            Denomination
          </Label>
          <Select value={denomination} onValueChange={(value: "PHP" | "USD") => setDenomination(value)}>
            <SelectTrigger id="denomination">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHP">PHP</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mobile" className="text-white">
          Mobile Number
        </Label>
        <Input
          id="mobile"
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          placeholder="Enter mobile number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="local-church" className="text-white">
          Local Church
        </Label>
        <Input
          id="local-church"
          value={localChurch}
          onChange={(e) => setLocalChurch(e.target.value)}
          placeholder="Enter local church"
        />
      </div>

      <div className="space-y-2 border-t border-bc-3/90 pt-6 mt-6">
        <Label htmlFor="victory-member" className="text-white">
          Are you a member of Victory Christian Fellowship in the Philippines?
        </Label>
        <RadioGroup
          value={isVictoryMember === null ? "" : isVictoryMember ? "yes" : "no"}
          onValueChange={(value) => setIsVictoryMember(value === "yes" ? true : value === "no" ? false : null)}
          className="mt-2 flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="victory-member-yes" />
            <Label htmlFor="victory-member-yes" className="font-normal cursor-pointer text-white">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="victory-member-no" />
            <Label htmlFor="victory-member-no" className="font-normal cursor-pointer text-white">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
