import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "./tasks";

export const Route = createFileRoute("/_authenticated/catalog")({
  component: () => <Placeholder title="服务器型号" />,
});
