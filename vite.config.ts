import { env } from 'node:process';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Serve the same runtime boundary used by the container during host development.
function runtimeConfig(): Plugin {
  return {
    name: 'local-runtime-config',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url?.split('?')[0] !== '/runtime-config.js') return next();
        response.setHeader('Content-Type', 'application/javascript');
        response.setHeader('Cache-Control', 'no-store');
        response.end(`window.__PRICE_CONFIG__ = ${JSON.stringify({
          apiUrl: env.API_URL ?? '/api',
          oidcIssuer: env.OIDC_ISSUER ?? 'http://localhost:8080/realms/price-intelligence',
          oidcClientId: env.OIDC_CLIENT_ID ?? 'price-intelligence-spa',
        })};\n`);
      });
    },
  };
}

export default defineConfig({ plugins: [react(), runtimeConfig()] });
