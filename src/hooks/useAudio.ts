import { useCallback } from 'react';
import { AudioService } from '../services/AudioService';
import { AUDIO_FILES } from '../constants';

type SoundName = keyof typeof AUDIO_FILES;

export const useAudio = () => {
  const playSound = useCallback((name: SoundName) => {
    const audioService = AudioService.getInstance();
    audioService.play(name);
  }, []);

  const stopSound = useCallback((name: SoundName) => {
    const audioService = AudioService.getInstance();
    audioService.stop(name);
  }, []);

  const stopAllSounds = useCallback(() => {
    const audioService = AudioService.getInstance();
    audioService.stopAll();
  }, []);

  return {
    playSound,
    stopSound,
    stopAllSounds
  };
};