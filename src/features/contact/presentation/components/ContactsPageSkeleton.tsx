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
import { Layers, Plus, Search, SlidersHorizontal, Users } from "lucide-react";
import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";

export function ContactsPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <PageHeaderCard
          icon={Users}
          title="Contacts"
          description="Manage people and customers connected to your projects"
          rightSlot={
            <Button disabled aria-label="New contact" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New contact
            </Button>
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
              placeholder="Search contacts..."
              disabled
              className="pl-9 bg-background/60 border-border/60 h-9"
            />
          </div>
          <Select disabled>
            <SelectTrigger className="w-36 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent />
          </Select>
          <Select disabled>
            <SelectTrigger className="w-32 bg-background/60 border-border/60 h-9 text-xs">
              <SelectValue placeholder="All clients" />
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
      loadingContent={<ContactsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}
