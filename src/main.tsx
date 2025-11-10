import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Router from './router';
import { I18nProvider } from './i18n/context';
import './styles.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <StrictMode>
    <I18nProvider>
      <Router />
    </I18nProvider>
  </StrictMode>
);


