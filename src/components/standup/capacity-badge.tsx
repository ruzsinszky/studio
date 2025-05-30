import type { CapacityFlag } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { CAPACITY_OPTIONS } from '@/lib/mock-data';

interface CapacityBadgeProps {
  capacity: CapacityFlag;
}

export default function CapacityBadge({ capacity }: CapacityBadgeProps) {
  const option = CAPACITY_OPTIONS.find(opt => opt.value === capacity);

  if (!option) return null;

  const Icon = 
    capacity === 'available' ? CheckCircle :
    capacity === 'partial' ? AlertTriangle : XCircle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        option.color, // This is the background color class e.g. bg-green-500
        option.color.includes('bg-') ? 'text-foreground' : option.iconColor // Use text-foreground for label on colored backgrounds
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', option.color.includes('bg-') ? 'text-foreground' : option.iconColor)} /> {/* Use text-foreground for icon */}
      {option.label}
    </span>
  );
}
