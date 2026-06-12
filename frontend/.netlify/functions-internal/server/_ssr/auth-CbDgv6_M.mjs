import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { u as useGame, S as SpaceBackground, H as HelmetVisor, a as authRequest } from "./echo-api-GW0O57mV.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
function AuthScreen() {
  const navigate = useNavigate();
  const setAuth = useGame((s) => s.setAuth);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [mode, setMode] = reactExports.useState("login");
  const [loading, setLoading] = reactExports.useState(false);
  const [err, setErr] = reactExports.useState(null);
  const [boot, setBoot] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const i = setInterval(() => {
      setBoot((b) => b >= 100 ? 100 : b + 7);
    }, 60);
    return () => clearInterval(i);
  }, []);
  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await authRequest("/auth/register", email, password, email.split("@")[0]);
        const login2 = await authRequest("/auth/login", email, password);
        if (!login2.access_token || !login2.game_id) {
          throw new Error("Login after register failed");
        }
        setAuth(login2.access_token, login2.game_id);
        navigate({
          to: "/game"
        });
        return;
      }
      const login = await authRequest("/auth/login", email, password);
      if (!login.access_token || !login.game_id) {
        throw new Error("Invalid login response");
      }
      setAuth(login.access_token, login.game_id);
      navigate({
        to: "/game"
      });
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Link failure");
    } finally {
      setLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SpaceBackground, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HelmetVisor, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel hud-corner relative w-full max-w-md p-8 rounded-sm hud-flicker", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] hud-dim tracking-[0.3em] mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SUIT-LINK v4.21" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "BOOT ",
          boot,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "hud-text text-2xl tracking-[0.4em] font-bold mb-1", children: "ECHO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-dim text-[10px] tracking-[0.3em] mb-8", children: mode === "login" ? "// HELMET SYNC REQUIRED" : "// NEW SUIT REGISTRATION" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] hud-dim tracking-[0.25em] mb-1", children: "OPERATOR ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", required: true, autoFocus: true, value: email, onChange: (e) => setEmail(e.target.value), className: "w-full bg-transparent border border-[color:var(--hud)]/40 hud-text px-3 py-2 outline-none focus:border-[color:var(--hud)] font-mono text-sm", placeholder: "operator@deepspace" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] hud-dim tracking-[0.25em] mb-1", children: "CIPHER KEY" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "w-full bg-transparent border border-[color:var(--hud)]/40 hud-text px-3 py-2 outline-none focus:border-[color:var(--hud)] font-mono text-sm", placeholder: "••••••••" })
        ] }),
        err && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hud-warn text-xs", children: `> ${err}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "w-full border border-[color:var(--hud)] hud-text py-2 tracking-[0.3em] text-sm hover:bg-[color:var(--hud)]/20 transition-colors disabled:opacity-50", children: loading ? "LINKING…" : mode === "login" ? "INITIATE SYNC" : "REGISTER SUIT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setMode(mode === "login" ? "register" : "login"), className: "w-full hud-dim text-[10px] tracking-[0.25em] hover:hud-text", children: mode === "login" ? "» NEW OPERATOR? REGISTER" : "» EXISTING OPERATOR? LOGIN" })
      ] })
    ] }) }) })
  ] });
}
export {
  AuthScreen as component
};
