import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/notifications")({
  component: () => <Placeholder title="通知设置" />,
});
