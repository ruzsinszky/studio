'use client';

import type { TeamMember, Task } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_TEAM_MEMBERS } from '@/lib/mock-data';

interface WorkloadChartProps {
  tasks: Task[];
  teamMembers: TeamMember[];
}

// Define colors for team members for consistent chart display
const MEMBER_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28'];


export default function WorkloadChart({ tasks, teamMembers = MOCK_TEAM_MEMBERS }: WorkloadChartProps) {
  const activeTasks = tasks.filter(task => task.status !== 'Done');

  const workloadData = teamMembers.map((member, index) => {
    const memberTasks = activeTasks.filter(task => task.assigneeId === member.id);
    const totalStoryPoints = memberTasks.reduce((sum, task) => sum + task.storyPoints, 0);
    return {
      name: member.name.split(' ')[0], // Display first name for brevity
      storyPoints: totalStoryPoints,
      fill: MEMBER_COLORS[index % MEMBER_COLORS.length], // Assign a color
    };
  });

  if (teamMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members available to display workload.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload (Active Story Points)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workloadData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fill: 'hsl(var(--foreground))' }} />
            <YAxis tick={{ fill: 'hsl(var(--foreground))' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }}/>
            <Bar dataKey="storyPoints" name="Story Points">
              {workloadData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
