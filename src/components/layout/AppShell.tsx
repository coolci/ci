import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  Server,
  ListOrdered,
  ScrollText,
  Users,
  Bell,
  Settings,
  LogOut,
  Search,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "总览", icon: LayoutDashboard, exact: true },
  { to: "/tasks", label: "抢购任务", icon: ShoppingCart },
  { to: "/catalog", label: "服务器型号", icon: Server },
  { to: "/orders", label: "订单记录", icon: ListOrdered },
  { to: "/logs", label: "运行日志", icon: ScrollText },
  { to: "/accounts", label: "OVH 账号", icon: Users },
  { to: "/notifications", label: "通知设置", icon: Bell },
  { to: "/settings", label: "系统设置", icon: Settings },
] as const;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            O
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">OVH 抢购</div>
            <div className="text-[11px] text-muted-foreground">Auto Buyer Pro</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-medium">
              {user?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium">{user?.username}</div>
              <div className="truncate text-[11px] text-muted-foreground">
                {user?.role === "admin" ? "管理员" : "用户"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="退出登录"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="搜索任务、订单、型号..."
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <HelpCircle className="size-4" />
            </button>
            <button className="rounded p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Bell className="size-4" />
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
