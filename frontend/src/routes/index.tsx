import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("echo_token");
      throw redirect({ to: t ? "/game" : "/auth" });
    }
    throw redirect({ to: "/auth" });
  },
  component: () => null,
});
