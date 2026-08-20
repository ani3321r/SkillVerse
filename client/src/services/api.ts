// ============================================
// CENTRAL API SERVICE
// Single source of truth for the base URL
// and authenticated fetch calls.
//
// Set EXPO_PUBLIC_API_URL in client/.env to
// point at a hosted server (e.g. for device
// testing).  Falls back to localhost:5000.
// ============================================

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

// ============================================
// AUTHENTICATED FETCH
// Automatically attaches the JWT token from
// the provided token string.  All screens call
// this instead of raw fetch().
// ============================================

export async function apiFetch(
  path: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
}
