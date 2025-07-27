// Générateur de sons synthétiques pour Tiforama
export class SynthAudioGenerator {
  private audioContext: AudioContext;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  // Générer un bip de countdown
  public async generateCountdownBeep(): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2; // 200ms
    const frequency = 880; // La (note A)
    
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const envelope = Math.max(0, 1 - t / duration); // Fade out
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  // Générer un son "next" court
  public async generateNextSound(): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1; // 100ms
    const frequency = 660; // Mi (note E)
    
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8); // Décroissance exponentielle
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }

    return buffer;
  }

  // Générer un accord de fin
  public async generateFinishChord(): Promise<AudioBuffer> {
    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0; // 1 seconde
    
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Accord majeur (Do-Mi-Sol)
    const frequencies = [523.25, 659.25, 783.99]; // C5-E5-G5

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2); // Décroissance lente
      
      let sample = 0;
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t);
      });
      
      channelData[i] = (sample / frequencies.length) * envelope * 0.3;
    }

    return buffer;
  }

  // Créer et sauvegarder les fichiers audio par défaut
  public async createDefaultAudioFiles(): Promise<void> {
    try {
      const countdownBuffer = await this.generateCountdownBeep();
      const nextBuffer = await this.generateNextSound();
      const finishBuffer = await this.generateFinishChord();

      // Les stocker dans l'AudioService pour utilisation immédiate
      const audioService = (await import('../services/AudioService')).AudioService.getInstance();
      
      // Créer des éléments audio temporaires
      this.bufferToAudioElement(countdownBuffer, 'countdown');
      this.bufferToAudioElement(nextBuffer, 'next');
      this.bufferToAudioElement(finishBuffer, 'finish');

      console.log('Sons synthétiques générés avec succès');
    } catch (error) {
      console.error('Erreur lors de la génération des sons:', error);
    }
  }

  private bufferToAudioElement(buffer: AudioBuffer, key: string): void {
    // Convertir l'AudioBuffer en données WAV
    const wav = this.bufferToWav(buffer);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);

    // Précharger dans l'AudioService
    import('../services/AudioService').then(({ AudioService }) => {
      AudioService.getInstance().preloadAudio(key, url);
    });
  }

  private bufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    // En-tête WAV
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Données audio
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return arrayBuffer;
  }
}
