import React, { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Button, Typography, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ColorGrid } from './ColorGrid';
import { IconGrid } from './IconGrid';
import { useTifoAnimation } from '../hooks/useTifoAnimation';
import { useNotifications } from '../hooks/useNotifications';

const DisplayContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
});

const CurrentSquare = styled(Box)<{ $bgcolor?: string }>(({ $bgcolor }) => ({
  width: '200px',
  height: '200px',
  backgroundColor: $bgcolor || '#333',
  borderRadius: '16px',
  border: '1px solid #444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1rem',
  transition: 'all 0.3s ease',
  '& img': {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
    filter: $bgcolor ? `drop-shadow(0 0 4px ${$bgcolor})` : undefined,
  },
}));

const CountdownSquare = styled(Box)({
  width: '200px',
  height: '200px',
  backgroundColor: '#333',
  borderRadius: '16px',
  border: '1px solid #666',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3rem',
  fontWeight: 'bold',
  color: '#1db954',
  fontFamily: 'monospace',
});

const AnimationButton = styled(Button)(({ theme }) => ({
  minWidth: '200px',
  height: '48px',
  backgroundColor: '#ff1744', // Rouge comme dans Flutter
  color: 'white',
  fontSize: '16px',
  fontWeight: 'bold',
  '&:disabled': {
    backgroundColor: '#333',
    color: '#666',
  },
  '&:hover': {
    backgroundColor: '#d50000',
  },
}));

const ThankYouMessage = styled(Box)({
  width: '100%',
  maxWidth: '600px',
  padding: '2rem',
  backgroundColor: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: '8px',
  textAlign: 'center',
});

export const AnimationDisplay: React.FC = () => {
  const { 
    startAnimation,
    isCountingDown,
    countdownMillis,
    canStart,
    currentColor,
    currentIcon
  } = useTifoAnimation();
  const { showNotification } = useNotifications();
  
  const {
    currentData,
    showPaletteMode,
    isPlaying,
    currentIndex,
    isSlideshow,
    showThankYou,
  } = useSelector((state: RootState) => state.tifo);

  useEffect(() => {
    if (isPlaying) {
      showNotification('Animation démarrée', {
        body: 'L\'animation du tifo a commencé',
        silent: true
      });
    }
  }, [isPlaying, showNotification]);

  const handleStart = () => {
    startAnimation();
  };

  const formatCountdown = (millis: number): string => {
    const seconds = Math.ceil(millis / 1000);
    return seconds.toString();
  };

  // Si on affiche le message de remerciement
  if (showThankYou) {
    return (
      <DisplayContainer>
        <ThankYouMessage>
          <Typography variant="h4" sx={{ mb: 2, color: '#1db954' }}>
            Merci !
          </Typography>
          <Typography variant="body1" color="textSecondary">
            L'animation du tifo est terminée avec succès.
          </Typography>
        </ThankYouMessage>
      </DisplayContainer>
    );
  }

  // Si pas de données, ne rien afficher
  if (!currentData) {
    return null;
  }

  return (
    <DisplayContainer>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 2 }}>
        {showPaletteMode ? 'Mode Couleurs' : 'Mode Icônes'}
      </Typography>

      {/* Grille de couleurs ou d'icônes */}
      {showPaletteMode ? <ColorGrid /> : <IconGrid />}
      
      {/* Carré principal - countdown ou couleur actuelle */}
      {isCountingDown ? (
        <CountdownSquare>
          {formatCountdown(countdownMillis)}
        </CountdownSquare>
      ) : (
        <CurrentSquare $bgcolor={currentColor}>
          {!showPaletteMode && currentIcon && (
            <img src={currentIcon} alt="Icône actuelle" />
          )}
        </CurrentSquare>
      )}

      {/* Informations sur l'état */}
      <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
        {isPlaying ? (
          `Position: ${currentIndex + 1}/${currentData.colors.length}`
        ) : isCountingDown ? (
          'Décompte en cours...'
        ) : canStart ? (
          'Prêt à commencer'
        ) : (
          'Attendre la 30e seconde'
        )}
      </Typography>

      {/* Bouton de démarrage */}
      {!isPlaying && !isCountingDown && (
        <AnimationButton
          onClick={handleStart}
          disabled={!canStart}
        >
          {canStart ? 'Jouez' : 'Patientez'}
        </AnimationButton>
      )}

      {/* Indicateur pour le mode slideshow */}
      {isSlideshow && isPlaying && (
        <Typography variant="caption" color="primary">
          Mode Slideshow - Audio en boucle
        </Typography>
      )}
    </DisplayContainer>
  );
};