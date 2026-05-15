import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/orders")({
  component: () => <Placeholder title="订单记录" />,
});
