const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3030;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '60mb' }));

// Données de test correspondant à votre structure de base
const mockGroups = [
    { id: 1, name: 'Supporters Nord' },
    { id: 2, name: 'Ultras Sud' },
    { id: 3, name: 'Tribune Est' }
];

const mockTifos = {
    1: [
        { id: 1, name: 'Tifo Victoire', group_id: 1 },
        { id: 2, name: 'Chorégraphie Flammes', group_id: 1 }
    ],
    2: [
        { id: 3, name: 'Mosaïque Géante', group_id: 2 },
        { id: 4, name: 'Animation Lumière', group_id: 2 }
    ],
    3: [
        { id: 5, name: 'Banderoles Unies', group_id: 3 }
    ]
};

const mockTifoData = {
    'Supporters Nord_Tifo Victoire': {
        colors: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0],
        icons: ['🔴', '⚪', '🔵', '⚡'],
        durations: [1000, 1500, 2000, 1200],
        palette: ['#FF0000', '#FFFFFF', '#0000FF', '#FFD700'],
        mp3: null,
        nombre_places: 150
    },
    'Supporters Nord_Chorégraphie Flammes': {
        colors: [1, 3, 1, 3, 1, 3, 1, 3, 1, 3],
        icons: ['🔥', '💥', '⭐', '🌟'],
        durations: [800, 1200, 1600, 1000],
        palette: ['#FF4500', '#FFD700', '#FF6347', '#FFA500'],
        mp3: null,
        nombre_places: 200
    },
    'Ultras Sud_Mosaïque Géante': {
        colors: [2, 0, 2, 0, 2, 0, 2, 0, 2, 0],
        icons: ['🟦', '🟥', '⬜', '🟨'],
        durations: [2000, 1800, 2200, 1900],
        palette: ['#0066CC', '#CC0000', '#FFFFFF', '#FFCC00'],
        mp3: null,
        nombre_places: 300
    },
    'Ultras Sud_Animation Lumière': {
        colors: [3, 3, 0, 0, 1, 1, 2, 2, 3, 3],
        icons: ['💡', '🌟', '✨', '⚡'],
        durations: [500, 800, 1200, 600],
        palette: ['#FFFF00', '#00FF00', '#FF00FF', '#00FFFF'],
        mp3: null,
        nombre_places: 180
    },
    'Tribune Est_Banderoles Unies': {
        colors: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        icons: ['🏴', '🏳️', '🚩', '🎌'],
        durations: [3000, 2500, 3500, 2800],
        palette: ['#000000', '#FFFFFF', '#808080', '#C0C0C0'],
        mp3: null,
        nombre_places: 100
    }
};

// Route d'accueil
app.get('/', (req, res) => {
    res.send("Bienvenue sur l'API FragTifo de développement !");
});

// Route pour récupérer tous les groupes
app.get('/groups', (req, res) => {
    console.log('📡 Requête GET /groups');
    res.json(mockGroups);
});

// Route pour récupérer les tifos d'un groupe
app.get('/tifos/:groupId', (req, res) => {
    const { groupId } = req.params;
    console.log(`📡 Requête GET /tifos/${groupId}`);
    
    const tifos = mockTifos[groupId] || [];
    res.json(tifos);
});

// Route pour récupérer la dernière place d'un tifo
app.get('/places/last/:tifoId', (req, res) => {
    const { tifoId } = req.params;
    console.log(`📡 Requête GET /places/last/${tifoId}`);
    
    // Simuler une dernière place utilisée
    const lastPlace = Math.floor(Math.random() * 50) + 1;
    res.json({ lastPlace });
});

// Route de validation des données
app.post('/validate', (req, res) => {
    const { groupName, tifoName, placeNumber } = req.body;
    console.log(`📡 Requête POST /validate`, { groupName, tifoName, placeNumber });
    
    // Vérifier que le groupe existe
    const group = mockGroups.find(g => g.name === groupName);
    if (!group) {
        return res.status(400).json({ 
            success: false, 
            error: 'Groupe non trouvé' 
        });
    }
    
    // Vérifier que le tifo existe dans ce groupe
    const groupTifos = mockTifos[group.id] || [];
    const tifo = groupTifos.find(t => t.name === tifoName);
    if (!tifo) {
        return res.status(400).json({ 
            success: false, 
            error: 'Tifo non trouvé dans ce groupe' 
        });
    }
    
    // Vérifier que le numéro de place est valide
    const key = `${groupName}_${tifoName}`;
    const tifoData = mockTifoData[key];
    if (!tifoData) {
        return res.status(400).json({ 
            success: false, 
            error: 'Données du tifo non trouvées' 
        });
    }
    
    if (placeNumber < 1 || placeNumber > tifoData.nombre_places) {
        return res.status(400).json({ 
            success: false, 
            error: `Numéro de place invalide. Doit être entre 1 et ${tifoData.nombre_places}` 
        });
    }
    
    res.json({ 
        success: true, 
        message: 'Toutes les données sont valides' 
    });
});

// Route principale pour récupérer les données d'un tifo
app.get('/data', (req, res) => {
    const { groupe, tifo, place } = req.query;
    console.log(`📡 Requête GET /data`, { groupe, tifo, place });
    
    if (!groupe || !tifo || place === undefined) {
        return res.status(400).json({
            error: "Paramètres manquants. Utilisez ?groupe=nom_du_groupe&tifo=nom_du_tifo&place=numero"
        });
    }
    
    // Construire la clé pour les données mockées
    const key = `${groupe}_${tifo}`;
    const tifoData = mockTifoData[key];
    
    if (!tifoData) {
        return res.status(404).json({ 
            error: "Données du tifo non trouvées" 
        });
    }
    
    // Vérifier que la place est valide
    const placeNum = parseInt(place);
    if (placeNum < 1 || placeNum > tifoData.nombre_places) {
        return res.status(404).json({
            error: `Place ${place} invalide. Doit être entre 1 et ${tifoData.nombre_places}`
        });
    }
    
    // Retourner les données complètes
    res.status(200).json({
        groupe,
        tifo,
        place: place.toString(),
        colors: tifoData.colors,
        icons: tifoData.icons,
        durations: tifoData.durations,
        palette: tifoData.palette,
        mp3: tifoData.mp3,
        nombre_places: tifoData.nombre_places
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 API FragTifo de développement en cours d'exécution sur le port ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log('📋 Routes disponibles:');
    console.log('   GET  / - Page d\'accueil');
    console.log('   GET  /groups - Liste des groupes');
    console.log('   GET  /tifos/:groupId - Tifos d\'un groupe');
    console.log('   GET  /places/last/:tifoId - Dernière place d\'un tifo');
    console.log('   POST /validate - Validation des données');
    console.log('   GET  /data?groupe=X&tifo=Y&place=Z - Données complètes');
}).on('error', (err) => {
    console.error('❌ Erreur au démarrage du serveur:', err);
});
