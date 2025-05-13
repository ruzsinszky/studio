'use client';

import type { TeamMember, DailyEntry, CapacityFlag } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CapacityBadge from './capacity-badge';
import { MOCK_TEAM_MEMBERS, CAPACITY_OPTIONS } from '@/lib/mock-data'; // Assuming CAPACITY_OPTIONS is here
import Image from 'next/image';

interface TeamMemberRowProps {
  member: TeamMember;
  entry: DailyEntry | undefined;
  onUpdate: (memberId: string, planText: string, capacityFlag: CapacityFlag) => void;
  isSaving: boolean;
}

export default function TeamMemberRow({ member, entry, onUpdate, isSaving }: TeamMemberRowProps) {
  const currentPlan = entry?.planText || '';
  const currentCapacity = entry?.capacityFlag || CAPACITY_OPTIONS[0].value;

  const handlePlanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(member.id, e.target.value, currentCapacity);
  };

  const handleCapacityChange = (value: string) => {
    onUpdate(member.id, currentPlan, value as CapacityFlag);
  };

  return (
    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
      <td className="p-4 align-top">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint="person portrait" />
            <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{member.name}</span>
        </div>
      </td>
      <td className="p-4 align-top w-2/5">
        <Textarea
          value={currentPlan}
          onChange={handlePlanChange}
          placeholder={`What's ${member.name.split(' ')[0]}'s plan?`}
          className="min-h-[60px] text-sm"
          aria-label={`Plan for ${member.name}`}
        />
      </td>
      <td className="p-4 align-top">
        <Select value={currentCapacity} onValueChange={handleCapacityChange}>
          <SelectTrigger className="w-[180px]" aria-label={`Capacity for ${member.name}`}>
            <SelectValue placeholder="Select capacity" />
          </SelectTrigger>
          <SelectContent>
            {CAPACITY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                <CapacityBadge capacity={opt.value as CapacityFlag} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="p-4 align-top text-right">
        {isSaving && entry?.memberId === member.id && (
          <span className="text-xs text-muted-foreground italic">Saving...</span>
        )}
      </td>
    </tr>
  );
}
