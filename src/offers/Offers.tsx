import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../api/client';
import { keycloak } from '../auth/keycloak';
import { OfferResult, readOfferResults, submitOffer } from './api';

function hasRole(role: string): boolean {
  return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role, 'price-intelligence-spa');
}

function money(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

function accessMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Seu perfil não tem permissão para esta ação.';
    if (error.status === 404) return 'A solicitação não foi encontrada no seu escopo.';
    if (error.status === 422 || error.status === 400) return 'Confira o endereço informado e tente novamente.';
    if (error.status === 504) return 'O serviço demorou para responder. Tente atualizar os resultados.';
  }
  return 'Não foi possível acessar as ofertas agora. Tente novamente.';
}

function statusText(item: OfferResult): string {
  if (item.state === 'failed') return 'Falha na coleta';
  if (item.state === 'paused') return 'Coleta pausada';
  if (item.state === 'retry_wait') return 'Nova tentativa agendada';
  if (item.state !== 'completed') return 'Coleta em andamento';
  if (item.availability === 'unavailable') return 'Indisponível';
  if (item.availability === 'unknown') return 'Disponibilidade desconhecida';
  return 'Disponível';
}

function isPending(item: OfferResult): boolean {
  return ['queued', 'fetching', 'rendering', 'finding', 'retry_wait'].includes(item.state);
}

export function Offers() {
  const canSubmit = hasRole('administrator') || hasRole('manager');
  const [url, setUrl] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [items, setItems] = useState<OfferResult[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState<string | null>(null);

  const updateItems = useCallback((next: OfferResult[]) => {
    setItems((current) => {
      const byId = new Map(current.map((item) => [item.request_id, item]));
      for (const item of next) byId.set(item.request_id, item);
      return [...byId.values()].sort((a, b) => (b.observed_at ?? '').localeCompare(a.observed_at ?? ''));
    });
  }, []);

  const load = useCallback(async (options: { requestId?: string; cursor?: string; append?: boolean; quiet?: boolean } = {}) => {
    if (!options.quiet) setError('');
    if (options.append) setRefreshing(true); else if (!options.requestId) setLoading(true);
    try {
      const result = await readOfferResults(options);
      updateItems(result.items);
      if (!options.requestId) setCursor(result.next_cursor);
    } catch (cause) {
      if (!options.quiet) setError(accessMessage(cause));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateItems]);

  useEffect(() => { void load(); }, [load]);

  const pendingIds = useMemo(() => {
    const ids = items.filter(isPending).map((item) => item.request_id);
    if (accepted && !items.some((item) => item.request_id === accepted)) ids.push(accepted);
    return ids;
  }, [accepted, items]);
  useEffect(() => {
    if (pendingIds.length === 0) return;
    const timer = window.setInterval(() => {
      for (const requestId of pendingIds) void load({ requestId, quiet: true });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [pendingIds, load]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true); setError(''); setNotice(''); setAccepted(null);
    try {
      const result = await submitOffer(url.trim(), idempotencyKey);
      setAccepted(result.request_id);
      setNotice(`Solicitação aceita. Código: ${result.request_id}`);
      setIdempotencyKey(crypto.randomUUID());
      setUrl('');
      await load({ requestId: result.request_id, quiet: true });
    } catch (cause) {
      setError(accessMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return <section aria-labelledby="offers-title" className="offers">
    <h2 id="offers-title">Ofertas monitoradas</h2>
    {canSubmit && <form className="offer-form" onSubmit={onSubmit}>
      <label htmlFor="offer-url">Endereço da oferta</label>
      <div className="offer-form-row">
        <input id="offer-url" aria-label="URL da oferta" type="url" required maxLength={4096} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://loja.example/produto" />
        <button disabled={submitting}>{submitting ? 'Enviando…' : 'Monitorar oferta'}</button>
      </div>
      <p className="hint">A solicitação é enviada para coleta em uma fonte autorizada.</p>
    </form>}
    {!canSubmit && <p>Seu perfil pode consultar as ofertas dentro do seu escopo.</p>}
    {notice && <p role="status" className="success">{notice}</p>}
    {error && <p role="alert" className="error">{error}</p>}
    {accepted && <button className="secondary" onClick={() => void load({ requestId: accepted })}>Atualizar esta solicitação</button>}
    <div className="results-heading"><h3>Resultados</h3><button className="secondary" disabled={refreshing} onClick={() => void load()}>{refreshing ? 'Atualizando…' : 'Atualizar lista'}</button></div>
    {loading && <p role="status">Carregando ofertas…</p>}
    {!loading && items.length === 0 && <p>Nenhuma oferta encontrada. Quando uma coleta for enviada, ela aparecerá aqui.</p>}
    {items.length > 0 && <div className="table-scroll"><table>
      <thead><tr><th>Solicitação</th><th>Loja</th><th>Preço</th><th>Disponibilidade</th><th>Coleta</th><th>Observado em</th></tr></thead>
      <tbody>{items.map((item) => <tr key={item.request_id}>
        <td><code>{item.request_id}</code></td><td>{item.source_domain}</td>
        <td>{item.price_status === 'verified' && item.price_cents !== null ? money(item.price_cents) : 'Preço não verificado'}</td>
        <td>{statusText(item)}</td><td>{item.state}</td>
        <td>{item.observed_at ? <time dateTime={item.observed_at}>{new Date(item.observed_at).toLocaleString('pt-BR')}</time> : '—'}</td>
      </tr>)}</tbody>
    </table></div>}
    {cursor && <button className="secondary" disabled={refreshing} onClick={() => void load({ cursor, append: true })}>Carregar mais</button>}
  </section>;
}
