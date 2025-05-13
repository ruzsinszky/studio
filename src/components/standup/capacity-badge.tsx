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
        option.color,
        option.color.includes('bg-') ? 'text-white' : option.iconColor // Basic contrast logic
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', option.color.includes('bg-') ? 'text-white/80' : option.iconColor)} />
      {option.label}
    </span>
  );
}
