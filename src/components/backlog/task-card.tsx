'use client';

import type { Task } from '@/types';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_STATUS_COLORS } from '@/lib/mock-data';


interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const statusColor = TASK_STATUS_COLORS[task.status] || 'bg-gray-500';
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "mb-2 rounded-md shadow-sm hover:shadow-md transition-shadow",
            snapshot.isDragging ? "bg-primary/10 ring-2 ring-primary" : "bg-card"
          )}
        >
          <Card className="overflow-hidden">
            <CardHeader className="p-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-medium leading-tight">
                  {task.summary}
                </CardTitle>
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              {task.jiraKey && (
                <p className="text-xs text-muted-foreground pt-1">{task.jiraKey}</p>
              )}
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex justify-between items-center text-xs">
                <Badge variant="secondary" className="py-0.5 px-1.5">
                  {task.storyPoints} SP
                </Badge>
                <Badge className={cn("py-0.5 px-1.5 text-white", statusColor)}>{task.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
