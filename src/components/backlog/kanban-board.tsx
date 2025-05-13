'use client';

import type { KanbanBoardData, Task, KanbanColumn as ColumnType } from '@/types';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import KanbanColumn from './kanban-column';

interface KanbanBoardProps {
  boardData: KanbanBoardData;
  onDragEnd: (result: DropResult) => void;
}

export default function KanbanBoard({ boardData, onDragEnd }: KanbanBoardProps) {
  if (!boardData || !boardData.columnOrder || !boardData.columns || !boardData.tasks) {
    return <p className="text-muted-foreground">Kanban board data is not available or malformed.</p>;
  }
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {boardData.columnOrder.map(columnId => {
          const column = boardData.columns[columnId];
          if (!column) {
             console.warn(`Column with id ${columnId} not found in boardData.columns`);
             return null;
          }
          const tasks = column.taskIds.map(taskId => boardData.tasks[taskId]).filter(Boolean) as Task[];
          return (
            <KanbanColumn key={column.id} column={column} tasks={tasks} />
          );
        })}
      </div>
    </DragDropContext>
  );
}
