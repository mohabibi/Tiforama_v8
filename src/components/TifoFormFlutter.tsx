import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  Fab
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppDispatch, useAppSelector } from '../store';
import { setCurrentData } from '../store/tifoSlice';
import { TifoState } from '../types';
import { ApiService } from '../services/ApiService';
import { ConnectionTest } from './ConnectionTest';

const FormContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#000000',
  color: 'white',
  position: 'relative',
}));

const MainContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 400,
  margin: '0 auto',
  paddingTop: theme.spacing(10), // Space for fixed header
}));

const FlutterHeader = styled(AppBar)({
  backgroundColor: '#000000',
  boxShadow: 'none',
  borderBottom: '1px solid #333',
});

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiInputBase-root': {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    border: 'none',
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: '#90EE90',
    fontSize: 14,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
})) as typeof Autocomplete;

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiInputBase-root': {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    border: 'none',
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: '#90EE90',
    fontSize: 14,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input': {
    color: 'white',
  },
}));

// Composant spécial pour le champ numéro de place avec affichage personnalisé
const PlaceNumberField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  position: 'relative',
  '& .MuiInputBase-root': {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    border: 'none',
    color: 'transparent', // Masquer le texte normal
  },
  '& .MuiInputLabel-root': {
    color: '#90EE90',
    fontSize: 14,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const PlaceDisplayOverlay = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '14px',
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  fontSize: '16px',
});

const FlutterValidateButton = styled(Button)({
  backgroundColor: '#555555',
  fontWeight: 'bold',
  borderRadius: 25,
  padding: '12px 40px',
  marginTop: '20px',
  marginBottom: '30px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#666666',
  },
  '&:disabled': {
    backgroundColor: '#333333',
    color: '#999999',
  },
  // Styles dynamiques selon l'état
  '&.semi-transparent': {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  '&.full-white': {
    color: 'white',
  },
});

const MemoryCirclesContainer = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(5, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  gap: '15px',
  justifyItems: 'center',
  marginTop: '20px',
  marginBottom: '80px', // Space for refresh button
});

const MemoryCircle = styled(Box)<{ $isActive: boolean }>(({ $isActive }) => ({
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: $isActive ? '#555555' : '#2a2a2a',
  border: '1px solid #555555',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: 'bold',
  color: $isActive ? 'white' : 'rgba(255, 255, 255, 0.5)', // Blanc 100% si actif, semi-transparent sinon
  cursor: $isActive ? 'pointer' : 'default',
  transition: 'all 0.3s ease',
  '&:hover': $isActive ? {
    backgroundColor: '#666666',
    transform: 'scale(1.05)'
  } : {},
}));

const RefreshButton = styled(Fab)({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#ff1744',
  color: 'white',
  width: '56px',
  height: '56px',
  '&:hover': {
    backgroundColor: '#d50000',
  },
});

// Interfaces correspondant à la structure SQLite réelle
interface Group {
  id: number;
  name: string;
}

interface TifoInfo {
  id: number;
  name: string;
  places: number; // Correspond au champ NP de la base
  group_id: number;
  data?: TifoState; // Données complètes du tifo
}

interface ApiTifoData {
  tifo_id: number;
  group_name: string;
  tifo_name: string;
  durations: number[];
  icons: string[];
  palette: string[];
  mp3_url: string;
  collections: { [place_number: string]: number[] };
  colors: number[];
  NP: number;
}

interface SavedTifoData {
  id: string;
  group_name: string;
  tifo_name: string;
  place_number: number;
  data: TifoState;
  timestamp: number;
}

export const TifoFormFlutter: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentData } = useAppSelector((state) => state.tifo);

  // Service API pour la connexion à la base de données
  const apiService = ApiService.getInstance();

  // États du formulaire - Logique avec API
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedTifo, setSelectedTifo] = useState<TifoInfo | null>(null);
  const [userPlaceNumber, setUserPlaceNumber] = useState<string>('');
  
  // États des données dynamiques
  const [groups, setGroups] = useState<Group[]>([]);
  const [tifos, setTifos] = useState<TifoInfo[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingTifos, setIsLoadingTifos] = useState(false);
  const [isDownloadingData, setIsDownloadingData] = useState(false);
  
  // États mémoire et UI
  const [memorySlots, setMemorySlots] = useState<(SavedTifoData | null)[]>(new Array(10).fill(null));
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  
  // État pour l'heure UTC (comme dans Flutter)
  const [currentTime, setCurrentTime] = useState<string>('');
  const [timeOffset, setTimeOffset] = useState<number>(0); // Décalage avec le serveur
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false); // Mode hors connexion

  // Charger l'offset sauvegardé depuis localStorage
  const loadSavedTimeOffset = (): number => {
    try {
      const saved = localStorage.getItem('tiforama_time_offset');
      if (saved) {
        const offset = parseInt(saved);
        console.log(`📱 Offset récupéré depuis la mémoire: ${offset}ms`);
        return offset;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement de l\'offset:', error);
    }
    return 0; // Valeur par défaut
  };

  // Sauvegarder l'offset dans localStorage
  const saveTimeOffset = (offset: number) => {
    try {
      localStorage.setItem('tiforama_time_offset', offset.toString());
      console.log(`💾 Offset sauvegardé en mémoire: ${offset}ms`);
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde de l\'offset:', error);
    }
  };

  // Synchroniser l'heure avec un serveur de temps au démarrage
  const syncTimeWithServer = async () => {
    try {
      // Utiliser l'API WorldTimeAPI pour obtenir l'heure UTC précise
      const response = await fetch('https://worldtimeapi.org/api/timezone/UTC');
      if (response.ok) {
        const timeData = await response.json();
        const serverTime = new Date(timeData.utc_datetime).getTime();
        const localTime = Date.now();
        const offset = serverTime - localTime;
        setTimeOffset(offset);
        setIsOfflineMode(false);
        
        // Sauvegarder le nouvel offset
        saveTimeOffset(offset);
        
        console.log(`⏰ Horloge synchronisée avec le serveur UTC (décalage: ${offset}ms)`);
      } else {
        throw new Error('Serveur de temps indisponible');
      }
    } catch (error) {
      console.warn('⚠️ Impossible de synchroniser avec le serveur UTC, utilisation de l\'offset sauvegardé:', error);
      
      // Charger l'offset sauvegardé en mode hors connexion
      const savedOffset = loadSavedTimeOffset();
      setTimeOffset(savedOffset);
      setIsOfflineMode(true);
      
      console.log(`📴 Mode hors connexion - Offset utilisé: ${savedOffset}ms`);
    }
  };

  // Mettre à jour l'heure UTC avec millisecondes chaque 100ms
  useEffect(() => {
    const updateTime = () => {
      const now = new Date(Date.now() + timeOffset);
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = now.getUTCMilliseconds().toString().padStart(3, '0');
      setCurrentTime(`UTC: ${hours}-${minutes}-${seconds}-${milliseconds}`);
    };
    
    updateTime(); // Initial call
    const interval = setInterval(updateTime, 100); // Mise à jour toutes les 100ms pour les millisecondes
    
    return () => clearInterval(interval);
  }, [timeOffset]);

  // Synchroniser l'heure avec un serveur de temps au démarrage (effet séparé)
  useEffect(() => {
    // Charger immédiatement l'offset sauvegardé pour démarrer avec la dernière valeur connue
    const savedOffset = loadSavedTimeOffset();
    setTimeOffset(savedOffset);
    setIsOfflineMode(savedOffset !== 0); // Si on a un offset sauvegardé, on assume le mode hors connexion temporairement
    
    // Puis tenter la synchronisation avec le serveur
    syncTimeWithServer();
  }, []);

  // Charger les groupes au démarrage
  useEffect(() => {
    loadGroups();
    loadSavedData();
  }, []);

  // Charger les groupes depuis l'API
  const loadGroups = async () => {
    setIsLoadingGroups(true);
    try {
      console.log('🔄 Chargement des groupes depuis la base de données fragDb...');
      const groupsData = await apiService.getGroups();
      
      const mappedGroups: Group[] = groupsData.map((group: any) => ({
        id: group.id,
        name: group.name
      }));
      
      setGroups(mappedGroups);
      console.log(`✅ ${mappedGroups.length} groupes chargés avec succès`);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des groupes depuis la base:', error);
      // Fallback vers les données simulées en cas d'erreur
      const mockGroups: Group[] = [
        { id: 1, name: 'Connexion en cours...' },
        { id: 2, name: 'Veuillez patienter...' }
      ];
      setGroups(mockGroups);
      console.log('⚠️ Utilisation des données de fallback');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Charger les tifos automatiquement quand un groupe est sélectionné
  const loadTifosForGroup = async (groupId: number) => {
    setIsLoadingTifos(true);
    setTifos([]);
    setSelectedTifo(null);
    setUserPlaceNumber('');
    
    try {
      console.log(`🔄 Chargement des tifos pour le groupe ${groupId}...`);
      const tifosData = await apiService.getTifosByGroup(groupId);
      
      const mappedTifos: TifoInfo[] = tifosData.map((tifo: any) => ({
        id: tifo.tifo_id,
        name: tifo.tifo_name,
        places: tifo.NP,
        group_id: groupId
      }));
      
      setTifos(mappedTifos);
      console.log(`✅ ${mappedTifos.length} tifos chargés pour le groupe ${groupId}`);
      
    } catch (error) {
      console.error(`❌ Erreur lors du chargement des tifos du groupe ${groupId}:`, error);
      // Fallback vers les données simulées
      const mockTifos: TifoInfo[] = [
        { id: 1, name: 'Connexion en cours...', places: 0, group_id: groupId },
        { id: 2, name: 'Veuillez patienter...', places: 0, group_id: groupId }
      ];
      setTifos(mockTifos);
    } finally {
      setIsLoadingTifos(false);
    }
  };

  // Télécharger et valider le tifo sélectionné
  const downloadAndValidateTifo = async () => {
    if (!selectedTifo || !userPlaceNumber || !selectedGroup) return;
    
    const placeNum = parseInt(userPlaceNumber);
    if (placeNum < 1 || placeNum > selectedTifo.places) {
      alert(`Le numéro de place doit être entre 1 et ${selectedTifo.places}`);
      return;
    }
    
    setIsDownloadingData(true);
    try {
      console.log(`🔄 Validation et téléchargement: ${selectedGroup.name}, ${selectedTifo.name}, place ${placeNum}...`);
      
      // Première étape : Validation des données avec l'API
      const validationResult = await apiService.validateData(
        selectedGroup.name, 
        selectedTifo.name, 
        placeNum
      );
      
      if (!validationResult.success) {
        alert(`Erreur de validation: ${validationResult.error}`);
        return;
      }
      
      console.log('✅ Validation réussie, téléchargement des données...');
      
      // Deuxième étape : Récupération des données complètes du tifo
      const tifoApiData = await apiService.getTifoDataByParams(
        selectedGroup.name,
        selectedTifo.name,
        placeNum
      );
      
      const tifoData: TifoState = {
        colors: tifoApiData.colors,
        palette: tifoApiData.palette,
        durations: tifoApiData.durations,
        icons: tifoApiData.icons,
        mp3_local: tifoApiData.mp3_url,
        groupe: tifoApiData.group_name,
        nom: tifoApiData.tifo_name,
        places: tifoApiData.NP,
        userPlace: placeNum
      };
      
      dispatch(setCurrentData(tifoData));
      
      const savedItem: SavedTifoData = {
        id: Date.now().toString(),
        group_name: tifoApiData.group_name,
        tifo_name: tifoApiData.tifo_name,
        place_number: placeNum,
        data: tifoData,
        timestamp: Date.now()
      };
      
      addTifoToMemory(savedItem);
      console.log(`✅ Tifo "${tifoApiData.tifo_name}" validé et stocké en mémoire slot 0`);
      
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement des données du tifo:', error);
      alert('Erreur lors du téléchargement. Vérifiez votre connexion et réessayez.');
    } finally {
      setIsDownloadingData(false);
    }
  };

  // Charger les slots mémoire depuis localStorage
  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('tiforama_memory_slots');
      if (saved) {
        const slots = JSON.parse(saved);
        setMemorySlots(slots);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  // Sauvegarder les slots mémoire dans localStorage
  const saveMemorySlots = (newSlots: (SavedTifoData | null)[]) => {
    try {
      localStorage.setItem('tiforama_memory_slots', JSON.stringify(newSlots));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Ajouter un nouveau tifo en mémoire (slot 0) et décaler les autres
  const addTifoToMemory = (newTifo: SavedTifoData) => {
    const newSlots = [newTifo, ...memorySlots.slice(0, 9)]; // Décaler et garder max 10
    setMemorySlots(newSlots);
    saveMemorySlots(newSlots);
  };

  // Supprimer un tifo d'un slot spécifique
  const removeTifoFromMemory = (slotIndex: number) => {
    const newSlots = [...memorySlots];
    
    // Supprimer l'élément et décaler tous les suivants vers la gauche
    for (let i = slotIndex; i < 9; i++) {
      newSlots[i] = newSlots[i + 1];
    }
    newSlots[9] = null; // Le dernier slot devient vide
    
    setMemorySlots(newSlots);
    saveMemorySlots(newSlots);
    setShowDeleteConfirm(null);
  };

  // Gestionnaires d'événements
  const handleGroupChange = (event: any, newValue: Group | null) => {
    setSelectedGroup(newValue);
    setSelectedTifo(null);
    setUserPlaceNumber('');
    
    if (newValue) {
      loadTifosForGroup(newValue.id);
    } else {
      setTifos([]);
    }
  };

  const handleTifoChange = (event: any, newValue: TifoInfo | null) => {
    setSelectedTifo(newValue);
    setUserPlaceNumber(''); // Reset du numéro de place
  };

  const handlePlaceNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setUserPlaceNumber(value);
  };

  // Vérifier si le bouton Valider peut être activé
  const canValidate = () => {
    if (!selectedTifo || !userPlaceNumber) return false;
    const placeNum = parseInt(userPlaceNumber);
    return placeNum >= 1 && placeNum <= selectedTifo.places;
  };

  // Gestionnaires pour l'appui long sur les cercles mémoire
  const handleMemorySlotMouseDown = (slotIndex: number) => {
    if (memorySlots[slotIndex] === null) return; // Slot vide
    
    const timer = setTimeout(() => {
      setShowDeleteConfirm(slotIndex);
    }, 800); // Appui long de 800ms
    
    setLongPressTimer(timer);
  };

  const handleMemorySlotMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMemorySlotClick = (slotIndex: number) => {
    const tifoData = memorySlots[slotIndex];
    if (!tifoData) return; // Slot vide
    
    // Charger ce tifo comme données actuelles
    dispatch(setCurrentData(tifoData.data));
    
    // Mettre à jour les sélections
    const group = groups.find(g => g.name === tifoData.group_name);
    setSelectedGroup(group || null);
    
    const tifo = tifos.find(t => t.name === tifoData.tifo_name);
    setSelectedTifo(tifo || null);
    setUserPlaceNumber(tifoData.place_number.toString());
  };

  // Fonction pour réinitialiser complètement la page
  const resetPage = () => {
    // Réinitialiser tous les états du formulaire
    setSelectedGroup(null);
    setSelectedTifo(null);
    setUserPlaceNumber('');
    setTifos([]);
    
    // Réinitialiser les états de chargement
    setIsLoadingGroups(false);
    setIsLoadingTifos(false);
    setIsDownloadingData(false);
    
    // Fermer les dialogs ouverts
    setShowDeleteConfirm(null);
    
    // Recharger les groupes depuis l'API
    loadGroups();
    
    // Resynchroniser l'horloge UTC
    syncTimeWithServer();
    
    console.log('🔄 Page réinitialisée avec resynchronisation UTC');
  };

  const confirmDelete = (slotIndex: number) => {
    removeTifoFromMemory(slotIndex);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <FormContainer>
      {/* Header fixe comme dans Flutter */}
      <FlutterHeader position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#90EE90',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2
              }}
            >
              <Typography variant="body2" sx={{ color: 'black', fontWeight: 'bold' }}>
                T
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Tiforama
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {currentTime}
            </Typography>
            {/* Toujours afficher l'offset avec indicateur du mode */}
            <Typography 
              variant="caption" 
              sx={{ 
                color: isOfflineMode ? '#ff9800' : timeOffset === 0 ? 'rgba(255, 255, 255, 0.5)' : timeOffset > 0 ? '#ff4444' : '#4CAF50', // Orange si hors connexion, blanc semi-transparent si 0, rouge si positif, vert si négatif
                fontSize: '10px',
                lineHeight: 1
              }}
            >
              {isOfflineMode && '📴 '}{timeOffset > 0 ? '+' : ''}{timeOffset}ms
            </Typography>
          </Box>
        </Toolbar>
      </FlutterHeader>

      <MainContent>
        {/* Composant de test de connexion API */}
        <ConnectionTest />
        
        {/* Formulaire principal - Exactement comme la capture Flutter */}
        <Box sx={{ mb: 4 }}>
          {/* Champ 1: Sélection du Groupe avec icône crayon */}
          <StyledAutocomplete
            options={groups}
            getOptionLabel={(option) => option.name}
            value={selectedGroup}
            onChange={handleGroupChange}
            loading={isLoadingGroups}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Sélectionnez votre groupe"
                placeholder="Sélectionnez votre groupe"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingGroups ? <CircularProgress color="inherit" size={20} /> : null}
                      <EditIcon sx={{ color: '#90EE90', mr: 1 }} />
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          
          {/* Champ 2: Sélection du Tifo SANS icône crayon */}
          <StyledAutocomplete
            options={tifos}
            getOptionLabel={(option) => option.name}
            value={selectedTifo}
            onChange={handleTifoChange}
            disabled={!selectedGroup}
            loading={isLoadingTifos}
            renderInput={(params) => (
              <StyledTextField
                {...params}
                label="Sélectionnez votre tifo"
                placeholder="Sélectionnez votre tifo"
                fullWidth
                InputLabelProps={{
                  ...params.InputLabelProps,
                  style: { color: '#90EE90', fontSize: 14 }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingTifos ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Champ 3: Numéro de place avec affichage personnalisé */}
          <PlaceNumberField>
            <StyledTextField
              fullWidth
              label={selectedTifo ? "" : "Numéro de place"} // Masquer le label quand un tifo est sélectionné
              value={userPlaceNumber}
              onChange={handlePlaceNumberChange}
              placeholder={selectedTifo ? "" : "Numéro de place"} // Masquer le placeholder aussi
              type="number"
              inputProps={{ 
                min: 1, 
                max: selectedTifo?.places || 999,
                step: 1,
                style: { 
                  color: userPlaceNumber ? 'transparent' : 'white', // Transparent seulement si il y a du texte
                  caretColor: '#90EE90' // Curseur visible en vert
                } 
              }}
              error={userPlaceNumber !== '' && selectedTifo !== null && !canValidate()}
              helperText={
                userPlaceNumber !== '' && selectedTifo && !canValidate() 
                  ? `Le numéro doit être entre 1 et ${selectedTifo.places}` 
                  : ''
              }
            />
            {/* Overlay avec affichage personnalisé */}
            <PlaceDisplayOverlay>
              {userPlaceNumber ? (
                // Mode saisie : afficher "userInput/total" en rouge et blanc
                <>
                  <span style={{ color: '#ff4444', fontWeight: 'bold' }}>
                    {userPlaceNumber}
                  </span>
                  <span style={{ color: '#ff4444' }}>/</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {selectedTifo?.places}
                  </span>
                </>
              ) : selectedTifo ? (
                // Mode placeholder : afficher "/total" en gris pour guider l'utilisateur
                <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic' }}>
                  /{selectedTifo.places}
                </span>
              ) : null}
            </PlaceDisplayOverlay>
          </PlaceNumberField>

          {/* Bouton Valider - Style Flutter */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <FlutterValidateButton
              onClick={downloadAndValidateTifo}
              disabled={!canValidate() || isDownloadingData}
              variant="contained"
              className={userPlaceNumber ? 'full-white' : 'semi-transparent'}
            >
              {isDownloadingData ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                  Téléchargement...
                </>
              ) : (
                'Valider'
              )}
            </FlutterValidateButton>
          </Box>

          {/* 10 cercles de mémoire en grille 2x5 comme Flutter */}
          <MemoryCirclesContainer>
            {Array.from({ length: 10 }, (_, index) => {
              const tifoInSlot = memorySlots[index];
              const isOccupied = tifoInSlot !== null;
              
              return (
                <MemoryCircle 
                  key={index} 
                  $isActive={isOccupied}
                  onClick={() => handleMemorySlotClick(index)}
                  onMouseDown={() => handleMemorySlotMouseDown(index)}
                  onMouseUp={handleMemorySlotMouseUp}
                  onMouseLeave={handleMemorySlotMouseUp}
                  title={tifoInSlot ? `${tifoInSlot.group_name} - ${tifoInSlot.tifo_name} (Place ${tifoInSlot.place_number})` : `Slot ${index} vide`}
                >
                  {index}
                </MemoryCircle>
              );
            })}
          </MemoryCirclesContainer>
        </Box>

        {/* Bouton refresh fixe en bas à droite */}
        <RefreshButton onClick={resetPage}>
          <RefreshIcon />
        </RefreshButton>
      </MainContent>

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={showDeleteConfirm !== null} 
        onClose={cancelDelete}
        PaperProps={{
          sx: {
            bgcolor: 'grey.900',
            border: '1px solid',
            borderColor: 'grey.700'
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
          Supprimer le tifo
        </DialogTitle>
        <DialogContent>
          {showDeleteConfirm !== null && memorySlots[showDeleteConfirm] && (
            <Typography sx={{ color: 'grey.300' }}>
              Voulez-vous supprimer le tifo :<br />
              <strong>{memorySlots[showDeleteConfirm]?.group_name}</strong> - <strong>{memorySlots[showDeleteConfirm]?.tifo_name}</strong><br />
              (Place {memorySlots[showDeleteConfirm]?.place_number}) du slot mémoire {showDeleteConfirm} ?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} sx={{ color: 'grey.400' }}>
            Annuler
          </Button>
          <Button 
            onClick={() => showDeleteConfirm !== null && confirmDelete(showDeleteConfirm)} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </FormContainer>
  );
};
