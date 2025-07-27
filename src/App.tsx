import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store';
import { AnimationDisplay } from './components/AnimationDisplay';
import { StatusNotification } from './components/StatusNotification';
import { UpdatePrompt } from './components/UpdatePrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TifoFormFragTifo } from './components/TifoFormFragTifo';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { setCurrentData } from './store/tifoSlice';
import { getDemoTifo } from './utils/demoData';
import { useWakeLock } from './hooks/useWakeLock';
import { RootState } from './store';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000000',
      paper: '#121212',
    },
    primary: {
      main: '#1db954',
    },
    error: {
      main: '#ff1744',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Arial', sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000',
          color: '#ffffff',
          overflow: 'hidden',
        },
      },
    },
  },
});

const AppContent = () => {
  const dispatch = useDispatch();
  const { isPlaying } = useSelector((state: RootState) => state.tifo);
  const { requestWakeLock, releaseWakeLock } = useWakeLock();

  useEffect(() => {
    // Charger les données de démo au démarrage
    const demoData = getDemoTifo();
    dispatch(setCurrentData(demoData));

    // Empêcher le zoom sur mobile avec une meilleure gestion des types
    document.addEventListener('touchmove', (e: TouchEvent) => {
      if ((e as any).scale !== 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Désactiver le double-tap sur iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }, [dispatch]);

  useEffect(() => {
    // Gérer le Wake Lock et les permissions pendant la lecture
    if (isPlaying) {
      requestWakeLock();
      // Demander la permission de notification au début de l'animation
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    } else {
      releaseWakeLock();
    }
  }, [isPlaying, requestWakeLock, releaseWakeLock]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: 'black', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'center', px: 2 }}>
          {/* Logo et titre */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src="/assets/images/logo.svg" 
              alt="Tiforama Logo"
              style={{ height: 40, objectFit: 'contain' }}
              onError={(e) => {
                // Fallback si le logo n'existe pas
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: 18, 
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              Tiforama
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Contenu principal */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Interface principale avec formulaire FragTifo */}
        <TifoFormFragTifo />
        
        {/* Animation Display */}
        <AnimationDisplay />
        
        <StatusNotification />
        <UpdatePrompt />
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
};

export default App;