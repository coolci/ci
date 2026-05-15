import { ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta?: number;
  deltaSuffix?: string;
  trend?: number[];
  trendColor?: string;
}

export function KpiCard({
  label,
  value,
  delta,
  deltaSuffix = "近 30 天",
  trend = [],
  trendColor = "var(--color-primary)",
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const data = trend.map((v, i) => ({ i, v }));
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>{label}</span>
        <Info className="size-3.5 opacity-60" />
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
          {delta !== undefined && (
            <div
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {positive ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
              {Math.abs(delta).toFixed(1)}%
              <span className="text-muted-foreground font-normal">{deltaSuffix}</span>
            </div>
          )}
        </div>
        {data.length > 0 && (
          <div className="h-12 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={trendColor}
                  strokeWidth={1.8}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
