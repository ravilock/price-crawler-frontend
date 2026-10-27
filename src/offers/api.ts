import { apiRequest } from '../api/client';

export function submitOffer(url: string): Promise<{ request_id: string }> {
  return apiRequest('/offers', { method: 'POST', body: JSON.stringify({ url }) });
}
