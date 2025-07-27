import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { RootState } from '../store';
import { loadTifoData, saveTifoData } from '../store/tifoSlice';

export const ApiTestComponent: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    availableTifos, 
    isLoading, 
    loadError, 
    isSaving, 
    saveError 
  } = useSelector((state: RootState) => state.tifo);

  const handleLoadTifos = () => {
    dispatch(loadTifoData() as any);
  };

  const handleTestSave = () => {
    // Tifo de test
    const testTifo = {
      colors: [1, 2, 3, 1, 2],
      durations: [1000, 1500, 2000, 1000, 1500],
      palette: ['#ff0000', '#00ff00', '#0000ff'],
      icons: ['🔴', '🟢', '🔵'],
      mp3_local: 'https://example.com/test.mp3'
    };

    dispatch(saveTifoData({
      data: testTifo,
      groupName: 'Test React Group',
      tifoName: 'Test Tifo from React'
    }) as any);
  };

  useEffect(() => {
    // Charger les tifos au montage du composant
    handleLoadTifos();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Test de connexion API
      </Typography>

      {/* Section de chargement */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Chargement des Tifos
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={handleLoadTifos}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Charger les Tifos'}
          </Button>

          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erreur de chargement: {loadError}
            </Alert>
          )}

          <Typography variant="body1">
            Tifos chargés: {availableTifos.length}
          </Typography>

          {availableTifos.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Liste des Tifos:</Typography>
              {availableTifos.map((tifo, index) => (
                <Card key={index} variant="outlined" sx={{ mt: 1, p: 1 }}>
                  <Typography variant="body2">
                    Tifo {index + 1}: {tifo.colors.length} places, {tifo.palette.length} couleurs
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Durées: {tifo.durations.join(', ')}ms
                  </Typography>
                </Card>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Section de sauvegarde */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test de Sauvegarde
          </Typography>
          
          <Button 
            variant="contained" 
            color="secondary"
            onClick={handleTestSave}
            disabled={isSaving}
            sx={{ mb: 2 }}
          >
            {isSaving ? <CircularProgress size={20} /> : 'Sauvegarder un Tifo Test'}
          </Button>

          {saveError && (
            <Alert severity="error">
              Erreur de sauvegarde: {saveError}
            </Alert>
          )}

          {isSaving && (
            <Typography variant="body2" color="primary">
              Sauvegarde en cours...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
