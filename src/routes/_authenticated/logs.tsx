import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/logs")({
  component: () => <Placeholder title="运行日志" />,
});
