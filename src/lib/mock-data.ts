import type { TeamMember, Task, DailyEntry, CapacityFlag, TaskStatus } from '@/types';

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'member-1', name: 'Alice Wonderland', avatarUrl: 'https://picsum.photos/seed/alice/40/40' },
  { id: 'member-2', name: 'Bob The Builder', avatarUrl: 'https://picsum.photos/seed/bob/40/40' },
  { id: 'member-3', name: 'Charlie Chaplin', avatarUrl: 'https://picsum.photos/seed/charlie/40/40' },
  { id: 'member-4', name: 'Diana Prince', avatarUrl: 'https://picsum.photos/seed/diana/40/40' },
];

export const MOCK_INITIAL_TASKS: Task[] = [
  { id: 'task-1', jiraKey: 'PROJ-101', summary: 'Setup project repository', storyPoints: 2, status: 'To Do', assigneeId: null },
  { id: 'task-2', jiraKey: 'PROJ-102', summary: 'Design user interface mockups', storyPoints: 5, status: 'In Progress', assigneeId: 'member-1' },
  { id: 'task-3', jiraKey: 'PROJ-103', summary: 'Develop login functionality', storyPoints: 8, status: 'To Do', assigneeId: 'member-2' },
  { id: 'task-4', jiraKey: 'PROJ-104', summary: 'Write API documentation', storyPoints: 3, status: 'Review', assigneeId: 'member-1' },
  { id: 'task-5', jiraKey: 'PROJ-105', summary: 'Implement payment gateway', storyPoints: 13, status: 'To Do', assigneeId: null },
  { id: 'task-6', jiraKey: 'PROJ-106', summary: 'Test user registration flow', storyPoints: 5, status: 'Done', assigneeId: 'member-3' },
  { id: 'task-7', jiraKey: 'PROJ-107', summary: 'Fix responsive layout bugs', storyPoints: 3, status: 'In Progress', assigneeId: 'member-4' },
];

const TODAY_ISO_STRING = new Date().toISOString().split('T')[0];

export const MOCK_INITIAL_DAILY_ENTRIES: DailyEntry[] = MOCK_TEAM_MEMBERS.map(member => ({
  id: `${TODAY_ISO_STRING}-${member.id}`,
  date: TODAY_ISO_STRING,
  memberId: member.id,
  planText: member.id === 'member-1' ? 'Working on PROJ-102, then PROJ-104 review.' : 
              member.id === 'member-2' ? 'Starting PROJ-103 development.' :
              member.id === 'member-3' ? 'Finalizing PROJ-106 tests, then available.' :
              'Continuing PROJ-107 bug fixes.',
  capacityFlag: member.id === 'member-3' ? 'available' : 
                  member.id === 'member-4' ? 'partial' : 'at_limit' as CapacityFlag,
}));

export const CAPACITY_OPTIONS: { value: CapacityFlag, label: string, color: string, iconColor: string }[] = [
  { value: 'available', label: 'Available', color: 'bg-green-500', iconColor: 'text-green-700' },
  { value: 'partial', label: 'Partial', color: 'bg-yellow-500', iconColor: 'text-yellow-700' },
  { value: 'at_limit', label: 'At Limit', color: 'bg-red-500', iconColor: 'text-red-700' },
];

export const TASK_STATUS_OPTIONS: TaskStatus[] = ["To Do", "In Progress", "Review", "Blocked", "Done"];
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  "To Do": "bg-blue-500",
  "In Progress": "bg-yellow-500",
  "Review": "bg-purple-500",
  "Blocked": "bg-red-700",
  "Done": "bg-green-600",
};

// This is a simplified capacity mapping for the AI tool.
// In a real app, this might be more dynamic or configured per user.
export const getCapacityInStoryPoints = (capacityFlag: CapacityFlag): number => {
  switch (capacityFlag) {
    case 'available': return 8; // e.g., Full day available
    case 'partial': return 4;   // Half day
    case 'at_limit': return 0;    // No more capacity
    default: return 0;
  }
};
