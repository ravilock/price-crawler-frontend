#!/bin/sh
set -eu
API_URL=${API_URL:-/api}
OIDC_ISSUER=${OIDC_ISSUER:-http://localhost:8080/realms/price-intelligence}
OIDC_CLIENT_ID=${OIDC_CLIENT_ID:-price-intelligence-spa}
# Restrict to URL/client characters so values cannot escape the JavaScript strings.
for value in "$API_URL" "$OIDC_ISSUER" "$OIDC_CLIENT_ID"; do
  case "$value" in *[!a-zA-Z0-9._~:/?#\[\]@!\$\&\'\(\)\*+,\;=%-]*) echo 'Invalid runtime configuration' >&2; exit 1;; esac
done
printf 'window.__PRICE_CONFIG__ = { apiUrl: "%s", oidcIssuer: "%s", oidcClientId: "%s" };\n' "$API_URL" "$OIDC_ISSUER" "$OIDC_CLIENT_ID" > /usr/share/nginx/html/runtime-config.js
# This checks only that static assets can be served; API and demo readiness are separate.
printf '%s\n' '{"status":"static-assets-ready"}' > /usr/share/nginx/html/healthz
