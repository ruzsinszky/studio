export type CapacityFlag = "available" | "partial" | "at_limit";

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string; // Optional: for a small avatar image
}

export interface DailyEntry {
  id: string; // combination of date and member_id usually
  date: string; // YYYY-MM-DD
  memberId: string;
  planText: string;
  capacityFlag: CapacityFlag;
}

export type TaskStatus = "To Do" | "In Progress" | "Review" | "Done" | "Blocked";

export interface Task {
  id: string; // Unique ID for the task
  jiraKey?: string; // e.g., PROJ-123
  summary: string;
  storyPoints: number;
  status: TaskStatus;
  assigneeId: string | null; // Corresponds to TeamMember.id
  dayLoaded?: string; // YYYY-MM-DD, when the task was loaded/imported
}

// For CSV import
export interface RawTaskFromNewItemsCSV {
  'Issue key': string;
  'Summary': string;
  'Story Points'?: string | number; // Optional and can be string
  // Add other fields from new-items.csv if necessary
}

export interface RawTaskFromStatusCSV {
  'Issue key': string;
  'Status': string;
  'Assignee'?: string; // Name or ID, needs mapping
  // Add other fields from status.csv if necessary
}

export interface JiraUpload {
  id: string;
  fileType: 'new-items' | 'status';
  uploadedAt: string; // ISO date string
  processedJson: Task[]; // Store the processed tasks
}

export interface KanbanColumn {
  id: string; // 'unassigned' or teamMember.id
  title: string;
  taskIds: string[];
}

export interface KanbanBoardData {
  tasks: Record<string, Task>;
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
}

export interface TeamMemberWithLoad extends TeamMember {
  currentLoad: number; // Sum of story points of tasks assigned (not 'Done')
  capacitySP?: number; // Max capacity in story points - might be derived from capacityFlag
}
