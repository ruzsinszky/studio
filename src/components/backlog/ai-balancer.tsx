'use client';

import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, ListChecks } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { BalanceBacklogOutput } from '@/ai/flows/balance-backlog-suggestions';
import type { TeamMember, Task } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';

interface AiBalancerProps {
  onTriggerAiBalancing: () => void;
  onApplySuggestions: () => void;
  isLoading: boolean;
  suggestions: BalanceBacklogOutput | null;
  teamMembers: TeamMember[];
  tasks: Task[];
  onCloseModal: () => void;
}

export default function AiBalancer({ 
  onTriggerAiBalancing, 
  onApplySuggestions, 
  isLoading, 
  suggestions,
  teamMembers,
  tasks,
  onCloseModal
}: AiBalancerProps) {

  const getTaskName = (taskId: string) => tasks.find(t => t.id === taskId)?.summary || taskId;
  const getMemberName = (memberId: string) => teamMembers.find(m => m.id === memberId)?.name || memberId;

  return (
    <>
      <Button onClick={onTriggerAiBalancing} disabled={isLoading} variant="outline">
        <Bot className="mr-2 h-4 w-4" />
        {isLoading ? 'Balancing...' : 'Get AI Balancing Suggestions'}
      </Button>

      {suggestions && (
        <Dialog open={!!suggestions} onOpenChange={(open) => { if(!open) onCloseModal(); }}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ListChecks className="h-6 w-6 text-primary" />
                AI Backlog Balancing Suggestions
              </DialogTitle>
              <DialogDescription>
                {suggestions.summary}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[50vh] p-1 pr-4">
              <div className="space-y-4 py-4">
                {suggestions.suggestions.length > 0 ? (
                  suggestions.suggestions.map((suggestion, index) => (
                    <div key={index} className="p-3 border rounded-md bg-card hover:shadow-md transition-shadow">
                      <p className="font-medium text-sm">
                        Move task <Badge variant="secondary">{getTaskName(suggestion.taskId)}</Badge>
                        {' to '}
                        <Badge>{getMemberName(suggestion.assigneeId)}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No specific re-assignment suggestions at this time. The backlog seems relatively balanced or no optimal moves found.</p>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              {suggestions.suggestions.length > 0 && (
                <Button type="button" onClick={onApplySuggestions}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply Suggestions
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
