'use client';

import AppLayout from '@/components/layout/app-layout';
import CsvUploader from '@/components/backlog/csv-uploader';
import WorkloadChart from '@/components/backlog/workload-chart';
import KanbanBoard from '@/components/backlog/kanban-board';
import AiBalancer from '@/components/backlog/ai-balancer';
import { useBacklogData } from '@/hooks/use-backlog-data';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, LayoutGrid, BarChartHorizontalBig, Bot } from 'lucide-react';
import { exportTasksToCsv } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BacklogPage() {
  const {
    tasks,
    teamMembers,
    boardData,
    isLoadingCsv,
    isLoadingAi,
    aiSuggestions,
    handleCsvUpload,
    onDragEnd,
    triggerAiBalancing,
    applyAiSuggestions,
    setAiSuggestions,
  } = useBacklogData();

  const handleExportCsv = () => {
    exportTasksToCsv(tasks, teamMembers, 'updated_assignments');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              Import & Export
            </CardTitle>
            <CardDescription>
              Upload your Jira CSV extracts and export updated assignments.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CsvUploader onFilesUploaded={handleCsvUpload} isLoading={isLoadingCsv} />
            <div className="flex flex-col justify-center items-start gap-4 p-6 border border-dashed border-border rounded-lg">
                <h3 className="text-lg font-medium">Actions</h3>
                <AiBalancer
                  onTriggerAiBalancing={triggerAiBalancing}
                  onApplySuggestions={applyAiSuggestions}
                  isLoading={isLoadingAi}
                  suggestions={aiSuggestions}
                  teamMembers={teamMembers}
                  tasks={tasks}
                  onCloseModal={() => setAiSuggestions(null)}
                />
                 <Button onClick={handleExportCsv} variant="outline" className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Updated Assignments (CSV)
                </Button>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="kanban" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="kanban" className="gap-1">
              <LayoutGrid className="h-4 w-4"/>Kanban Board
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-1">
              <BarChartHorizontalBig className="h-4 w-4"/>Workload Chart
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                  Backlog Kanban Board
                </CardTitle>
                <CardDescription>Drag and drop tasks to re-assign them. Workload chart updates automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <KanbanBoard boardData={boardData} onDragEnd={onDragEnd} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No tasks loaded. Please upload CSV files to populate the board.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="charts">
            <WorkloadChart tasks={tasks} teamMembers={teamMembers} />
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
