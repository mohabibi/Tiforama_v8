import React from 'react';
import { styled } from '@mui/material/styles';
import { Snackbar, Alert } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const StyledSnackbar = styled(Snackbar)({
  position: 'absolute',
  bottom: 16,
  left: '50%',
  transform: 'translateX(-50%)',
});

export const StatusNotification: React.FC = () => {
  const { isPlaying, currentData } = useSelector((state: RootState) => state.tifo);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getMessage = () => {
    if (!isOnline) {
      return {
        severity: 'warning' as const,
        message: 'Mode hors ligne - Les fonctionnalités peuvent être limitées'
      };
    }
    if (isPlaying) {
      return {
        severity: 'success' as const,
        message: 'Animation en cours - Gardez l\'écran actif'
      };
    }
    if (!currentData) {
      return {
        severity: 'info' as const,
        message: 'Chargement des données du tifo...'
      };
    }
    return null;
  };

  const statusInfo = getMessage();

  if (!statusInfo) return null;

  return (
    <StyledSnackbar open={true} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity={statusInfo.severity} elevation={6} variant="filled">
        {statusInfo.message}
      </Alert>
    </StyledSnackbar>
  );
};