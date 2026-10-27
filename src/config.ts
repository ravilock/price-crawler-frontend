type RuntimeConfig = { apiUrl: string; oidcIssuer: string; oidcClientId: string };

declare global {
  interface Window { __PRICE_CONFIG__?: RuntimeConfig }
}

export const config: RuntimeConfig = window.__PRICE_CONFIG__ ?? {
  apiUrl: '/api',
  oidcIssuer: 'http://localhost:8080/realms/price-intelligence',
  oidcClientId: 'price-intelligence-spa',
};
