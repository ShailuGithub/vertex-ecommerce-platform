const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

const AUTH_SUFFIXES = ["/auth/login", "/auth/refresh", "/auth/register"];

function extractStoreSlug(path: string): string | null {
  const match = path.match(/^\/stores\/([^/]+)\//);
  return match ? match[1] : null;
}

const refreshPromises = new Map<string, Promise<boolean>>();

function refreshSession(storeSlug: string): Promise<boolean> {
  let promise = refreshPromises.get(storeSlug);
  if (!promise) {
    promise = fetch(`${API_URL}/stores/${storeSlug}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromises.delete(storeSlug);
      });
    refreshPromises.set(storeSlug, promise);
  }
  return promise;
}

export async function apiFetch(path: string, init?: RequestInit, _retried = false): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const storeSlug = extractStoreSlug(path);
  const isAuthEndpoint = AUTH_SUFFIXES.some((suffix) => path.endsWith(suffix));

  if (res.status === 401 && !_retried && storeSlug && !isAuthEndpoint) {
    const refreshed = await refreshSession(storeSlug);
    if (refreshed) return apiFetch(path, init, true);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed with status ${res.status}`);
  }
  return data;
}
