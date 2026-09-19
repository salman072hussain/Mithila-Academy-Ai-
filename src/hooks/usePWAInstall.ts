import { useEffect, useState } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed on Android home screen / desktop)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAndroidDevice = /android/.test(userAgent);
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsAndroid(isAndroidDevice);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const installApp = async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return choice.outcome;
    }
    return 'manual';
  };

  const updateApp = async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      const globalUpdater = (window as unknown as { __pwa_update_sw?: (reloadPage?: boolean) => Promise<void> }).__pwa_update_sw;
      if (typeof globalUpdater === 'function') {
        await globalUpdater(true);
      } else {
        window.location.reload();
      }
    }
  };

  return {
    canInstall: !!deferredPrompt,
    isInstalled,
    isAndroid,
    isIOS,
    installApp,
    updateAvailable,
    updateApp,
  };
}
