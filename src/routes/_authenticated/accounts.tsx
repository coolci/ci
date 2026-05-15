import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/accounts")({
  component: () => <Placeholder title="OVH 账号管理" />,
});
