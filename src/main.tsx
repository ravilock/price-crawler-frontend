import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { initializeAuthentication } from './auth/keycloak';
import './style.css';

async function start(): Promise<void> {
  await initializeAuthentication();
  createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
}

void start().catch(() => {
  const root = document.getElementById('root');
  if (root) root.textContent = 'Não foi possível iniciar a autenticação. Tente novamente.';
});
