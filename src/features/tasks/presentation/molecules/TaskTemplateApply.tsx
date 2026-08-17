"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasksApp } from "@/di";
import { applyTaskTemplate, tasksKeys } from "@/tasks/application";
import { useInstantTaskTemplates } from "../hooks/data/useInstantTaskTemplates";

export function TaskTemplateApply({ leadId }: { leadId: number }) {
  const ctx = useTasksApp();
  const queryClient = useQueryClient();
  const { templates, isLoading } = useInstantTaskTemplates();
  const [templateId, setTemplateId] = useState<string>("");
  const mutation = useMutation({
    mutationFn: () => applyTaskTemplate(ctx, Number(templateId), leadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      setTemplateId("");
    },
  });

  if (isLoading || templates.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5">
      <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <Select value={templateId} onValueChange={setTemplateId}>
        <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Apply template" /></SelectTrigger>
        <SelectContent>
          {templates.map((template) => <SelectItem key={template.id} value={String(template.id)}>{template.name} · {template.items.length}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" variant="outline" className="h-8 px-2" disabled={!templateId || mutation.isPending} onClick={() => mutation.mutate()} aria-label="Apply selected task template">
        <Play className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
