import { apiRequest } from '../api/client';

export type OfferResult = {
  request_id: string;
  state: 'queued' | 'fetching' | 'rendering' | 'finding' | 'completed' | 'retry_wait' | 'failed' | 'paused';
  source_id: string;
  source_domain: string;
  price_status: 'verified' | 'missing';
  price_cents: number | null;
  availability: 'available' | 'unavailable' | 'unknown';
  observed_at: string | null;
};

export type OfferResults = { status: 'ok'; items: OfferResult[]; next_cursor: string | null };

export function submitOffer(url: string, idempotencyKey: string): Promise<{ request_id: string; status: string }> {
  return apiRequest('/api/v1/offers', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ url }) });
}

export function readOfferResults(options: { requestId?: string; cursor?: string } = {}): Promise<OfferResults> {
  const query = new URLSearchParams({ limit: '50' });
  if (options.requestId) query.set('request_id', options.requestId);
  if (options.cursor) query.set('cursor', options.cursor);
  return apiRequest(`/api/v1/offers/results?${query.toString()}`);
}
