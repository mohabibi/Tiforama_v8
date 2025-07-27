import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AppState, TifoState } from '../types';
import { ApiService, TifoData } from '../services/ApiService';

// Async thunk for saving tifo data
export const saveTifoData = createAsyncThunk(
  'tifo/saveTifoData',
  async (params: { data: TifoState; groupName?: string; tifoName?: string }) => {
    try {
      await ApiService.getInstance().addTifo(params.data, params.groupName, params.tifoName);
      return true;
    } catch (error) {
      throw error;
    }
  }
);

// Async thunk for loading tifo data
export const loadTifoData = createAsyncThunk(
  'tifo/loadTifoData',
  async () => {
    try {
      const tifos = await ApiService.getInstance().getTifos();
      return tifos;
    } catch (error) {
      throw error;
    }
  }
);

const initialState: AppState = {
  currentTime: '00:00:00',
  isPlaying: false,
  currentIndex: 0,
  showPaletteMode: true,
  isSlideshow: false,
  remainingDurations: [],
  currentData: null,
  isValidationPhase: false,
  showThankYou: false,
  isSaving: false,
  saveError: null,
  availableTifos: [],
  isLoading: false,
  loadError: null,
};

const tifoSlice = createSlice({
  name: 'tifo',
  initialState,
  reducers: {
    setCurrentTime: (state, action: PayloadAction<string>) => {
      state.currentTime = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentIndex: (state, action: PayloadAction<number>) => {
      state.currentIndex = action.payload;
    },
    setShowPaletteMode: (state, action: PayloadAction<boolean>) => {
      state.showPaletteMode = action.payload;
    },
    setIsSlideshow: (state, action: PayloadAction<boolean>) => {
      state.isSlideshow = action.payload;
    },
    setCurrentData: (state, action: PayloadAction<TifoState | null>) => {
      state.currentData = action.payload;
      if (action.payload?.durations) {
        state.remainingDurations = [...action.payload.durations];
      }
    },
    updateRemainingDuration: (state, action: PayloadAction<{ index: number; duration: number }>) => {
      const { index, duration } = action.payload;
      if (index >= 0 && index < state.remainingDurations.length) {
        state.remainingDurations[index] = duration;
      }
    },
    setShowThankYou: (state, action: PayloadAction<boolean>) => {
      state.showThankYou = action.payload;
    },
    resetState: (state) => {
      return { ...initialState };
    }
  },
  extraReducers: (builder) => {
    builder
      // Save tifo data
      .addCase(saveTifoData.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
      })
      .addCase(saveTifoData.fulfilled, (state) => {
        state.isSaving = false;
        state.saveError = null;
      })
      .addCase(saveTifoData.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.error.message || 'Une erreur est survenue';
      })
      // Load tifo data
      .addCase(loadTifoData.pending, (state) => {
        state.isLoading = true;
        state.loadError = null;
      })
      .addCase(loadTifoData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loadError = null;
        state.availableTifos = action.payload;
      })
      .addCase(loadTifoData.rejected, (state, action) => {
        state.isLoading = false;
        state.loadError = action.error.message || 'Erreur lors du chargement des tifos';
      });
  },
});

export const {
  setCurrentTime,
  setIsPlaying,
  setCurrentIndex,
  setShowPaletteMode,
  setIsSlideshow,
  setCurrentData,
  updateRemainingDuration,
  setShowThankYou,
  resetState,
} = tifoSlice.actions;

export default tifoSlice.reducer;