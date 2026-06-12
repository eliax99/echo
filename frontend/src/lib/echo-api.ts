const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
if (typeof window !== "undefined") {
  console.log("[ECHO API] BASE URL:", BASE);
}

export async function authRequest(
  path: "/auth/register" | "/auth/login",
  email: string,
  password: string,
  username?: string
): Promise<{
  access_token?: string;
  token_type?: string;
  game_id?: number;
  message?: string;
  user_id?: number;
}> {
  const body =
    path === "/auth/register"
      ? { email, password, username }
      : { email, password };

  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || data?.message || `Auth failed (${res.status})`);
  }

  return data;
}

export async function chatRequest(
  token: string,
  message: string,
  game_id: number
): Promise<{ response: string; game_id: number }> {
  const url = `${BASE}/api/chat`;
  console.log("[ECHO API] chatRequest →", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, game_id }),
  });

  console.log("[ECHO API] chatRequest status:", res.status);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("[ECHO API] chatRequest error:", data);
    throw new Error(data?.detail || data?.message || `Chat failed (${res.status})`);
  }

  return data;
}
