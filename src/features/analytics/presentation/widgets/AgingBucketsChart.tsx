"use client";

import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Hourglass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AgingBucket } from "../../domain";
import { tooltipMoneyFormatter } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type AgingBucketsChartProps = {
  data: AgingBucket[];
};

const AGING_COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#b91c1c"];

export function AgingBucketsChart({ data }: AgingBucketsChartProps) {
  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={Hourglass}
        iconBg="bg-amber-500/10"
        iconText="text-amber-400"
        title="A/R Aging Buckets"
        subtitle="Receivables by overdue period"
        href="/reports"
        hrefLabel="Reports"
      />
      <CardContent className="h-[300px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.35 }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value) => [tooltipMoneyFormatter(value as number), "Balance"]}
            />
            <Bar
              dataKey="totalBalance"
              radius={[6, 6, 0, 0]}
              isAnimationActive
              animationBegin={80}
              animationDuration={900}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={AGING_COLORS[index % AGING_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
