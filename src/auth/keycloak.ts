import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_OIDC_URL ?? 'http://localhost:8080',
  realm: import.meta.env.VITE_OIDC_REALM ?? 'price-intelligence',
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? 'price-intelligence-spa',
});

export async function initializeAuthentication(): Promise<void> {
  await keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });
}

export async function accessToken(): Promise<string> {
  if (!keycloak.authenticated) throw new Error('Authentication required');
  await keycloak.updateToken(30);
  if (!keycloak.token) throw new Error('Access token unavailable');
  return keycloak.token;
}
