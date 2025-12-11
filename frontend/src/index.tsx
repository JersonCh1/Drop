import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Protección contra DevTools (solo en producción)
import './utils/devToolsProtection';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);