import { TifoState } from '../types';

export const getDemoTifo = (): TifoState => ({
  colors: Array.from({ length: 30 }, (_, i) => 
    Math.floor(i / 3) % 3 + 1
  ),
  durations: Array.from({ length: 30 }, () => 5),
  palette: [
    '#FF3D00',  // Rouge vif
    '#00E676',  // Vert lumineux
    '#2979FF'   // Bleu électrique
  ],
  icons: ['star', 'circle', 'square']
});