/**
 * React boot entry.
 * Functions: creates the React root and renders App inside StrictMode.
 * Dependencies: React, react-dom/client, src/App.tsx, src/index.css.
 * Maintenance note: keep this file tiny; route feature work through App or future routed modules.
 */
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
