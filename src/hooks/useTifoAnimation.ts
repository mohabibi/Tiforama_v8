import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  setIsPlaying, 
  setCurrentIndex, 
  updateRemainingDuration,
  setShowThankYou 
} from '../store/tifoSlice';
import { AudioService } from '../services/AudioService';

export const useTifoAnimation = () => {
  const dispatch = useDispatch();
  const { currentData, isPlaying, currentIndex, remainingDurations, isSlideshow } = useSelector(
    (state: RootState) => state.tifo
  );

  // États locaux pour la gestion précise du timing
  const [countdownMillis, setCountdownMillis] = useState(0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Références pour les timers
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const thankYouTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Services
  const audioService = AudioService.getInstance();

  // Nettoyer les timers au démontage
  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (thankYouTimerRef.current) clearTimeout(thankYouTimerRef.current);
    };
  }, []);

  // Démarrer l'animation (équivalent à startAnimation dans Flutter)
  const startAnimation = useCallback(() => {
    if (!currentData || isPlaying) return;

    const now = new Date();
    const exactMillis = now.getSeconds() * 1000 + now.getMilliseconds();
    const millisRemaining = 1000 - now.getMilliseconds();

    // Calculer le temps jusqu'à la prochaine minute
    const countdownTime = (60000 - exactMillis) % 60000;

    if (countdownTime === 0) {
      // Commencer immédiatement si on est exactement sur une minute
      startActualAnimation();
    } else {
      // Commencer le countdown
      setCountdownMillis(countdownTime);
      setIsCountingDown(true);
      
      // Son de countdown
      audioService.playCountdown(1.0).catch(console.error);

      // Timer précis aligné sur les millisecondes
      const startTime = performance.now();
      countdownTimerRef.current = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const remaining = countdownTime - elapsed;
        
        if (remaining <= 0) {
          setCountdownMillis(0);
          setIsCountingDown(false);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          startActualAnimation();
        } else {
          setCountdownMillis(Math.ceil(remaining));
        }
      }, 10); // Mise à jour toutes les 10ms pour plus de fluidité
    }
  }, [currentData, isPlaying, audioService]);

  // Démarrer l'animation principale (équivalent à startActualAnimation)
  const startActualAnimation = useCallback(() => {
    if (!currentData) return;

    dispatch(setIsPlaying(true));
    dispatch(setCurrentIndex(0));
    
    // Jouer le MP3 en boucle pour le mode slideshow
    if (isSlideshow && currentData.mp3_local) {
      audioService.play('remote_mp3', { loop: true }).catch(console.error);
    }

    // Démarrer le timer principal de l'animation
    const startTime = performance.now();
    animationTimerRef.current = setInterval(() => {
      updateAnimationPrecise(startTime);
    }, 10); // Mise à jour très fréquente pour la précision

  }, [currentData, dispatch, isSlideshow, audioService]);

  // Mise à jour précise de l'animation (équivalent à updateAnimationPrecise dans Flutter)
  const updateAnimationPrecise = useCallback((startTime: number) => {
    if (!currentData || !isPlaying) return;

    const elapsed = performance.now() - startTime;
    const elapsedSeconds = Math.floor(elapsed / 1000);

    // Calculer l'index actuel basé sur les durées
    let totalDuration = 0;
    let newIndex = 0;

    for (let i = 0; i < remainingDurations.length; i++) {
      if (elapsedSeconds >= totalDuration && elapsedSeconds < totalDuration + remainingDurations[i]) {
        newIndex = i;
        break;
      }
      totalDuration += remainingDurations[i];
      newIndex = i + 1;
    }

    // Vérifier si on a atteint la fin
    if (newIndex >= remainingDurations.length) {
      finishAnimation();
      return;
    }

    // Mettre à jour l'index si nécessaire
    if (newIndex !== currentIndex) {
      dispatch(setCurrentIndex(newIndex));
      
      // Vérifier s'il y a changement de couleur/bloc
      if (currentData.colors && newIndex > 0) {
        const previousColor = currentData.colors[newIndex - 1];
        const currentColor = currentData.colors[newIndex];
        
        if (previousColor !== currentColor) {
          // Changement de bloc - son plus fort
          audioService.playNext({ isBlockTransition: true }).catch(console.error);
        } else if (!isSlideshow) {
          // Changement normal - son normal
          audioService.playNext({ fullVolume: false }).catch(console.error);
        }
      }
    }

    // Mettre à jour la durée restante pour l'affichage
    const currentBlockElapsed = elapsedSeconds - remainingDurations.slice(0, newIndex).reduce((sum, dur) => sum + dur, 0);
    const remainingForCurrentBlock = remainingDurations[newIndex] - currentBlockElapsed;
    
    dispatch(updateRemainingDuration({
      index: newIndex,
      duration: Math.max(0, remainingForCurrentBlock)
    }));

  }, [currentData, isPlaying, currentIndex, remainingDurations, dispatch, isSlideshow, audioService]);

  // Terminer l'animation
  const finishAnimation = useCallback(() => {
    // Arrêter tous les timers
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    // Arrêter tous les sons
    audioService.stopAll();
    
    // Jouer le son de fin
    audioService.playFinish(1.0).catch(console.error);

    // Mettre à jour le state
    dispatch(setIsPlaying(false));
    dispatch(setCurrentIndex(0));
    
    // Afficher le message de remerciement
    dispatch(setShowThankYou(true));
    
    // Masquer le message après 3 secondes
    thankYouTimerRef.current = setTimeout(() => {
      dispatch(setShowThankYou(false));
    }, 3000);

  }, [dispatch, audioService]);

  // Arrêter l'animation manuellement
  const stopAnimation = useCallback(() => {
    // Nettoyer tous les timers
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (thankYouTimerRef.current) {
      clearTimeout(thankYouTimerRef.current);
      thankYouTimerRef.current = null;
    }

    // Arrêter tous les sons
    audioService.stopAll();

    // Réinitialiser les états
    setCountdownMillis(0);
    setIsCountingDown(false);
    dispatch(setIsPlaying(false));
    dispatch(setCurrentIndex(0));
    dispatch(setShowThankYou(false));

  }, [dispatch, audioService]);

  // Obtenir la couleur actuelle
  const getCurrentColor = useCallback((): string => {
    if (!currentData || currentIndex >= currentData.colors.length) return '#333';
    
    const colorIndex = currentData.colors[currentIndex];
    if (colorIndex > 0 && colorIndex <= currentData.palette.length) {
      return currentData.palette[colorIndex - 1];
    }
    return '#333';
  }, [currentData, currentIndex]);

  // Obtenir l'icône actuelle (pour le mode icônes)
  const getCurrentIcon = useCallback((): string | null => {
    if (!currentData?.icons || !currentData.colors[currentIndex]) return null;
    
    const colorIndex = currentData.colors[currentIndex];
    return currentData.icons[colorIndex % currentData.icons.length] || null;
  }, [currentData, currentIndex]);

  return {
    // Fonctions
    startAnimation,
    stopAnimation,
    
    // États
    isCountingDown,
    countdownMillis,
    
    // États calculés
    canStart: !isPlaying && currentData && new Date().getSeconds() >= 30,
    currentColor: getCurrentColor(),
    currentIcon: getCurrentIcon(),
  };
};