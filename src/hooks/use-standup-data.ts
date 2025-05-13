'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DailyEntry, TeamMember, CapacityFlag } from '@/types';
import { MOCK_TEAM_MEMBERS, MOCK_INITIAL_DAILY_ENTRIES, CAPACITY_OPTIONS } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Simulate API latency
const API_LATENCY = 500;

export function useStandupData(initialDate: Date = new Date()) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const formatDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

  // Simulate fetching data
  const fetchDailyEntries = useCallback(async (date: Date) => {
    setIsLoading(true);
    console.log(`Fetching entries for ${formatDateKey(date)}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, API_LATENCY));
    
    const storedEntries = localStorage.getItem(`dailyEntries-${formatDateKey(date)}`);
    if (storedEntries) {
      setDailyEntries(JSON.parse(storedEntries));
    } else {
      // For demo, if no stored data for the selected date, use MOCK_INITIAL_DAILY_ENTRIES if it's today,
      // otherwise generate empty entries.
      if (formatDateKey(date) === formatDateKey(new Date())) {
        setDailyEntries(MOCK_INITIAL_DAILY_ENTRIES);
      } else {
        const newEntries = teamMembers.map(member => ({
          id: `${formatDateKey(date)}-${member.id}`,
          date: formatDateKey(date),
          memberId: member.id,
          planText: '',
          capacityFlag: CAPACITY_OPTIONS[0].value as CapacityFlag,
        }));
        setDailyEntries(newEntries);
      }
    }
    setIsLoading(false);
  }, [teamMembers]);

  useEffect(() => {
    fetchDailyEntries(selectedDate);
  }, [selectedDate, fetchDailyEntries]);

  // Simulate autosave
  useEffect(() => {
    if (isLoading || dailyEntries.length === 0) return; // Don't save initial load or empty data immediately

    const timer = setTimeout(async () => {
      if (dailyEntries.length > 0) { // Only save if there's something to save
        setIsSaving(true);
        console.log(`Autosaving entries for ${formatDateKey(selectedDate)}`);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, API_LATENCY));
        localStorage.setItem(`dailyEntries-${formatDateKey(selectedDate)}`, JSON.stringify(dailyEntries));
        setIsSaving(false);
        toast({
          title: "Saved ✓",
          description: `Stand-up data for ${format(selectedDate, 'PPP')} saved.`,
          duration: 3000,
        });
      }
    }, 3000); // Autosave after 3 seconds of inactivity (simplified)

    return () => clearTimeout(timer);
  }, [dailyEntries, selectedDate, toast, isLoading]);

  const updateDailyEntry = (memberId: string, planText: string, capacityFlag: CapacityFlag) => {
    setDailyEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.memberId === memberId && entry.date === formatDateKey(selectedDate)
          ? { ...entry, planText, capacityFlag }
          : entry
      )
    );
  };
  
  const handleDateChange = (date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return {
    selectedDate,
    handleDateChange,
    teamMembers,
    dailyEntries,
    isLoading,
    isSaving,
    updateDailyEntry,
    capacityOptions: CAPACITY_OPTIONS,
  };
}
