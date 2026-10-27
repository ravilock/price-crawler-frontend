import { accessToken } from '../auth/keycloak';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(`${apiBase}${path}`, { ...init, headers });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return response.json() as Promise<T>;
}
