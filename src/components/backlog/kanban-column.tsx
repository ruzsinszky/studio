'use client';

import type { KanbanColumn as ColumnType, Task } from '@/types';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './task-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: ColumnType;
  tasks: Task[];
}

export default function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-72 md:w-80 bg-secondary/70 rounded-lg shadow">
      <h3 className="p-3 text-md font-semibold text-foreground border-b border-border sticky top-0 bg-secondary/70 z-10 rounded-t-lg">
        {column.title} ({tasks.length})
      </h3>
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <ScrollArea
            className={cn("flex-grow p-2 min-h-[200px]", snapshot.isDraggingOver ? "bg-primary/5" : "")}
            style={{minHeight: '400px'}}
          >
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="h-full"
            >
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
}
