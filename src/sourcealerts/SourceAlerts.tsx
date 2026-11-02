import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { keycloak } from '../auth/keycloak';

type SourceAlert = { id: string; domain: string; occurred_at: string };
export function SourceAlerts() {
  const [alerts, setAlerts] = useState<SourceAlert[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const administrator = keycloak.hasRealmRole('administrator') || keycloak.hasResourceRole('administrator', 'price-intelligence-spa');
  useEffect(() => {
    if (!administrator) return;
    let active = true;
    const load = async () => { try { const result = await apiRequest<{ items: SourceAlert[] }>('/api/v1/admin/source-alerts'); if (active) { setAlerts(result.items); setUnavailable(false); } } catch { if (active) setUnavailable(true); } };
    void load(); const timer = setInterval(() => { void load(); }, 60000);
    return () => { active = false; clearInterval(timer); };
  }, [administrator]);
  if (!administrator) return null;
  return <section aria-label="Alertas de fontes"><h2>Alertas de fontes</h2>{unavailable && <p role="status">Não foi possível carregar os alertas de fontes.</p>}{!unavailable && alerts.length === 0 && <p>Nenhum alerta de fonte.</p>}<ul>{alerts.map(alert => <li key={alert.id}>Não foi possível ler o robots.txt de {alert.domain}; coleta em ritmo reduzido. <time dateTime={alert.occurred_at}>{new Date(alert.occurred_at).toLocaleString('pt-BR')}</time></li>)}</ul></section>;
}
