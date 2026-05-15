import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tasks")({
  component: () => <Placeholder title="抢购任务" />,
});

export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Construction className="size-12 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        本模块将在第 3 期实现：抢购任务的创建、调度、并发执行、失败重试。
      </p>
    </div>
  );
}
