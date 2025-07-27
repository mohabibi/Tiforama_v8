export interface TifoState {
  colors: number[];
  durations: number[];
  palette: string[];
  icons?: string[];
  mp3_local?: string;
  groupe?: string;
  nom?: string;
  places?: number;
  userPlace?: number; // Numéro de place de l'utilisateur
}

// Interface pour l'API compatible avec votre backend Flutter
export interface TifoApiData {
  group_name: string;
  tifo_name: string;
  durations: number[];
  icons: string[];
  mp3_url: string;
  collections: { [placeNumber: string]: number[] }; // place_number -> color_indices
  palette: string[];
  NP: number; // nombre de places
}

export interface AppState {
  currentTime: string;
  isPlaying: boolean;
  currentIndex: number;
  showPaletteMode: boolean;
  isSlideshow: boolean;
  remainingDurations: number[];
  currentData: TifoState | null;
  isValidationPhase: boolean;
  showThankYou: boolean;
  isSaving: boolean;
  saveError: string | null;
  // Nouveaux états pour la gestion des tifos
  availableTifos: TifoState[];
  isLoading: boolean;
  loadError: string | null;
}