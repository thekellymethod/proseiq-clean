const BASE = "/api/admin";

async function fetchApi(
  path: string,
  opts: RequestInit = {}
): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetchApi(path);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchApi(path, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchApi(path, { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export async function del(path: string): Promise<void> {
  const res = await fetchApi(path, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
}
