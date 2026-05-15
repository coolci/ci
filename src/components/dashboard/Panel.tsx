import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  description?: string;
  className?: string;
  bodyClassName?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function Panel({ title, description, className, bodyClassName, action, children }: PanelProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-card", className)}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex items-center gap-1">
          {action}
          <button className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
