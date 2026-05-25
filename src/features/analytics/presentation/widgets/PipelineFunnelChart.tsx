"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { PipelineBucket } from "../../domain";
import { money } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type PipelineFunnelChartProps = {
  data: PipelineBucket[];
};

type PipelineTooltipPayload = {
  payload: PipelineBucket;
};

function PipelineTooltip({ active, payload }: { active?: boolean; payload?: PipelineTooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="space-y-1 rounded-md border border-border bg-popover p-2.5 text-xs shadow-md">
      <p className="font-semibold text-foreground">{item.status}</p>
      <p className="text-muted-foreground">
        Count: <span className="font-medium text-foreground">{item.count}</span>
      </p>
      <p className="text-muted-foreground">
        Estimated: <span className="font-medium text-foreground">{money.format(item.estimatedValue)}</span>
      </p>
    </div>
  );
}

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={Workflow}
        title="Pipeline by Status"
        subtitle="Leads distribution across stages"
        href="/leads"
        hrefLabel="Leads"
      />
      <CardContent className="h-[300px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="status" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "hsl(var(--accent))", opacity: 0.35 }} content={<PipelineTooltip />} />
            <Bar
              dataKey="count"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationBegin={80}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
