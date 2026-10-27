import Keycloak from 'keycloak-js';
import { config } from '../config';

const issuer = config.oidcIssuer.replace(/\/$/, '');
const separator = issuer.lastIndexOf('/realms/');
if (separator < 0 || !issuer.slice(separator + 8)) throw new Error('Invalid OIDC issuer');
export const keycloak = new Keycloak({
  url: issuer.slice(0, separator),
  realm: issuer.slice(separator + 8),
  clientId: config.oidcClientId,
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
