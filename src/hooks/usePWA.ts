import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{
    outcome: 'accepted' | 'dismissed' | 'default'
  }>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed' | 'default'
  }>;
}

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt as any);

    // Écouter les mises à jour du service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setIsUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt as any);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return false;

    const choiceResult = await installPrompt.prompt();
    setInstallPrompt(null);
    return choiceResult.outcome === 'accepted';
  }, [installPrompt]);

  const applyUpdate = useCallback(() => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  return {
    canInstall: !!installPrompt,
    promptInstall,
    isUpdateAvailable,
    applyUpdate
  };
};