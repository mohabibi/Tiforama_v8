export class AudioService {
  private static instance: AudioService;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;

  private constructor() {
    this.initAudioContext();
    this.preloadTiforamaSounds();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Impossible de créer AudioContext:', error);
    }
  }

  // Précharger tous les sons de Tiforama
  private async preloadTiforamaSounds(): Promise<void> {
    const sounds = [
      { key: 'countdown', src: '/assets/audio/countdown.mp3' },
      { key: 'next', src: '/assets/audio/next.mp3' },
      { key: 'finish', src: '/assets/audio/fini.mp3' }
    ];

    const promises = sounds.map(sound => 
      this.preloadAudio(sound.key, sound.src).catch(async (error) => {
        console.warn(`Impossible de précharger ${sound.key}, génération synthétique...`);
        // En cas d'échec, générer des sons synthétiques
        await this.generateSyntheticSound(sound.key);
      })
    );

    await Promise.allSettled(promises);
  }

  // Générer un son synthétique en cas d'absence de fichier
  private async generateSyntheticSound(key: string): Promise<void> {
    try {
      const { SynthAudioGenerator } = await import('../utils/SynthAudioGenerator');
      const generator = new SynthAudioGenerator();
      
      switch (key) {
        case 'countdown':
          // Son de countdown déjà géré par le générateur
          break;
        case 'next':
          // Son next déjà géré par le générateur  
          break;
        case 'finish':
          // Son finish déjà géré par le générateur
          break;
        default:
          console.warn(`Son synthétique non défini pour: ${key}`);
      }
      
      // Le générateur se charge de créer et précharger les sons
      await generator.createDefaultAudioFiles();
    } catch (error) {
      console.error(`Erreur lors de la génération du son synthétique ${key}:`, error);
    }
  }

  // Précharger un fichier audio
  public async preloadAudio(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.audioElements.has(key)) {
        resolve();
        return;
      }

      const audio = new Audio();
      audio.preload = 'auto';
      
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio préchargé: ${key}`);
        resolve();
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.error(`Erreur préchargement audio ${key}:`, e);
        reject(e);
      }, { once: true });

      audio.src = src;
      this.audioElements.set(key, audio);
    });
  }

  // Jouer un son avec options avancées
  public async play(key: string, options: {
    loop?: boolean;
    volume?: number;
    startTime?: number;
  } = {}): Promise<void> {
    const audio = this.audioElements.get(key);
    if (!audio) {
      throw new Error(`Audio non trouvé: ${key}`);
    }

    try {
      // Réveiller l'AudioContext si nécessaire
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Réinitialiser la position si nécessaire
      if (options.startTime !== undefined) {
        audio.currentTime = options.startTime;
      } else {
        audio.currentTime = 0;
      }

      // Configurer les options
      if (options.loop !== undefined) {
        audio.loop = options.loop;
      }
      
      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }

      await audio.play();
    } catch (error) {
      console.error(`Erreur lecture audio ${key}:`, error);
      throw error;
    }
  }

  // Méthodes spécifiques à Tiforama
  public async playCountdown(volume: number = 1.0): Promise<void> {
    await this.play('countdown', { volume, startTime: 0 });
  }

  public async playNext(options: {
    fullVolume?: boolean;
    isBlockTransition?: boolean;
    loop?: boolean;
  } = {}): Promise<void> {
    let volume = 0.15; // Volume par défaut
    
    if (options.isBlockTransition) {
      volume = 1.2; // Augmenté pour les transitions de bloc
    } else if (options.fullVolume) {
      volume = 1.0;
    }

    await this.play('next', { 
      volume: Math.min(volume, 1.0),
      loop: options.loop 
    });
  }

  public async playFinish(volume: number = 1.0): Promise<void> {
    await this.play('finish', { volume });
  }

  // Arrêter un son
  public stop(key: string): void {
    const audio = this.audioElements.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Régler le volume
  public setVolume(key: string, volume: number): void {
    const audio = this.audioElements.get(key);
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Vérifier si un son est en cours de lecture
  public isPlaying(key: string): boolean {
    const audio = this.audioElements.get(key);
    return audio ? !audio.paused : false;
  }

  public stopAll(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  // Ajouter un listener d'événements
  public addEventListener(key: string, event: string, callback: EventListener): void {
    const audio = this.audioElements.get(key);
    if (audio) {
      audio.addEventListener(event, callback);
    }
  }

  public dispose(): void {
    this.stopAll();
    this.audioElements.forEach((audio) => {
      audio.src = '';
      audio.remove();
    });
    this.audioElements.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}