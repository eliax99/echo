const BASE = "http://localhost:8000";

export async function authRequest(
  path: "/auth/register" | "/auth/login",
  email: string,
  password: string,
): Promise<{ access_token: string; game_id: number }> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Auth failed (${res.status})`);
  }
  return res.json();
}

export async function chatRequest(
  token: string,
  message: string,
): Promise<{ response: string; game_id: number }> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Transmission failed (${res.status})`);
  return res.json();
}
