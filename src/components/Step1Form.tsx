"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    if (initialValues?.missionerName !== undefined) {
      setMissionerName(initialValues.missionerName);
    }
    if (initialValues?.nation !== undefined) {
      setNation(initialValues.nation);
    }
    if (initialValues?.date !== undefined) {
      const dateValue = initialValues.date instanceof Date ? initialValues.date : new Date(initialValues.date as any);
      // Validate: if date is in the past, don't set it
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateValue >= today) {
        setDate(dateValue);
      } else {
        setDate(undefined);
      }
    }
    if (initialValues?.church !== undefined) {
      setChurch(initialValues.church);
    }
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
        <Label htmlFor="travel-date">Travel Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="travel-date"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal hover:bg-white hover:border-bc-1/30",
                !date && "text-bc-3",
              )}
            >
              <CalendarIcon className={cn("mr-2 h-4 w-4", !date ? "text-bc-3" : "")} />
              {date ? format(date, "PPP") : <span className="text-bc-3">Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="rounded-md border w-[350px]"
            />
          </PopoverContent>
        </Popover>
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
