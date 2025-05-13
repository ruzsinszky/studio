'use server';

/**
 * @fileOverview Provides AI-powered suggestions for balancing the backlog by re-assigning tasks, taking into account team member capacity and story points.
 *
 * - balanceBacklog - A function that handles the backlog balancing process.
 * - BalanceBacklogInput - The input type for the balanceBacklog function.
 * - BalanceBacklogOutput - The return type for the balanceBacklog function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BalanceBacklogInputSchema = z.object({
  teamMembers: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the team member.'),
      name: z.string().describe('The name of the team member.'),
      capacity: z
        .number()
        .describe('The available capacity of the team member in story points.'),
      currentLoad: z
        .number()
        .describe('The current workload of the team member in story points.'),
    })
  ).describe('The list of team members with their capacity and current workload.'),
  tasks: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the task.'),
      name: z.string().describe('The name or summary of the task.'),
      storyPoints: z.number().describe('The story points associated with the task.'),
      assigneeId: z
        .string()
        .nullable()
        .describe('The id of the team member the task is assigned to, or null if unassigned.'),
    })
  ).describe('The list of tasks to be assigned or re-assigned.'),
});
export type BalanceBacklogInput = z.infer<typeof BalanceBacklogInputSchema>;

const BalanceBacklogOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      taskId: z.string().describe('The ID of the task to re-assign.'),
      assigneeId: z.string().describe('The ID of the team member to assign the task to.'),
      reason: z.string().describe('The reason for this assignment suggestion.'),
    })
  ).describe('A list of suggestions for balancing the backlog.'),
  summary: z.string().describe('A summary of the changes and the overall balance.'),
});
export type BalanceBacklogOutput = z.infer<typeof BalanceBacklogOutputSchema>;

export async function balanceBacklog(input: BalanceBacklogInput): Promise<BalanceBacklogOutput> {
  return balanceBacklogFlow(input);
}

const balanceBacklogPrompt = ai.definePrompt({
  name: 'balanceBacklogPrompt',
  input: {schema: BalanceBacklogInputSchema},
  output: {schema: BalanceBacklogOutputSchema},
  prompt: `You are a delivery lead assistant. Your task is to provide suggestions for balancing the backlog by re-assigning tasks to team members.

  Consider the capacity of each team member and the story points associated with each task.  Provide a list of suggestions for re-assigning tasks to balance the workload across the team.

  Team Members:
  {{#each teamMembers}}
  - Name: {{name}}, ID: {{id}}, Capacity: {{capacity}}, Current Load: {{currentLoad}}
  {{/each}}

  Tasks:
  {{#each tasks}}
  - Name: {{name}}, ID: {{id}}, Story Points: {{storyPoints}}, Assignee ID: {{assigneeId}}
  {{/each}}

  Based on the team member capacities and current loads, and the story points of the tasks, suggest optimal re-assignments to balance the workload. Explain the reasoning for each suggestion.

  Ensure that the suggested assignee exists in the teamMembers array.

  Output your suggestions in JSON format.
  `,
});

const balanceBacklogFlow = ai.defineFlow(
  {
    name: 'balanceBacklogFlow',
    inputSchema: BalanceBacklogInputSchema,
    outputSchema: BalanceBacklogOutputSchema,
  },
  async input => {
    const {output} = await balanceBacklogPrompt(input);
    return output!;
  }
);
