import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Plus, Filter, RefreshCw } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Panel } from "@/components/dashboard/Panel";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const trend = (n: number) => Array.from({ length: 14 }, () => Math.random() * n + n / 2);

const orderTrend = Array.from({ length: 14 }, (_, i) => ({
  date: `5/${i + 5}`,
  成功: Math.floor(Math.random() * 40 + 30),
  失败: Math.floor(Math.random() * 12 + 3),
  尝试: Math.floor(Math.random() * 60 + 80),
}));

const byRegion = [
  { name: "法国 (RBX)", value: 38.6 },
  { name: "加拿大 (BHS)", value: 24.7 },
  { name: "德国 (FRA)", value: 16.4 },
  { name: "英国 (LON)", value: 9.3 },
  { name: "波兰 (WAW)", value: 6.2 },
  { name: "其他", value: 4.8 },
];

const dayOfWeek = [
  { d: "周一", v: 26 },
  { d: "周二", v: 29 },
  { d: "周三", v: 31 },
  { d: "周四", v: 33 },
  { d: "周五", v: 38 },
  { d: "周六", v: 27 },
  { d: "周日", v: 24 },
];

const recentOrders = [
  { id: "#OVH-1052", date: "2024-05-18 10:23", model: "KS-LE-1", region: "RBX", status: "已支付", price: "€8.99" },
  { id: "#OVH-1051", date: "2024-05-18 09:15", model: "KS-A | E3-1230v6", region: "BHS", status: "已支付", price: "€19.99" },
  { id: "#OVH-1050", date: "2024-05-18 08:47", model: "ADV-1", region: "FRA", status: "处理中", price: "€39.99" },
  { id: "#OVH-1049", date: "2024-05-17 23:32", model: "RISE-1", region: "RBX", status: "已支付", price: "€59.99" },
  { id: "#OVH-1048", date: "2024-05-17 22:03", model: "KS-LE-2", region: "BHS", status: "已支付", price: "€12.99" },
  { id: "#OVH-1047", date: "2024-05-17 21:11", model: "KS-A", region: "GRA", status: "失败", price: "—" },
];

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 顶部标题区 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">运行总览</h1>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
              运行中
            </span>
            <span className="text-xs text-muted-foreground">· 实时更新于刚刚</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            最近 30 天 OVH 抢购任务的执行情况与订单统计
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm hover:bg-secondary">
            <Filter className="size-4" /> 筛选
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-sm hover:bg-secondary">
            <RefreshCw className="size-4" /> 刷新
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> 新建抢购任务
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="抢购成功" value="248" delta={12.4} trend={trend(20)} />
        <KpiCard label="累计订单" value="18,735" delta={8.7} trend={trend(50)} trendColor="var(--color-chart-2)" />
        <KpiCard label="活跃任务" value="12" delta={6.3} trend={trend(8)} trendColor="var(--color-chart-3)" />
        <KpiCard label="失败率" value="2.41%" delta={-0.6} deltaSuffix="较上周" trend={trend(3)} trendColor="var(--color-chart-6)" />
      </div>

      {/* 中间图表 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="抢购趋势" description="成功 / 失败 / 总尝试" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderTrend} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-6)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-chart-6)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="尝试" stroke="var(--color-chart-2)" fill="url(#g2)" strokeWidth={2} />
                <Area type="monotone" dataKey="成功" stroke="var(--color-chart-1)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="失败" stroke="var(--color-chart-6)" fill="url(#g3)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="按地区分布" description="抢购成功的订单按 OVH 地区分布">
          <div className="flex h-72 items-center">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byRegion}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {byRegion.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 text-xs">
              {byRegion.map((r, i) => (
                <li key={r.name} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: PIE_COLORS[i] }} />
                  <span className="flex-1 truncate text-foreground">{r.name}</span>
                  <span className="font-medium text-muted-foreground">{r.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title="按周分布" description="一周内各天的抢购成功量">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeek} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="v" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="队列等待时间" description="任务进入抢购队列后的平均延迟 (毫秒)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Array.from({ length: 20 }, (_, i) => ({ x: i, y: Math.random() * 200 + 80 }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="x" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line type="monotone" dataKey="y" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="任务健康度" description="近 7 天">
          <div className="space-y-3">
            {[
              { label: "KS-LE-1 / RBX", v: 96 },
              { label: "KS-A | E3-1230v6 / BHS", v: 88 },
              { label: "ADV-1 / FRA", v: 72 },
              { label: "RISE-1 / RBX", v: 64 },
              { label: "KS-LE-2 / BHS", v: 51 },
            ].map((it) => (
              <div key={it.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{it.label}</span>
                  <span className="font-medium">{it.v}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${it.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 最近订单 */}
      <Panel title="最近订单" description="点击订单号查看详情" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium">订单号</th>
                <th className="px-5 py-2.5 text-left font-medium">时间</th>
                <th className="px-5 py-2.5 text-left font-medium">型号</th>
                <th className="px-5 py-2.5 text-left font-medium">地区</th>
                <th className="px-5 py-2.5 text-left font-medium">状态</th>
                <th className="px-5 py-2.5 text-right font-medium">金额</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-2.5 font-mono text-xs text-primary">{o.id}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{o.date}</td>
                  <td className="px-5 py-2.5 font-medium">{o.model}</td>
                  <td className="px-5 py-2.5">{o.region}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={
                        o.status === "已支付"
                          ? "rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
                          : o.status === "处理中"
                          ? "rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning-foreground"
                          : "rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive"
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-right font-medium">{o.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
