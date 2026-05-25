"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RevenuePoint } from "../../domain";
import { tooltipMoneyFormatter } from "./formatters";
import { WidgetCardHeader } from "./WidgetCardHeader";

type RevenueTrendChartProps = {
  data: RevenuePoint[];
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <Card className="border-border/60">
      <WidgetCardHeader
        icon={TrendingUp}
        iconBg="bg-emerald-500/10"
        iconText="text-emerald-400"
        title="Revenue Trend"
        subtitle="Monthly invoiced revenue"
        href="/reports"
        hrefLabel="Reports"
      />
      <CardContent className="h-[300px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -16, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="revenue-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3, strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value) => [tooltipMoneyFormatter(value as number), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#revenue-gradient)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "#10b981" }}
              isAnimationActive
              animationBegin={120}
              animationDuration={1100}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
