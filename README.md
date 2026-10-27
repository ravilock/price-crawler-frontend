# Frontend

The container reads `API_URL`, `OIDC_ISSUER`, and `OIDC_CLIENT_ID` on startup and writes browser configuration. Defaults are `/api`, `http://localhost:8080/realms/price-intelligence`, and `price-intelligence-spa`. Configure the API URL as reachable from the browser; `/api` requires a reverse proxy. The Keycloak client must have matching allowed origins and redirect URIs.

Set the user API's `OIDC_ISSUER` to exactly the same browser-visible realm issuer. The issuer is the token identity, not necessarily the address used by the API to reach signing keys. For a host-run API, `OIDC_JWKS_URL` can be `http://localhost:8080/realms/price-intelligence/protocol/openid-connect/certs`; for an API on the Compose network use `http://keycloak:8080/realms/price-intelligence/protocol/openid-connect/certs`. Adjust addresses for the actual network and ensure they reach the same realm. These settings contain no secrets.

The existing API verifier accepts the `price-intelligence-spa` client; another client requires corresponding API authorization configuration before it can authenticate. Development uses these defaults without a container. Run `npm test`, `npm run lint`, and `npm run build` for local checks.
