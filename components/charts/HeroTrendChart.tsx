"use client";

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HeroTrendPoint } from "@/lib/hero/types";

type HeroTrendChartProps = {
  points: HeroTrendPoint[];
};

const axisFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? value : axisFormatter.format(date);
}

export function HeroTrendChart({ points }: HeroTrendChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className="h-[280px] w-full overflow-hidden rounded-xl bg-page-background/70"
        style={{ border: "0.5px solid var(--border-subtle)" }}
      />
    );
  }

  return (
    <div className="h-[280px] w-full overflow-hidden rounded-xl">
      <ResponsiveContainer>
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(90, 100, 119, 0.28)" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="date"
            minTickGap={18}
            tick={{ fill: "#8892a0", fontSize: 11 }}
            tickFormatter={formatDateLabel}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[0, "dataMax + 3"]}
            tick={{ fill: "#8892a0", fontSize: 11 }}
            tickFormatter={(value: number) => `${value}%`}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "#161b27",
              border: "0.5px solid #2a2f3e",
              borderRadius: 12,
              color: "#e2e8f0",
            }}
            formatter={(value, name) => {
              const numericValue =
                typeof value === "number" ? value : Number.parseFloat(String(value ?? 0));
              const labelMap: Record<string, string> = {
                banRate: "Ban rate",
                pickRate: "Pick rate",
                winRate: "Win rate",
              };

              return [
                `${(Number.isFinite(numericValue) ? numericValue : 0).toFixed(1)}%`,
                labelMap[String(name)] ?? String(name),
              ];
            }}
            labelFormatter={(value) => formatDateLabel(String(value ?? ""))}
            labelStyle={{ color: "#8892a0" }}
          />
          <Line
            dataKey="winRate"
            dot={false}
            name="winRate"
            stroke="#4ade80"
            strokeWidth={2.5}
            type="monotone"
          />
          <Line
            dataKey="pickRate"
            dot={false}
            name="pickRate"
            stroke="#85b7eb"
            strokeWidth={2}
            type="monotone"
          />
          <Line
            dataKey="banRate"
            dot={false}
            name="banRate"
            stroke="#facc15"
            strokeWidth={1.8}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
