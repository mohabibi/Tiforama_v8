import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  Card, 
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch, useAppDispatch, useAppSelector } from '../store';
import { setCurrentData, saveTifoData } from '../store/tifoSlice';
import { ApiService } from '../services/ApiService';
import { TifoState } from '../types';

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 600,
  margin: '0 auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.grey[900],
    borderRadius: 8,
  },
  '& .MuiInputLabel-root': {
    color: '#90EE90', // lightGreen comme dans Flutter
    fontSize: 12,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const HistoryCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  border: `1px solid ${theme.palette.grey[800]}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[800],
  },
}));

interface SavedTifoData {
  id: string;
  group_name: string;
  tifo_name: string;
  place_count: number;
  timestamp: number;
  data: TifoState;
}

export const TifoForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentData, isSaving, saveError } = useAppSelector((state) => state.tifo);

  // États du formulaire
  const [groupName, setGroupName] = useState('');
  const [tifoName, setTifoName] = useState('');
  const [placeNumber, setPlaceNumber] = useState('');
  const [lastPlace, setLastPlace] = useState(0);
  
  // États UI
  const [groups, setGroups] = useState<string[]>([]);
  const [savedData, setSavedData] = useState<SavedTifoData[]>([]);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [lastModified, setLastModified] = useState<'field' | 'history' | null>(null);

  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    loadSavedData();
    loadGroups();
  }, []);

  const loadSavedData = () => {
    try {
      const saved = localStorage.getItem('tiforama_saved_data');
      if (saved) {
        setSavedData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const loadGroups = async () => {
    try {
      // Simulation de chargement des groupes
      // Dans votre cas, vous pourriez avoir une API pour ça
      const mockGroups = ['Groupe A', 'Groupe B', 'Supporters United', 'Les Ultras'];
      setGroups(mockGroups);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  };

  // Gérer les changements de champs
  const handleFieldChange = (field: 'group' | 'tifo' | 'place', value: string) => {
    setLastModified('field');
    setSelectedHistoryIndex(-1);

    switch (field) {
      case 'group':
        setGroupName(value);
        break;
      case 'tifo':
        setTifoName(value);
        break;
      case 'place':
        setPlaceNumber(value);
        const num = parseInt(value);
        if (!isNaN(num) && num > 0) {
          setLastPlace(num);
        }
        break;
    }
  };

  // Sélectionner depuis l'historique
  const handleHistorySelect = (index: number) => {
    setLastModified('history');
    setSelectedHistoryIndex(index);
    
    const selected = savedData[index];
    setGroupName(selected.group_name);
    setTifoName(selected.tifo_name);
    setPlaceNumber(selected.place_count.toString());
    setLastPlace(selected.place_count);
    
    // Charger les données dans le store
    dispatch(setCurrentData(selected.data));
  };

  // Sauvegarder les données actuelles
  const handleSave = async () => {
    if (!currentData || !groupName || !tifoName) {
      alert('Veuillez remplir tous les champs et avoir des données à sauvegarder');
      return;
    }

    try {
      setIsLoading(true);
      
      // Sauvegarder via l'API
      const result = await dispatch(saveTifoData({
        data: currentData,
        groupName,
        tifoName
      })).unwrap();
      
      if (result) {
        // Succès - continuer avec la sauvegarde locale
      }

      // Sauvegarder localement pour l'historique
      const newSavedItem: SavedTifoData = {
        id: `${Date.now()}`,
        group_name: groupName,
        tifo_name: tifoName,
        place_count: lastPlace,
        timestamp: Date.now(),
        data: currentData
      };

      const updatedSaved = [newSavedItem, ...savedData.slice(0, 9)]; // Garder les 10 derniers
      setSavedData(updatedSaved);
      localStorage.setItem('tiforama_saved_data', JSON.stringify(updatedSaved));
      
      // Réinitialiser le formulaire
      setGroupName('');
      setTifoName('');
      setPlaceNumber('');
      setSelectedHistoryIndex(-1);
      setLastModified(null);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <FormContainer>
      {/* Titre de section */}
      <Typography variant="h6" sx={{ mb: 3, color: 'white', textAlign: 'center' }}>
        Configuration du Tifo
      </Typography>

      {/* Formulaire principal */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Nom du groupe"
              value={groupName}
              onChange={(e) => handleFieldChange('group', e.target.value)}
              placeholder="Entrez le nom du groupe"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Nom du tifo"
              value={tifoName}
              onChange={(e) => handleFieldChange('tifo', e.target.value)}
              placeholder="Entrez le nom du tifo"
              size="small"
            />
          </Grid>
          
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Nombre de places"
              value={placeNumber}
              onChange={(e) => handleFieldChange('place', e.target.value)}
              placeholder={`${lastPlace || 0}`}
              type="number"
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        {/* Indicateur de dernière modification */}
        {lastModified && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Chip 
              label={lastModified === 'field' ? 'Modification manuelle' : 'Sélection historique'}
              size="small"
              color={lastModified === 'field' ? 'primary' : 'secondary'}
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Bouton de sauvegarde */}
      {currentData && (groupName || tifoName) && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            sx={{
              bgcolor: '#1db954',
              '&:hover': { bgcolor: '#1ed760' },
              minWidth: 200,
              py: 1.5
            }}
          >
            {isLoading || isSaving ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder le Tifo'
            )}
          </Button>
        </Box>
      )}

      {/* Erreur de sauvegarde */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {saveError}
        </Alert>
      )}

      {/* Historique des données sauvegardées */}
      {savedData.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'white' }}>
            Historique ({savedData.length})
          </Typography>
          
          <Grid container spacing={2}>
            {savedData.map((item, index) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <HistoryCard
                  onClick={() => handleHistorySelect(index)}
                  sx={{
                    bgcolor: selectedHistoryIndex === index ? 'rgba(29, 185, 84, 0.2)' : undefined,
                    border: selectedHistoryIndex === index ? '1px solid #1db954' : undefined
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                      {item.group_name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'grey.400', mt: 0.5 }}>
                      {item.tifo_name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>
                        {item.place_count} places
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>
                        {formatDate(item.timestamp)}
                      </Typography>
                    </Box>
                  </CardContent>
                </HistoryCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Indicateur de chargement global */}
      {isLoading && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <CircularProgress size={60} />
        </Box>
      )}
    </FormContainer>
  );
};
