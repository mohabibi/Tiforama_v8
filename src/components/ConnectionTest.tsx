import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { ApiService } from '../services/ApiService';

interface ConnectionTestProps {}

export const ConnectionTest: React.FC<ConnectionTestProps> = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error' | 'demo'>('idle');
  const [groups, setGroups] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [serverResponse, setServerResponse] = useState<string>('');

  const apiService = ApiService.getInstance();

  const testApiConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');
    setServerResponse('');
    
    try {
      console.log('🔄 Test de connexion à l\'API...');
      console.log('🌐 URL testée:', `${process.env.REACT_APP_API_URL || 'http://localhost:3020'}`);
      
      // Test 1: Connexion générale au serveur
      try {
        const healthResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3020'}/`);
        setServerResponse(`Serveur répond: ${healthResponse.status} ${healthResponse.statusText}`);
        
        if (!healthResponse.ok) {
          throw new Error(`Serveur inaccessible: ${healthResponse.status}`);
        }
      } catch (serverError: any) {
        setServerResponse(`Erreur serveur: ${serverError.message}`);
        throw new Error(`Impossible de se connecter au serveur API: ${serverError.message}`);
      }
      
      // Test 2: Récupération des groupes
      const groupsData = await apiService.getGroups();
      setGroups(groupsData);
      
      // Déterminer si c'est du vrai data ou du mock
      const isDemoMode = groupsData.some(group => group.name.includes('Mode Démo'));
      
      if (isDemoMode) {
        setConnectionStatus('demo');
        console.log('⚠️ Mode démonstration activé (serveur API ou base de données indisponible)');
      } else {
        setConnectionStatus('success');
        console.log('✅ API connectée avec succès aux vraies données !', groupsData);
      }
      
    } catch (error: any) {
      setConnectionStatus('error');
      setErrorMessage(error.message || 'Erreur de connexion inconnue');
      console.error('❌ Erreur de connexion API:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Test automatique au chargement
  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      borderRadius: 2,
      mb: 3
    }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#90EE90' }}>
        🔌 Test de Connexion API
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          onClick={testApiConnection}
          disabled={isTestingConnection}
          sx={{ backgroundColor: '#555', '&:hover': { backgroundColor: '#666' } }}
        >
          {isTestingConnection ? <CircularProgress size={20} /> : 'Tester la Connexion'}
        </Button>
        
        {connectionStatus === 'success' && (
          <Alert severity="success" sx={{ backgroundColor: '#2e7d32', color: 'white' }}>
            ✅ API connectée aux vraies données - {groups.length} groupes trouvés
          </Alert>
        )}
        
        {connectionStatus === 'demo' && (
          <Alert severity="warning" sx={{ backgroundColor: '#f57600', color: 'white' }}>
            ⚠️ Mode démonstration - Serveur API ou BDD indisponible - {groups.length} groupes simulés
          </Alert>
        )}
        
        {connectionStatus === 'error' && (
          <Alert severity="error" sx={{ backgroundColor: '#d32f2f', color: 'white' }}>
            ❌ Erreur: {errorMessage}
          </Alert>
        )}
      </Box>
      
      {groups.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#90EE90', mb: 1 }}>
            📋 Groupes disponibles:
          </Typography>
          <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
            {groups.map((group, index) => (
              <Typography key={index} variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                py: 0.5,
                px: 1,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 1,
                mb: 0.5
              }}>
                #{group.id} - {group.name}
              </Typography>
            ))}
          </Box>
        </Box>
      )}
      
      <Typography variant="caption" sx={{ 
        color: 'rgba(255,255,255,0.6)', 
        mt: 2, 
        display: 'block' 
      }}>
        📡 URL API: {process.env.REACT_APP_API_URL || 'http://localhost:3020'}
      </Typography>
      
      {serverResponse && (
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.6)', 
          mt: 1, 
          display: 'block' 
        }}>
          🔍 {serverResponse}
        </Typography>
      )}
    </Box>
  );
};
