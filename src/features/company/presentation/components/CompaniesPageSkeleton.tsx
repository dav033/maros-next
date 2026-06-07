"use client";

import {
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building,
  Building2,
  Layers,
  Plus,
  Search,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";
import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";

export function CompaniesPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <PageHeaderCard
          icon={Building2}
          title="Companies"
          description="Manage companies, services and accounts"
          rightSlot={
            <>
              <Button
                disabled
                variant="outline"
                aria-label="Manage services"
                className="h-9 gap-2"
              >
                <Wrench className="h-4 w-4" />
                Services
              </Button>
              <Button disabled aria-label="New company" className="h-9 gap-2">
                <Plus className="h-4 w-4" />
                New company
              </Button>
            </>
          }
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
              placeholder="Search companies..."
              disabled
              className="pl-9 bg-background/60 border-border/60 h-9"
            />
          </div>
          <Select disabled>
            <SelectTrigger className="w-44 bg-background/60 border-border/60 h-9 text-xs">
              <Building className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent />
          </Select>
          <Select disabled>
            <SelectTrigger className="w-36 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent />
          </Select>
          <Select disabled>
            <SelectTrigger className="w-36 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="All suppliers" />
            </SelectTrigger>
            <SelectContent />
          </Select>
          <Select disabled>
            <SelectTrigger className="w-40 bg-background/60 border-border/60 h-9 text-xs">
              <Layers className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="No grouping" />
            </SelectTrigger>
            <SelectContent />
          </Select>
        </PageToolbarCard>
      }
      isLoading={true}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}
