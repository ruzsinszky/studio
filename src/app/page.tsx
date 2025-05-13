'use client';

import { useRef } from 'react';
import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Download, Edit2, Save } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useStandupData } from '@/hooks/use-standup-data';
import TeamMemberRow from '@/components/standup/team-member-row';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { exportToPng } from '@/lib/utils';

export default function DailyStandupPage() {
  const {
    selectedDate,
    handleDateChange,
    teamMembers,
    dailyEntries,
    isLoading,
    isSaving,
    updateDailyEntry,
  } = useStandupData();

  const standupBoardRef = useRef<HTMLDivElement>(null);

  const handleExportPng = async () => {
    if (standupBoardRef.current) {
      await exportToPng(standupBoardRef.current, `standup-board-${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
             {isSaving && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Save className="mr-1 h-4 w-4 animate-spin" />
                  Saving...
                </div>
              )}
          </div>
          <Button onClick={handleExportPng} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Export as PNG
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit2 className="h-6 w-6 text-primary" />
              Daily Plan & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={standupBoardRef} className="bg-card p-4 rounded-md"> {/* Added padding for PNG export */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left font-medium text-muted-foreground">Team Member</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Today's Plan</th>
                      <th className="p-4 text-left font-medium text-muted-foreground">Capacity</th>
                      <th className="p-4 text-right font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: teamMembers.length }).map((_, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4"><Skeleton className="h-10 w-40" /></td>
                          <td className="p-4"><Skeleton className="h-16 w-full" /></td>
                          <td className="p-4"><Skeleton className="h-10 w-32" /></td>
                          <td className="p-4"><Skeleton className="h-6 w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      teamMembers.map(member => {
                        const entry = dailyEntries.find(
                          e => e.memberId === member.id && e.date === format(selectedDate, 'yyyy-MM-dd')
                        );
                        return (
                          <TeamMemberRow
                            key={member.id}
                            member={member}
                            entry={entry}
                            onUpdate={updateDailyEntry}
                            isSaving={isSaving}
                          />
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
