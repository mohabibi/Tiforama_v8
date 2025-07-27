import { TifoState } from '../types';

export type TifoData = TifoState;

// Interfaces correspondant exactement à votre API FragTifo
interface ApiGroup {
  id: number;
  name: string;
}

interface ApiTifo {
  id: number;
  name: string;
  group_id: number;
}

interface ApiDataResponse {
  groupe: string;
  tifo: string;
  place: string;
  colors: number[];
  icons: string[];
  durations: number[];
  palette: string[];
  mp3: string | null;
  nombre_places: number;
}

interface ValidationResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface LastPlaceResponse {
  lastPlace: number;
}

export class ApiService {
  private static instance: ApiService | null = null;
  private baseUrl: string;

  private constructor() {
    // Utiliser le port 3030 comme dans votre API FragTifo
    this.baseUrl = 'http://localhost:3030';
    console.log('🔗 ApiService initialisé avec FragTifo API:', this.baseUrl);
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Test de connexion au serveur FragTifo
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Test de connexion au serveur FragTifo...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const text = await response.text();
        console.log('✅ Connexion au serveur FragTifo réussie:', text);
        return true;
      } else {
        console.warn('⚠️ Serveur accessible mais réponse inattendue:', response.status);
        return false;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Erreur: Timeout de connexion au serveur FragTifo');
      } else {
        console.error('❌ Erreur: Impossible de se connecter au serveur FragTifo:', error instanceof Error ? error.message : String(error));
      }
      return false;
    }
  }

  // Récupérer tous les groupes - Route: GET /groups
  async getGroups(): Promise<ApiGroup[]> {
    try {
      console.log('📡 Récupération des groupes depuis /groups...');
      const response = await fetch(`${this.baseUrl}/groups`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        if (response.status === 500) {
          console.warn('⚠️ Erreur serveur 500 - Utilisation des données de démonstration');
          return this.getMockGroups();
        }
        
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }
      
      const groups = await response.json() as ApiGroup[];
      console.log('✅ Groupes récupérés:', groups.length);
      return groups;
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des groupes:', error);
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        console.warn('🔌 Serveur FragTifo non accessible - Mode hors ligne avec données de démonstration');
        return this.getMockGroups();
      }
      
      throw error;
    }
  }

  // Récupérer les tifos d'un groupe - Route: GET /tifos/:groupId
  async getTifosByGroup(groupId: number): Promise<ApiTifo[]> {
    try {
      console.log(`📡 Récupération des tifos pour le groupe ${groupId} depuis /tifos/${groupId}...`);
      const response = await fetch(`${this.baseUrl}/tifos/${groupId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        if (response.status === 500) {
          console.warn('⚠️ Erreur serveur 500 - Utilisation des tifos de démonstration');
          return this.getMockTifos(groupId);
        }
        
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }
      
      const tifos = await response.json() as ApiTifo[];
      console.log('✅ Tifos récupérés:', tifos.length);
      return tifos;
    } catch (error: any) {
      console.error(`❌ Erreur lors du chargement des tifos du groupe ${groupId}:`, error);
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        console.warn('🔌 Serveur FragTifo non accessible - Tifos de démonstration');
        return this.getMockTifos(groupId);
      }
      
      throw error;
    }
  }

  // Récupérer la dernière place d'un tifo - Route: GET /places/last/:tifoId
  async getLastPlace(tifoId: number): Promise<number> {
    try {
      console.log(`📡 Récupération de la dernière place pour le tifo ${tifoId} depuis /places/last/${tifoId}...`);
      const response = await fetch(`${this.baseUrl}/places/last/${tifoId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        if (response.status === 500) {
          console.warn('⚠️ Erreur serveur 500 - Utilisation d\'une place par défaut');
          return 0;
        }
        
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json() as LastPlaceResponse;
      console.log('✅ Dernière place récupérée:', result.lastPlace);
      return result.lastPlace;
    } catch (error: any) {
      console.error(`❌ Erreur lors du chargement de la dernière place du tifo ${tifoId}:`, error);
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        console.warn('🔌 Serveur FragTifo non accessible - Place par défaut');
        return 0;
      }
      
      throw error;
    }
  }

  // Récupérer les informations d'un tifo (pour connaître le nombre de places) - Approximation via GET /data
  async getTifoInfo(groupName: string, tifoName: string): Promise<{ nombre_places: number } | null> {
    try {
      console.log(`📡 Récupération des informations du tifo ${tifoName} du groupe ${groupName}...`);
      
      // Utiliser place=0 pour récupérer les métadonnées du tifo (première place en 0-based)
      const params = new URLSearchParams({
        groupe: groupName,
        tifo: tifoName,
        place: '0'
      });
      
      const response = await fetch(`${this.baseUrl}/data?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        return null;
      }
      
      const tifoData = await response.json() as ApiDataResponse;
      console.log('✅ Informations tifo récupérées:', { nombre_places: tifoData.nombre_places });
      
      return { nombre_places: tifoData.nombre_places };
    } catch (error: any) {
      console.error(`❌ Erreur lors du chargement des informations du tifo:`, error);
      return null;
    }
  }

  // Récupérer toutes les données d'un tifo pour une place spécifique - Route: GET /data
  async getTifoDataByParams(groupName: string, tifoName: string, placeNumber: number): Promise<any> {
    try {
      console.log(`📡 Récupération des données tifo depuis /data?groupe=${groupName}&tifo=${tifoName}&place=${placeNumber}...`);
      
      const params = new URLSearchParams({
        groupe: groupName,
        tifo: tifoName,
        place: placeNumber.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/data?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        
        if (response.status === 500) {
          console.warn('⚠️ Erreur serveur 500 - Utilisation des données de démonstration');
          return this.getMockTifoData(1, groupName, tifoName, placeNumber);
        }
        
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }
      
      const tifoData = await response.json() as ApiDataResponse;
      console.log('✅ Données tifo récupérées:', tifoData.tifo);
      
      // Convertir vers le format TifoState pour React
      return {
        tifo_id: 1, // Pas d'ID direct dans la réponse /data
        group_name: tifoData.groupe,
        tifo_name: tifoData.tifo,
        durations: tifoData.durations,
        icons: tifoData.icons,
        palette: tifoData.palette,
        mp3_url: tifoData.mp3 || '',
        colors: tifoData.colors,
        NP: tifoData.nombre_places,
        place_number: placeNumber
      };
    } catch (error: any) {
      console.error(`❌ Erreur lors du chargement des données tifo:`, error);
      
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Failed to fetch')) {
        console.warn('🔌 Serveur FragTifo non accessible - Données de démonstration');
        return this.getMockTifoData(1, groupName, tifoName, placeNumber);
      }
      
      throw error;
    }
  }

  // Validation des données - Route: POST /validate
  async validateData(groupName: string, tifoName: string, placeNumber: number): Promise<ValidationResponse> {
    try {
      console.log(`📡 Validation des données: ${groupName}, ${tifoName}, place ${placeNumber}...`);
      
      const response = await fetch(`${this.baseUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName,
          tifoName,
          placeNumber
        }),
      });
      
      const result = await response.json() as ValidationResponse;
      
      if (response.ok) {
        console.log('✅ Validation réussie:', result.message);
        return result;
      } else {
        console.warn('⚠️ Validation échouée:', result.error);
        return result;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la validation:', error);
      
      return {
        success: false,
        message: '',
        error: 'Erreur de connexion lors de la validation'
      };
    }
  }

  // Données de démonstration pour le mode hors ligne
  private getMockGroups(): ApiGroup[] {
    return [
      { id: 1, name: 'Mode Démo - Groupe Test 1' },
      { id: 2, name: 'Mode Démo - Groupe Test 2' },
      { id: 3, name: 'Mode Démo - Supporters Local' }
    ];
  }

  // Tifos de démonstration
  private getMockTifos(groupId: number): ApiTifo[] {
    return [
      { 
        id: 1, 
        name: `Demo Tifo 1 - Groupe ${groupId}`, 
        group_id: groupId
      },
      { 
        id: 2, 
        name: `Demo Tifo 2 - Groupe ${groupId}`, 
        group_id: groupId
      }
    ];
  }

  // Données complètes de tifo de démonstration
  private getMockTifoData(tifoId: number, groupName?: string, tifoName?: string, placeNumber?: number): any {
    return {
      tifo_id: tifoId,
      group_name: groupName || 'Demo Group',
      tifo_name: tifoName || `Demo Tifo ${tifoId}`,
      durations: [1000, 2000, 1500, 3000],
      icons: ['🔴', '🟡', '🟢', '🔵'],
      palette: ['#FF0000', '#FFFF00', '#00FF00', '#0000FF'],
      mp3_url: '',
      colors: Array.from({length: 100}, (_, i) => i % 4),
      NP: 100,
      place_number: placeNumber || 1
    };
  }

  // Méthodes de compatibilité pour l'interface existante
  public async getTifos(): Promise<TifoData[]> {
    try {
      console.warn('⚠️ getTifos() non implémenté avec la nouvelle API FragTifo - utilisation des données de démonstration');
      
      return [
        {
          colors: [0, 1, 2, 3],
          durations: [1000, 2000, 1500, 3000],
          palette: ['#FF0000', '#FFFF00', '#00FF00', '#0000FF'],
          icons: ['🔴', '🟡', '🟢', '🔵'],
          mp3_local: ''
        }
      ];
    } catch (error) {
      console.error('Error fetching tifos:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  public async addTifo(tifo: TifoData, groupName?: string, tifoName?: string): Promise<void> {
    console.warn('⚠️ addTifo() non implémenté avec cette API FragTifo - lecture seule');
    throw new Error('Cette API FragTifo est en lecture seule');
  }

  public async updateTifo(id: string, tifo: Partial<TifoData>): Promise<void> {
    console.warn('⚠️ updateTifo() non implémenté avec cette API FragTifo - lecture seule');
    throw new Error('Cette API FragTifo est en lecture seule');
  }

  public async deleteTifo(id: string): Promise<void> {
    console.warn('⚠️ deleteTifo() non implémenté avec cette API FragTifo - lecture seule');
    throw new Error('Cette API FragTifo est en lecture seule');
  }
}