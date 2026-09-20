import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function isEmbeddedContext(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && !isEmbeddedContext()) {
      return (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt || null;
    }
    return null;
  });

  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.startsWith('android-app://')
    );
  });

  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [installChoice, setInstallChoice] = useState<'idle' | 'accepted' | 'dismissed'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const embedded = isEmbeddedContext();
    setIsEmbedded(embedded);

    // Standalone check
    const checkInstalled = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.startsWith('android-app://');
      if (isStandalone) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(userAgent));
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // If running in an embedded preview/iframe, PWA prompt will not be available
    if (embedded) {
      setDeferredPrompt(null);
      return;
    }

    // Check if inline script in index.html already caught beforeinstallprompt
    const existing = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
    if (existing) {
      setDeferredPrompt(existing);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile Chrome
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setInstallChoice('idle');
    };

    const handlePromptCaptured = () => {
      const prompt = (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt;
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    // REAL appinstalled event fired by the browser when installation completes
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setInstallChoice('accepted');
      if (typeof window !== 'undefined') {
        (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent | null }).__pwaInstallPrompt = null;
      }
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-captured', handlePromptCaptured);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-installed-event', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-captured', handlePromptCaptured);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-installed-event', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const installApp = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    const prompt =
      deferredPrompt ||
      (typeof window !== 'undefined'
        ? (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }).__pwaInstallPrompt
        : null);

    if (!prompt) {
      return 'unavailable';
    }

    try {
      // Trigger the real browser install prompt
      await prompt.prompt();
      const choice = await prompt.userChoice;

      if (choice.outcome === 'accepted') {
        setInstallChoice('accepted');
        // Do not immediately claim installed; wait for the real 'appinstalled' event
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          (window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent | null }).__pwaInstallPrompt = null;
        }
        return 'accepted';
      } else {
        // User cancelled/dismissed the prompt
        // Keep showing Get App; do NOT claim installed
        setInstallChoice('dismissed');
        return 'dismissed';
      }
    } catch (err) {
      console.warn('Browser install prompt invocation error:', err);
      return 'unavailable';
    }
  }, [deferredPrompt]);

  const updateApp = useCallback(async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      const globalUpdater = (window as unknown as { __pwa_update_sw?: (reloadPage?: boolean) => Promise<void> })
        .__pwa_update_sw;
      if (typeof globalUpdater === 'function') {
        await globalUpdater(true);
      } else {
        window.location.reload();
      }
    }
  }, []);

  // truthful install availability: must have a real prompt, must not already be installed, and must not be inside an iframe
  const canInstall = !isInstalled && !isEmbedded && deferredPrompt !== null;

  return {
    canInstall,
    isInstalled,
    isAndroid,
    isIOS,
    isEmbedded,
    installChoice,
    installApp,
    updateAvailable,
    updateApp,
  };
}
