import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/settings")({
  component: () => <Placeholder title="系统设置" />,
});
