import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register service worker for Android app installability and offline caching
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        // Dispatched only when a newer version is genuinely downloaded & waiting
        window.dispatchEvent(new CustomEvent('pwa-update-available'));
      },
      onRegisterError(error: unknown) {
        console.warn('Service Worker registration skipped:', error);
      },
    });
    (window as unknown as { __pwa_update_sw?: (reloadPage?: boolean) => Promise<void> }).__pwa_update_sw = updateSW;
  } catch (err) {
    console.warn('Service Worker registration unsupported:', err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
