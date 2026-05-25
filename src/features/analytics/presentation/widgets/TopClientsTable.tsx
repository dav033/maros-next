"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInstantProjects } from "@/project";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopClient } from "../../domain";
import { money } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type TopClientsTableProps = {
  data: TopClient[];
  by: "revenue" | "volume";
  onByChange: (by: "revenue" | "volume") => void;
};

function normalizeProjectNumber(value: string): string {
  return value
    .replace(/^\[|\]$/g, "")
    .trim()
    .toUpperCase();
}

function extractProjectNumberCandidates(value: string | null | undefined): string[] {
  if (!value) return [];

  const raw = value.trim();
  if (!raw) return [];

  const candidates = new Set<string>();
  const add = (candidate: string | undefined) => {
    if (!candidate) return;
    const normalized = normalizeProjectNumber(candidate);
    if (normalized) {
      candidates.add(normalized);
    }
  };

  add(raw);
  add(raw.split(",")[0]);

  const bracketMatch = raw.match(/\[([^\]]+)\]/);
  if (bracketMatch?.[1]) {
    add(bracketMatch[1]);
  }

  return [...candidates];
}

function resolveProjectHref(
  client: TopClient,
  projectNumberToId: Map<string, number>,
): string | null {
  const lookupSources = [client.projectNumber, client.customerName, client.jobId];

  for (const source of lookupSources) {
    for (const candidate of extractProjectNumberCandidates(source)) {
      const projectId = projectNumberToId.get(candidate);
      if (typeof projectId === "number" && projectId > 0) {
        return `/project/${projectId}`;
      }
    }
  }

  const numeric = Number.parseInt(client.jobId, 10);
  if (Number.isFinite(numeric) && numeric > 0) {
    return `/project/${numeric}`;
  }

  return null;
}

export function TopClientsTable({ data, by, onByChange }: TopClientsTableProps) {
  const router = useRouter();
  const { projects } = useInstantProjects();
  const sortLabel = by === "revenue" ? "Sorted by total invoiced" : "Sorted by invoice count";
  const projectNumberToId = useMemo(() => {
    const map = new Map<string, number>();

    for (const project of projects ?? []) {
      const projectId = Number(project.id) || 0;
      if (projectId <= 0) continue;

      for (const candidate of extractProjectNumberCandidates(project.lead?.leadNumber)) {
        map.set(candidate, projectId);
      }
    }

    return map;
  }, [projects]);

  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={Crown}
        iconBg="bg-amber-500/10"
        iconText="text-amber-400"
        title="Top Clients"
        subtitle={sortLabel}
        rightSlot={
          <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/40 p-1">
            <Button
              type="button"
              size="sm"
              variant={by === "revenue" ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => onByChange("revenue")}
            >
              Revenue
            </Button>
            <Button
              type="button"
              size="sm"
              variant={by === "volume" ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => onByChange("volume")}
            >
              Volume
            </Button>
          </div>
        }
      />
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 text-xs uppercase tracking-wide text-muted-foreground">#</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Client</TableHead>
              <TableHead className="text-xs uppercase tracking-wide text-muted-foreground">Project</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                Invoiced
              </TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wide text-muted-foreground">
                Invoices
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((client, index) => {
              const href = resolveProjectHref(client, projectNumberToId);
              const isClickable = Boolean(href);
              return (
                <TableRow
                  key={`${client.customerName}-${client.jobId}`}
                  className={`transition-colors ${
                    isClickable ? "cursor-pointer hover:bg-primary/5" : "hover:bg-muted/40"
                  }`}
                  onClick={() => href && router.push(href)}
                  onKeyDown={(event) => {
                    if (!href) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  tabIndex={isClickable ? 0 : -1}
                  role={isClickable ? "link" : undefined}
                  title={isClickable ? "View project details" : undefined}
                >
                  <TableCell className="text-xs font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-medium">{client.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{client.projectNumber ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">{money.format(client.totalInvoiced)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{client.invoiceCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
