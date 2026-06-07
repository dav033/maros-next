"use client";

import {
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import { LeadTypeSwitcher } from "@/components/shared/LeadTypeSwitcher";
import { LeadType } from "@/leads/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  FolderKanban,
  Layers,
  Plus,
  Receipt,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";

export function ProjectsPageSkeleton({
  leadType = LeadType.CONSTRUCTION,
}: {
  leadType?: LeadType;
} = {}) {
  return (
    <EntityCrudPageTemplate
      header={
        <PageHeaderCard
          icon={FolderKanban}
          title="Projects"
          description="Track active work, invoices and project progress"
          rightSlot={
            <Button disabled aria-label="New Project" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          }
          belowSlot={<LeadTypeSwitcher currentType={leadType} basePath="/projects" />}
        />
      }
      toolbar={
        <PageToolbarCard icon={SlidersHorizontal} label="Filters & search">
          <div className="w-32 shrink-0">
            <Select disabled>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <SelectValue placeholder="Name" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects..."
              disabled
              className="pl-9 bg-background/60 border-border/60 h-9"
            />
          </div>
          <div className="w-36 shrink-0">
            <Select disabled>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <Filter className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="All progress" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
          <div className="w-36 shrink-0">
            <Select disabled>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <Receipt className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="All invoices" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
          <div className="w-36 shrink-0">
            <Select disabled>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <Layers className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="No grouping" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          </div>
        </PageToolbarCard>
      }
      isLoading={true}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}
