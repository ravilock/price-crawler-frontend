import { accessToken } from '../auth/keycloak';
import { config } from '../config';

const apiBase = config.apiUrl;

export class ApiError extends Error {
  constructor(public readonly status: number) {
    super(`API request failed (${status})`);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await accessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const base = apiBase.replace(/\/+$/, '');
  const requestPath = base.endsWith('/api') && path.startsWith('/api/') ? path.slice(4) : path;
  const response = await fetch(`${base}${requestPath}`, { ...init, headers });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
