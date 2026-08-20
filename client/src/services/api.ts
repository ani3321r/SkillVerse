// ============================================
// CENTRAL API SERVICE
// Single source of truth for the base URL
// and authenticated fetch calls.
// ============================================

export const API_URL = "http://localhost:5000";

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
