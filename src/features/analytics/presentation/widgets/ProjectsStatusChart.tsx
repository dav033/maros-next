"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ProjectsStatusBucket } from "../../domain";
import { WidgetCardHeader } from "./WidgetCardHeader";

// Seven slots because the chart indexes COLORS[i % COLORS.length] and
// ProjectProgressStatus already has six members: with five, the sixth status
// would repeat the first one's color in the pie and in the legend.
const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
  "hsl(var(--chart-7))",
];

type ProjectsStatusChartProps = {
  data: ProjectsStatusBucket[];
};

function StatusTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProjectsStatusBucket; value: number }>;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
  return (
    <div className="space-y-0.5 rounded-md border border-border bg-popover p-2.5 text-xs shadow-md">
      <p className="font-semibold text-foreground">{item.status}</p>
      <p className="text-muted-foreground">
        <span className="font-mono font-medium tabular-nums text-foreground">{item.count}</span> projects ·{" "}
        <span className="font-mono tabular-nums">{pct}%</span>
      </p>
    </div>
  );
}

export function ProjectsStatusChart({ data }: ProjectsStatusChartProps) {
  const chartData = data.filter((item) => item.count > 0);
  const total = chartData.reduce((acc, item) => acc + item.count, 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-line">
        <WidgetCardHeader
          icon={PieChartIcon}
          iconBg="bg-sky-500/10"
          iconText="text-sky-400"
          title="Projects by Status"
          subtitle="Active project distribution"
          href="/projects"
          hrefLabel="Projects"
        />
        <CardContent className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
          No projects with status yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-line">
      <WidgetCardHeader
        icon={PieChartIcon}
        iconBg="bg-sky-500/10"
        iconText="text-sky-400"
        title="Projects by Status"
        subtitle={`${total} active projects in total`}
        href="/projects"
        hrefLabel="Projects"
      />
      <CardContent className="h-[300px] pt-2">
        <div className="grid h-full grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={62}
                outerRadius={100}
                paddingAngle={2}
                stroke="hsl(var(--card))"
                strokeWidth={2}
                isAnimationActive
                animationBegin={120}
                animationDuration={950}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip total={total} />} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="space-y-1.5 self-center pr-2 text-xs">
            {chartData.map((item, index) => {
              const pct = total > 0 ? ((item.count / total) * 100).toFixed(0) : "0";
              return (
                <li key={item.status} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">{item.status}</span>
                  <span className="ml-auto font-mono font-medium tabular-nums text-foreground">{item.count}</span>
                  <span className="w-8 text-right font-mono tabular-nums text-muted-foreground">{pct}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
