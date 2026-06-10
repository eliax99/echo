import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authRequest } from "@/lib/echo-api";
import { useGame } from "@/store/game";
import { SpaceBackground } from "@/components/SpaceBackground";
import { HelmetVisor } from "@/components/HelmetVisor";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "ECHO // SUIT LINK" },
      { name: "description", content: "Astronaut suit interface authentication." },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  const navigate = useNavigate();
  const setAuth = useGame((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [boot, setBoot] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setBoot((b) => (b >= 100 ? 100 : b + 7));
    }, 60);
    return () => clearInterval(i);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      // -------------------------
      // REGISTER + AUTO LOGIN
      // -------------------------
      if (mode === "register") {
        await authRequest(
          "/auth/register",
          email,
          password,
          email.split("@")[0]
        );

        const login = await authRequest("/auth/login", email, password);

        if (!login.access_token || !login.game_id) {
          throw new Error("Login after register failed");
        }

        setAuth(login.access_token, login.game_id);
        navigate({ to: "/game" });
        return;
      }

      // -------------------------
      // LOGIN NORMAL
      // -------------------------
      const login = await authRequest("/auth/login", email, password);

      if (!login.access_token || !login.game_id) {
        throw new Error("Invalid login response");
      }

      setAuth(login.access_token, login.game_id);
      navigate({ to: "/game" });

    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Link failure");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SpaceBackground />

      <HelmetVisor>
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="hud-panel hud-corner relative w-full max-w-md p-8 rounded-sm hud-flicker">

            <div className="flex items-center justify-between text-[10px] hud-dim tracking-[0.3em] mb-6">
              <span>SUIT-LINK v4.21</span>
              <span>BOOT {boot}%</span>
            </div>

            <h1 className="hud-text text-2xl tracking-[0.4em] font-bold mb-1">
              ECHO
            </h1>

            <div className="hud-dim text-[10px] tracking-[0.3em] mb-8">
              {mode === "login"
                ? "// HELMET SYNC REQUIRED"
                : "// NEW SUIT REGISTRATION"}
            </div>

            <form onSubmit={submit} className="space-y-4">

              <div>
                <label className="block text-[10px] hud-dim tracking-[0.25em] mb-1">
                  OPERATOR ID
                </label>

                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-[color:var(--hud)]/40 hud-text px-3 py-2 outline-none focus:border-[color:var(--hud)] font-mono text-sm"
                  placeholder="operator@deepspace"
                />
              </div>

              <div>
                <label className="block text-[10px] hud-dim tracking-[0.25em] mb-1">
                  CIPHER KEY
                </label>

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-[color:var(--hud)]/40 hud-text px-3 py-2 outline-none focus:border-[color:var(--hud)] font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>

              {err && (
                <div className="hud-warn text-xs">
                  {`> ${err}`}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full border border-[color:var(--hud)] hud-text py-2 tracking-[0.3em] text-sm hover:bg-[color:var(--hud)]/20 transition-colors disabled:opacity-50"
              >
                {loading
                  ? "LINKING…"
                  : mode === "login"
                  ? "INITIATE SYNC"
                  : "REGISTER SUIT"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode(mode === "login" ? "register" : "login")
                }
                className="w-full hud-dim text-[10px] tracking-[0.25em] hover:hud-text"
              >
                {mode === "login"
                  ? "» NEW OPERATOR? REGISTER"
                  : "» EXISTING OPERATOR? LOGIN"}
              </button>

            </form>
          </div>
        </div>
      </HelmetVisor>
    </>
  );
}