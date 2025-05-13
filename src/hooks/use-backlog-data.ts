'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Task, TeamMember, KanbanBoardData, KanbanColumn, RawTaskFromNewItemsCSV, RawTaskFromStatusCSV, DailyEntry, TeamMemberWithLoad, CapacityFlag } from '@/types';
import { MOCK_TEAM_MEMBERS, MOCK_INITIAL_TASKS, getCapacityInStoryPoints } from '@/lib/mock-data';
import { parseCsvData, processUploadedCsvs } from '@/lib/utils';
import { type DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/components/ui/use-toast';
import { balanceBacklog, type BalanceBacklogInput, type BalanceBacklogOutput } from '@/ai/flows/balance-backlog-suggestions';
import { format } from 'date-fns';

const initialBoardData = (tasks: Task[], teamMembers: TeamMember[]): KanbanBoardData => {
  const taskMap = tasks.reduce((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {} as Record<string, Task>);

  const unassignedColumn: KanbanColumn = {
    id: 'unassigned',
    title: 'Unassigned',
    taskIds: tasks.filter(task => !task.assigneeId).map(task => task.id),
  };

  const memberColumns: KanbanColumn[] = teamMembers.map(member => ({
    id: member.id,
    title: member.name,
    taskIds: tasks.filter(task => task.assigneeId === member.id).map(task => task.id),
  }));

  const columns = [unassignedColumn, ...memberColumns].reduce((acc, col) => {
    acc[col.id] = col;
    return acc;
  }, {} as Record<string, KanbanColumn>);

  const columnOrder = [unassignedColumn.id, ...teamMembers.map(member => member.id)];
  
  return {
    tasks: taskMap,
    columns,
    columnOrder,
  };
};


export function useBacklogData() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_INITIAL_TASKS);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [boardData, setBoardData] = useState<KanbanBoardData>(() => initialBoardData(MOCK_INITIAL_TASKS, MOCK_TEAM_MEMBERS));
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<BalanceBacklogOutput | null>(null);
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([]); // To get capacity flags
  const { toast } = useToast();

  // Effect to load daily entries for capacity information
  useEffect(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const storedEntries = localStorage.getItem(`dailyEntries-${todayKey}`);
    if (storedEntries) {
      setDailyEntries(JSON.parse(storedEntries));
    } else {
      // Fallback to mock if nothing for today (usually set by standup page)
      const mockTodayEntries = MOCK_TEAM_MEMBERS.map(member => ({
        id: `${todayKey}-${member.id}`,
        date: todayKey,
        memberId: member.id,
        planText: '',
        capacityFlag: 'available' as CapacityFlag, 
      }));
      setDailyEntries(mockTodayEntries);
    }
  }, []);

  const updateTasksAndBoard = useCallback((newTasks: Task[]) => {
    setTasks(newTasks);
    setBoardData(initialBoardData(newTasks, teamMembers));
  }, [teamMembers]);
  
  const handleCsvUpload = async (newItemsFile: File, statusFile: File) => {
    setIsLoadingCsv(true);
    try {
      const newItemsCsvText = await newItemsFile.text();
      const statusCsvText = await statusFile.text();

      const rawNewItems = await parseCsvData<RawTaskFromNewItemsCSV>(newItemsCsvText);
      const rawStatus = await parseCsvData<RawTaskFromStatusCSV>(statusCsvText);
      
      const processed = processUploadedCsvs(rawNewItems, rawStatus, teamMembers);
      updateTasksAndBoard(processed);
      toast({ title: "CSV files processed successfully!", description: `${processed.length} tasks loaded.` });
    } catch (error) {
      console.error("Error processing CSVs:", error);
      toast({ title: "CSV Processing Error", description: (error as Error).message, variant: "destructive" });
      // Optionally revert to MOCK_INITIAL_TASKS or keep current state on error
      // updateTasksAndBoard(MOCK_INITIAL_TASKS); 
    } finally {
      setIsLoadingCsv(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startColumn = boardData.columns[source.droppableId];
    const finishColumn = boardData.columns[destination.droppableId];

    if (!startColumn || !finishColumn) return;
    
    let newBoardData = { ...boardData };

    // Moving within the same column
    if (startColumn.id === finishColumn.id) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newColumn = { ...startColumn, taskIds: newTaskIds };
      newBoardData = {
        ...newBoardData,
        columns: { ...newBoardData.columns, [newColumn.id]: newColumn },
      };
    } else {
      // Moving to a different column
      const startTaskIds = Array.from(startColumn.taskIds);
      startTaskIds.splice(source.index, 1);
      const newStartColumn = { ...startColumn, taskIds: startTaskIds };

      const finishTaskIds = Array.from(finishColumn.taskIds);
      finishTaskIds.splice(destination.index, 0, draggableId);
      const newFinishColumn = { ...finishColumn, taskIds: finishTaskIds };
      
      // Update task assignee
      const movedTask = newBoardData.tasks[draggableId];
      if (movedTask) {
        movedTask.assigneeId = finishColumn.id === 'unassigned' ? null : finishColumn.id;
        newBoardData.tasks[draggableId] = movedTask; // update task in the main tasks map
      }
      
      newBoardData = {
        ...newBoardData,
        columns: {
          ...newBoardData.columns,
          [newStartColumn.id]: newStartColumn,
          [newFinishColumn.id]: newFinishColumn,
        },
      };
    }
    setBoardData(newBoardData);
    // Update the main tasks array to reflect assignee changes for other components like charts
    setTasks(Object.values(newBoardData.tasks));
  };

  const triggerAiBalancing = async () => {
    setIsLoadingAi(true);
    setAiSuggestions(null);

    const teamMembersWithCapacity: TeamMemberWithLoad[] = teamMembers.map(member => {
      const entry = dailyEntries.find(e => e.memberId === member.id);
      const capacityFlag = entry ? entry.capacityFlag : 'available'; // Default if no entry
      const capacity = getCapacityInStoryPoints(capacityFlag);
      const currentLoad = Object.values(boardData.tasks)
        .filter(task => task.assigneeId === member.id && task.status !== 'Done')
        .reduce((sum, task) => sum + task.storyPoints, 0);
      return { ...member, capacity, currentLoad };
    });
    
    const backlogTasks = Object.values(boardData.tasks).map(task => ({
      id: task.id,
      name: task.summary,
      storyPoints: task.storyPoints,
      assigneeId: task.assigneeId,
    }));

    const input: BalanceBacklogInput = {
      teamMembers: teamMembersWithCapacity.map(tm => ({id: tm.id, name: tm.name, capacity: tm.capacitySP || tm.capacity || 0, currentLoad: tm.currentLoad})),
      tasks: backlogTasks,
    };

    try {
      const result = await balanceBacklog(input);
      setAiSuggestions(result);
      toast({ title: "AI Suggestions Ready", description: result.summary });
    } catch (error) {
      console.error("AI Balancing Error:", error);
      toast({ title: "AI Balancing Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };
  
  const applyAiSuggestions = () => {
    if (!aiSuggestions) return;

    let newTasksState = { ...boardData.tasks };
    aiSuggestions.suggestions.forEach(suggestion => {
      if (newTasksState[suggestion.taskId]) {
        newTasksState[suggestion.taskId].assigneeId = suggestion.assigneeId;
      }
    });
    updateTasksAndBoard(Object.values(newTasksState)); // This re-initializes boardData
    setAiSuggestions(null); // Clear suggestions after applying
    toast({ title: "AI Suggestions Applied", description: "Backlog assignments updated." });
  };


  return {
    tasks: Object.values(boardData.tasks), // Provide the latest tasks array
    teamMembers,
    boardData,
    isLoadingCsv,
    isLoadingAi,
    aiSuggestions,
    handleCsvUpload,
    onDragEnd,
    triggerAiBalancing,
    applyAiSuggestions,
    setAiSuggestions, // To allow closing modal without applying
  };
}
