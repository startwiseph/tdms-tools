"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COUNTRIES_URL = "/countries.json";

interface Country {
  name: string;
  flag: string;
  code: string;
  dial_code: string;
}

export interface Step1Data {
  missionerName: string;
  nation: string;
  date: Date | undefined;
  church: string;
}

interface Step1FormProps {
  initialValues?: Partial<Step1Data>;
  onDataChange?: (data: Step1Data) => void;
}

export function Step1Form({ initialValues, onDataChange }: Step1FormProps) {
  const [missionerName, setMissionerName] = useState(initialValues?.missionerName || "");
  const [nation, setNation] = useState(initialValues?.nation || "");
  const [date, setDate] = useState<Date | undefined>(() => {
    if (!initialValues?.date) return undefined;
    const dateValue = initialValues.date instanceof Date ? initialValues.date : new Date(initialValues.date as any);
    // Validate: if date is in the past, return undefined
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateValue < today) return undefined;
    return dateValue;
  });
  const [church, setChurch] = useState(initialValues?.church || "");
  const [countriesData, setCountriesData] = useState<Country[]>([]);
  const [nationSearchOpen, setNationSearchOpen] = useState(false);
  const [nationSearchValue, setNationSearchValue] = useState("");

  // Helper function to get days in a month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Initialize month, day, year from date
  const getDateParts = (dateValue: Date | undefined) => {
    if (!dateValue) return { month: "", day: "", year: "" };
    return {
      month: (dateValue.getMonth() + 1).toString(),
      day: dateValue.getDate().toString(),
      year: dateValue.getFullYear().toString(),
    };
  };

  const [month, setMonth] = useState(() => getDateParts(date).month);
  const [day, setDay] = useState(() => getDateParts(date).day);
  const [year, setYear] = useState(() => getDateParts(date).year);
  const [hasInvalidDateAttempt, setHasInvalidDateAttempt] = useState(false);

  // Get current date for validation
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Generate year options (current year to +5 years ahead, so 6 years total)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear(); // Always get current year dynamically
    const years = [];
    for (let i = 0; i <= 5; i++) {
      years.push((currentYear + i).toString());
    }
    return years;
  }, []); // Empty deps - always recalculate to get current year

  // Generate month options
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const monthName = new Date(2000, i, 1).toLocaleString("default", { month: "long" });
      return { value: monthNum.toString(), label: monthName };
    });
  }, []);

  // Generate day options based on selected month and year
  const dayOptions = useMemo(() => {
    if (!month || !year) return [];
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    const daysInMonth = getDaysInMonth(monthNum, yearNum);
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  }, [month, year]);

  // Adjust day if it becomes invalid when month/year changes
  useEffect(() => {
    if (month && year && day) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const dayNum = parseInt(day);
      const daysInMonth = getDaysInMonth(monthNum, yearNum);
      
      // If selected day exceeds days in month, adjust to last day of month
      if (dayNum > daysInMonth) {
        setDay(daysInMonth.toString());
      }
    }
  }, [month, year, day]);

  // Update date when month, day, or year changes
  useEffect(() => {
    if (month && day && year) {
      const monthNum = parseInt(month);
      const dayNum = parseInt(day);
      const yearNum = parseInt(year);
      const newDate = new Date(yearNum, monthNum - 1, dayNum);
      newDate.setHours(0, 0, 0, 0);

      // Validate: if date is in the past, don't set it and reset all selects
      if (newDate >= today) {
        setDate(newDate);
        // Clear the invalid date attempt flag when valid date is selected
        setHasInvalidDateAttempt(false);
      } else {
        setDate(undefined);
        // Set flag to show error message
        setHasInvalidDateAttempt(true);
        // Reset all selects to force user to select again
        setMonth("");
        setDay("");
        setYear("");
      }
    } else {
      setDate(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, day, year]);

  // Sync month, day, year when date changes from external source
  useEffect(() => {
    if (date) {
      const parts = getDateParts(date);
      if (parts.month !== month) setMonth(parts.month);
      if (parts.day !== day) setDay(parts.day);
      if (parts.year !== year) setYear(parts.year);
    } else if (!date && (month || day || year)) {
      // Clear selects if date is cleared
      setMonth("");
      setDay("");
      setYear("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Check if the selected date is invalid (in the past) or if we have a pending invalid attempt
  const isDateInvalid = useMemo(() => {
    // Show error if we have a pending invalid date attempt
    if (hasInvalidDateAttempt) return true;
    
    // Check if current selection is invalid
    if (!month || !day || !year) return false;
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    const selectedDate = new Date(yearNum, monthNum - 1, dayNum);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }, [month, day, year, today, hasInvalidDateAttempt]);

  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then((res) => res.json())
      .then((data) => setCountriesData(data))
      .catch((err) => console.error("Failed to load countries:", err));
  }, []);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!nationSearchValue) return countriesData;
    const searchLower = nationSearchValue.toLowerCase();
    return countriesData.filter(
      (country) => country.name.toLowerCase().includes(searchLower) || country.code.toLowerCase().includes(searchLower),
    );
  }, [countriesData, nationSearchValue]);

  // Get selected country for display
  const selectedCountry = useMemo(() => {
    return countriesData.find((c) => c.code === nation);
  }, [countriesData, nation]);

  // Sync state when initialValues change (e.g., from URL params)
  useEffect(() => {
    if (initialValues?.missionerName !== undefined && initialValues.missionerName !== missionerName) {
      setMissionerName(initialValues.missionerName);
    }
    if (initialValues?.nation !== undefined && initialValues.nation !== nation) {
      setNation(initialValues.nation);
    }
    if (initialValues?.date !== undefined) {
      const dateValue = initialValues.date instanceof Date ? initialValues.date : new Date(initialValues.date as any);
      // Validate: if date is in the past, don't set it
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isValidDate = dateValue >= today;
      const dateToSet = isValidDate ? dateValue : undefined;
      // Only update if the date actually changed
      if (dateToSet?.getTime() !== date?.getTime()) {
        setDate(dateToSet);
        // Sync month, day, year when date is set
        if (dateToSet) {
          const parts = getDateParts(dateToSet);
          setMonth(parts.month);
          setDay(parts.day);
          setYear(parts.year);
        } else {
          setMonth("");
          setDay("");
          setYear("");
        }
      } else if (!dateToSet && date !== undefined) {
        setDate(undefined);
        setMonth("");
        setDay("");
        setYear("");
      }
    }
    if (initialValues?.church !== undefined && initialValues.church !== church) {
      setChurch(initialValues.church);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        missionerName,
        nation,
        date,
        church,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionerName, nation, date, church]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Missioner Information</h2>
        <p className="text-sm text-white/80 mt-1">
          Please enter the details of the missioner you will support along with their travel details.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="missioner-name">Missioner&apos;s Name</Label>
        <Input
          id="missioner-name"
          value={missionerName}
          onChange={(e) => setMissionerName(e.target.value)}
          placeholder="Enter missioner's name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nation">Nation</Label>
        <Popover open={nationSearchOpen} onOpenChange={setNationSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              id="nation"
              variant="outline"
              role="combobox"
              aria-expanded={nationSearchOpen}
              className="w-full justify-between hover:bg-white hover:border-bc-1/30"
            >
              {selectedCountry ? (
                <span className="flex items-center gap-2">
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">Select a nation</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="p-2">
              <Input
                placeholder="Search country..."
                value={nationSearchValue}
                onChange={(e) => setNationSearchValue(e.target.value)}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No country found.</div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-bc-1/10 hover:text-bc-1",
                      nation === country.code && "bg-bc-1/10 text-bc-1",
                    )}
                    onClick={() => {
                      setNation(country.code);
                      setNationSearchValue("");
                      setNationSearchOpen(false);
                    }}
                  >
                    <Check className={cn("h-4 w-4", nation === country.code ? "opacity-100" : "opacity-0")} />
                    <span>{country.flag}</span>
                    <span>{country.name}</span>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="travel-date" className={cn(isDateInvalid && "text-yellow-400")}>
          {isDateInvalid ? "Travel Date - You can't enter a past date" : "Travel Date"}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label htmlFor="travel-month" className="text-xs text-white/70">
              Month
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="travel-month" className="hover:bg-white hover:border-bc-1/30">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {monthOptions.map((monthOption) => (
                  <SelectItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="travel-day" className="text-xs text-white/70">
              Day
            </Label>
            <Select value={day} onValueChange={setDay} disabled={!month || !year}>
              <SelectTrigger id="travel-day" className="hover:bg-white hover:border-bc-1/30">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {dayOptions.map((dayOption) => (
                  <SelectItem key={dayOption} value={dayOption}>
                    {dayOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="travel-year" className="text-xs text-white/70">
              Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="travel-year" className="hover:bg-white hover:border-bc-1/30">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sending-church">Sending Church</Label>
        <Input
          id="sending-church"
          value={church}
          onChange={(e) => setChurch(e.target.value)}
          placeholder="Enter sending church"
        />
      </div>
    </div>
  );
}
