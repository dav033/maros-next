"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LeadsPerMonthPoint } from "../../domain";
import { WidgetCardHeader } from "./WidgetCardHeader";

type LeadsPerMonthChartProps = {
  data: LeadsPerMonthPoint[];
};

export function LeadsPerMonthChart({ data }: LeadsPerMonthChartProps) {
  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={CalendarDays}
        iconBg="bg-sky-500/10"
        iconText="text-sky-400"
        title="Leads per Month"
        subtitle="New leads created each month"
        href="/leads"
        hrefLabel="Leads"
      />
      <CardContent className="h-[300px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "hsl(var(--accent))", opacity: 0.35 }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value) => [String(value), "Leads"]}
            />
            <Bar
              dataKey="count"
              fill="#38bdf8"
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
