const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3020;

// Middleware
app.use(bodyParser.json({ limit: '60mb' }));
app.use(cors());

// Ajout de l'encodage UTF-8 pour les réponses
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.charset = 'utf-8';
  next();
});

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fragDb',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  multipleStatements: false,
  acquireTimeout: 60000,
  timeout: 60000,
};

console.log('🔧 Configuration de la base de données:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Password défini: ${dbConfig.password ? 'OUI' : 'NON'}`);

// Création d'un pool MySQL
const pool = mysql.createPool(dbConfig);

// Test de connexion au démarrage
(async () => {
  try {
    console.log('🔌 Test de connexion à la base de données...');
    const connection = await pool.getConnection();
    console.log('✅ Connexion à MySQL réussie !');
    
    // Test rapide de la structure
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 ${tables.length} tables trouvées dans la base`);
    
    connection.release();
  } catch (error) {
    console.error('❌ ERREUR DE CONNEXION MYSQL:', error.message);
    console.error('   Code:', error.code);
    console.error('   → Le serveur fonctionnera en mode dégradé avec des données simulées');
  }
})();

// Route d'accueil
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API fragTrama !");
});

// ========== NOUVELLES ROUTES GET ==========

// Route pour récupérer tous les groupes
app.get('/api/groups', async (req, res) => {
  try {
    console.log('📡 Requête API: /api/groups');
    const connection = await pool.getConnection();
    console.log('🔌 Connexion MySQL obtenue');
    
    const [groups] = await connection.execute(`
      SELECT 
        g.id,
        g.name,
        COUNT(t.id) as tifo_count
      FROM groups g
      LEFT JOIN tifos t ON g.id = t.group_id
      GROUP BY g.id, g.name
      ORDER BY g.name
    `);

    connection.release();
    console.log(`✅ ${groups.length} groupes récupérés depuis la BDD`);
    res.json(groups);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des groupes :', error.message);
    console.error('   Code erreur:', error.code);
    
    // Mode fallback avec données simulées
    console.log('⚠️ Activation du mode fallback avec données simulées');
    const fallbackGroups = [
      { id: 1, name: 'Mode Démo - Groupe Test 1', tifo_count: 2 },
      { id: 2, name: 'Mode Démo - Groupe Test 2', tifo_count: 3 },
      { id: 3, name: 'Mode Démo - Supporters Local', tifo_count: 1 }
    ];
    
    res.json(fallbackGroups);
  }
});

// Route pour récupérer les tifos d'un groupe spécifique
app.get('/api/groups/:groupId/tifos', async (req, res) => {
  const groupId = req.params.groupId;
  
  try {
    console.log(`📡 Requête API: /api/groups/${groupId}/tifos`);
    const connection = await pool.getConnection();
    console.log('🔌 Connexion MySQL obtenue');
    
    const [tifos] = await connection.execute(`
      SELECT 
        t.id as tifo_id,
        t.name as tifo_name,
        g.name as group_name,
        np.nombre as NP
      FROM tifos t
      JOIN groups g ON t.group_id = g.id
      LEFT JOIN nombre_places np ON t.id = np.tifo_id
      WHERE g.id = ?
      ORDER BY t.name
    `, [groupId]);

    connection.release();
    console.log(`✅ ${tifos.length} tifos récupérés pour le groupe ${groupId}`);
    res.json(tifos);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tifos du groupe :', error.message);
    console.error('   Code erreur:', error.code);
    
    // Mode fallback avec données simulées
    console.log(`⚠️ Activation du mode fallback pour les tifos du groupe ${groupId}`);
    const fallbackTifos = [
      { 
        tifo_id: 1, 
        tifo_name: `Demo Tifo 1 - Groupe ${groupId}`, 
        group_name: `Demo Group ${groupId}`,
        NP: 100
      },
      { 
        tifo_id: 2, 
        tifo_name: `Demo Tifo 2 - Groupe ${groupId}`, 
        group_name: `Demo Group ${groupId}`,
        NP: 150
      }
    ];
    
    res.json(fallbackTifos);
  }
});

// Route pour récupérer tous les tifos avec leurs données
app.get('/api/tifos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Récupérer tous les tifos avec leurs groupes
    const [tifos] = await connection.execute(`
      SELECT 
        t.id as tifo_id,
        t.name as tifo_name,
        g.name as group_name,
        np.nombre as NP
      FROM tifos t
      JOIN groups g ON t.group_id = g.id
      LEFT JOIN nombre_places np ON t.id = np.tifo_id
      ORDER BY g.name, t.name
    `);

    const result = [];

    for (const tifo of tifos) {
      // Récupérer les durées
      const [durations] = await connection.execute(
        'SELECT duration FROM durations WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer les icônes
      const [icons] = await connection.execute(
        'SELECT icon FROM icons WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer la palette
      const [palette] = await connection.execute(
        'SELECT color FROM palettes WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer l'URL MP3
      const [mp3Urls] = await connection.execute(
        'SELECT url FROM mp3_urls WHERE tifo_id = ? LIMIT 1',
        [tifo.tifo_id]
      );

      // Récupérer les places et reconstruire les collections
      const [places] = await connection.execute(
        'SELECT place_number, color_index FROM places WHERE tifo_id = ? ORDER BY place_number, color_index',
        [tifo.tifo_id]
      );

      const collections = {};
      const colors = [];

      places.forEach(place => {
        if (!collections[place.place_number]) {
          collections[place.place_number] = [];
        }
        collections[place.place_number].push(place.color_index);
        
        // Pour la compatibilité React, on crée aussi un tableau simple colors
        colors[place.place_number - 1] = place.color_index;
      });

      result.push({
        tifo_id: tifo.tifo_id,
        group_name: tifo.group_name,
        tifo_name: tifo.tifo_name,
        durations: durations.map(d => d.duration),
        icons: icons.map(i => i.icon),
        palette: palette.map(p => p.color),
        mp3_url: mp3Urls[0]?.url || '',
        collections,
        colors, // Format simplifié pour React
        NP: tifo.NP
      });
    }

    connection.release();
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des tifos :', error.message);
    res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
});

// Route pour récupérer un tifo spécifique par ID
app.get('/api/tifos/:id', async (req, res) => {
  const tifoId = req.params.id;
  
  try {
    console.log(`📡 Requête API: /api/tifos/${tifoId}`);
    const connection = await pool.getConnection();
    console.log('🔌 Connexion MySQL obtenue');
    
    // Récupérer le tifo spécifique
    const [tifoResult] = await connection.execute(`
      SELECT 
        t.id as tifo_id,
        t.name as tifo_name,
        g.name as group_name,
        np.nombre as NP
      FROM tifos t
      JOIN groups g ON t.group_id = g.id
      LEFT JOIN nombre_places np ON t.id = np.tifo_id
      WHERE t.id = ?
    `, [tifoId]);

    if (tifoResult.length === 0) {
      connection.release();
      console.log(`⚠️ Tifo ${tifoId} non trouvé en BDD`);
      return res.status(404).json({ error: 'Tifo non trouvé' });
    }

    const tifo = tifoResult[0];
    console.log(`✅ Tifo trouvé: ${tifo.tifo_name}`);

    // Récupérer toutes les données du tifo (même logique que ci-dessus)
    const [durations] = await connection.execute(
      'SELECT duration FROM durations WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [icons] = await connection.execute(
      'SELECT icon FROM icons WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [palette] = await connection.execute(
      'SELECT color FROM palettes WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [mp3Urls] = await connection.execute(
      'SELECT url FROM mp3_urls WHERE tifo_id = ? LIMIT 1',
      [tifo.tifo_id]
    );

    const [places] = await connection.execute(
      'SELECT place_number, color_index FROM places WHERE tifo_id = ? ORDER BY place_number, color_index',
      [tifo.tifo_id]
    );

    const collections = {};
    const colors = [];

    places.forEach(place => {
      if (!collections[place.place_number]) {
        collections[place.place_number] = [];
      }
      collections[place.place_number].push(place.color_index);
      colors[place.place_number - 1] = place.color_index;
    });

    const result = {
      tifo_id: tifo.tifo_id,
      group_name: tifo.group_name,
      tifo_name: tifo.tifo_name,
      durations: durations.map(d => d.duration),
      icons: icons.map(i => i.icon),
      palette: palette.map(p => p.color),
      mp3_url: mp3Urls[0]?.url || '',
      collections,
      colors,
      NP: tifo.NP
    };

    connection.release();
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération du tifo :', error.message);
    res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
});

// ========== ROUTE POST EXISTANTE ==========

// Route pour ajouter des données
app.post('/add', async (req, res) => {
  const { group_name, tifo_name, durations, icons, mp3_url, collections, palette, NP } = req.body;

  if (!group_name || !tifo_name || !durations || !icons || !mp3_url || !collections || !palette || NP === undefined) {
    return res.status(400).json({ error: 'Paramètres manquants ou invalides' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    // Insérer dans la table "groups"
    const [groupResult] = await connection.execute(
      `INSERT INTO groups (name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [group_name]
    );
    const groupId = groupResult.insertId;

    // Insérer dans la table "tifos"
    const [tifoResult] = await connection.execute(
      `INSERT INTO tifos (name, group_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      [tifo_name, groupId]
    );
    const tifoId = tifoResult.insertId;

    // Insérer dans la table "durations"
    for (const duration of durations) {
      await connection.execute(
        `INSERT INTO durations (tifo_id, duration) VALUES (?, ?)`,
        [tifoId, duration]
      );
    }

    // Insérer dans la table "icons"
    for (const icon of icons) {
      await connection.execute(
        `INSERT INTO icons (tifo_id, icon) VALUES (?, ?)`,
        [tifoId, icon]
      );
    }

    // Insérer dans la table "mp3_urls"
    await connection.execute(
      `INSERT INTO mp3_urls (tifo_id, url) VALUES (?, ?) ON DUPLICATE KEY UPDATE url=VALUES(url)`,
      [tifoId, mp3_url]
    );

    // Insérer dans la table "palettes"
    for (const color of palette) {
      await connection.execute(
        `INSERT INTO palettes (tifo_id, color) VALUES (?, ?)`,
        [tifoId, color]
      );
    }

    // Insérer dans la table "nombre_places"
    await connection.execute(
      `INSERT INTO nombre_places (tifo_id, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre)`,
      [tifoId, NP]
    );

    // Insérer dans la table "places" à partir des collections
    for (const [placeNumber, colorIndices] of Object.entries(collections)) {
      for (const colorIndex of colorIndices) {
        await connection.execute(
          `INSERT INTO places (tifo_id, place_number, color_index) VALUES (?, ?, ?)`,
          [tifoId, parseInt(placeNumber), colorIndex]
        );
      }
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Données ajoutées avec succès', tifo_id: tifoId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données :', error.message);
    res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`API en cours d'exécution sur le port ${PORT}`);
  console.log(`Routes disponibles:`);
  console.log(`  GET  /api/groups           - Récupérer tous les groupes`);
  console.log(`  GET  /api/groups/:id/tifos - Récupérer les tifos d'un groupe`);
  console.log(`  GET  /api/tifos            - Récupérer tous les tifos`);
  console.log(`  GET  /api/tifos/:id        - Récupérer un tifo par ID`);
  console.log(`  POST /add                  - Ajouter un nouveau tifo`);
});
