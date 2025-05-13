import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Papa from 'papaparse';
import html2canvas from 'html2canvas';
import type { Task, RawTaskFromNewItemsCSV, RawTaskFromStatusCSV, TeamMember } from '@/types';
import { MOCK_TEAM_MEMBERS } from './mock-data'; // For assignee name to ID mapping

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// CSV Processing
export const parseCsvData = <T>(csvString: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error("CSV Parsing errors:", results.errors);
          // For partial success, can return results.data, but strict parsing might reject.
          // For now, let's reject on any error for simplicity.
          reject(new Error(`CSV parsing failed: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        console.error("CSV Parsing fatal error:", error);
        reject(error);
      }
    });
  });
};


export const processUploadedCsvs = (
  newItemsCsvData: RawTaskFromNewItemsCSV[],
  statusCsvData: RawTaskFromStatusCSV[],
  teamMembers: TeamMember[] = MOCK_TEAM_MEMBERS // Default to mock for now
): Task[] => {
  const tasksMap: Map<string, Partial<Task>> = new Map();

  // Helper to find member ID by name (simplified)
  const getMemberIdByName = (name: string | undefined): string | null => {
    if (!name) return null;
    const member = teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
    return member ? member.id : null;
  };

  newItemsCsvData.forEach(item => {
    if (item['Issue key']) {
      tasksMap.set(item['Issue key'], {
        jiraKey: item['Issue key'],
        summary: item['Summary'] || 'No summary',
        storyPoints: Number(item['Story Points']) || 0,
      });
    }
  });

  statusCsvData.forEach(item => {
    if (item['Issue key']) {
      const existingTask = tasksMap.get(item['Issue key']) || {};
      tasksMap.set(item['Issue key'], {
        ...existingTask,
        jiraKey: item['Issue key'], // Ensure jiraKey is present
        status: (item['Status'] as Task['status']) || 'To Do', // Cast and provide default
        assigneeId: getMemberIdByName(item['Assignee']),
      });
    }
  });
  
  let taskIdCounter = 1;
  const processedTasks: Task[] = [];
  
  tasksMap.forEach((partialTask, jiraKey) => {
    // Ensure all required fields have defaults if not present
    processedTasks.push({
      id: partialTask.id || `task-${taskIdCounter++}`, // Generate ID if missing
      jiraKey: jiraKey,
      summary: partialTask.summary || 'No summary provided',
      storyPoints: partialTask.storyPoints || 0,
      status: partialTask.status || 'To Do',
      assigneeId: partialTask.assigneeId !== undefined ? partialTask.assigneeId : null, // Ensure null if undefined
      dayLoaded: partialTask.dayLoaded || new Date().toISOString().split('T')[0],
    });
  });

  return processedTasks;
};


// PNG Export
export const exportToPng = async (element: HTMLElement, fileName: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // If you have external images
      logging: true,
    });
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = image;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    // Potentially show a toast to the user
    alert('Failed to export as PNG. See console for details.');
  }
};


// CSV Export
export const exportTasksToCsv = (tasks: Task[], teamMembers: TeamMember[], fileName: string) => {
  const getAssigneeName = (assigneeId: string | null) => {
    if (!assigneeId) return '';
    return teamMembers.find(m => m.id === assigneeId)?.name || '';
  };

  const csvData = tasks.map(task => ({
    'Issue key': task.jiraKey || '',
    'Summary': task.summary,
    'Story Points': task.storyPoints,
    'Status': task.status,
    'Assignee': getAssigneeName(task.assigneeId),
  }));

  const csvString = Papa.unparse(csvData);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
