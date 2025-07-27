import { useState, useCallback, useEffect } from 'react';

// Interface pour WakeLockSentinel
interface WakeLockSentinel {
  released: boolean;
  type: string;
  release(): Promise<void>;
}

// Interface pour l'API Wake Lock
interface WakeLockAPI {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

// Fonction utilitaire pour vérifier et accéder à l'API Wake Lock
const getWakeLockAPI = (): WakeLockAPI | null => {
  if ('wakeLock' in navigator) {
    return (navigator as any).wakeLock as WakeLockAPI;
  }
  return null;
};

export const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    const wakeLockAPI = getWakeLockAPI();
    if (wakeLockAPI) {
      try {
        const lock = await wakeLockAPI.request('screen');
        setWakeLock(lock);
        return true;
      } catch (err) {
        console.error('Wake Lock request failed:', err);
        return false;
      }
    }
    return false;
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        return true;
      } catch (err) {
        console.error('Wake Lock release failed:', err);
        return false;
      }
    }
    return false;
  }, [wakeLock]);

  // Nettoyer automatiquement lors du démontage
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [wakeLock]);

  return {
    requestWakeLock,
    releaseWakeLock,
    isActive: wakeLock !== null && !wakeLock.released,
  };
};
