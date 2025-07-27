const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de test de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fragDb',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
};

async function testDatabaseConnection() {
  console.log('🔄 Test de connexion à la base de données fragTrama...');
  console.log('Configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    password: dbConfig.password ? '***' : 'NON DEFINI'
  });

  try {
    // Créer une connexion
    const connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connexion à la base de données fragDb réussie !');
    
    // Tester les tables principales
    const tables = ['groups', 'tifos', 'nombre_places', 'durations', 'icons', 'palettes', 'mp3_urls', 'places'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 Table ${table}: ${rows[0].count} enregistrements`);
      } catch (error) {
        console.log(`❌ Table ${table}: ERREUR - ${error.message}`);
      }
    }
    
    // Test d'une requête de groupes
    try {
      const [groups] = await connection.execute(`
        SELECT 
          g.id,
          g.name,
          COUNT(t.id) as tifo_count
        FROM groups g
        LEFT JOIN tifos t ON g.id = t.group_id
        GROUP BY g.id, g.name
        ORDER BY g.name
        LIMIT 5
      `);
      
      console.log('🎯 Groupes disponibles:');
      groups.forEach(group => {
        console.log(`   - ${group.name}: ${group.tifo_count} tifos`);
      });
      
    } catch (error) {
      console.log(`❌ Erreur requête groupes: ${error.message}`);
    }

    // Test d'une requête de tifos
    try {
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
        LIMIT 10
      `);
      
      console.log('🎨 Tifos disponibles:');
      tifos.forEach(tifo => {
        console.log(`   - ${tifo.group_name}: "${tifo.tifo_name}" (${tifo.NP || 'N/A'} places)`);
      });
      
    } catch (error) {
      console.log(`❌ Erreur requête tifos: ${error.message}`);
    }
    
    await connection.end();
    console.log('✅ Test terminé avec succès ! Votre base de données est prête.');
    console.log('🚀 Vous pouvez maintenant démarrer votre serveur avec: node server.js');
    
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solutions possibles:');
      console.log('1. Vérifiez que MySQL est démarré');
      console.log('2. Vérifiez l\'adresse et le port (localhost:3306)');
      console.log('3. Vérifiez les paramètres firewall');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Problème d\'authentification:');
      console.log('1. Vérifiez le nom d\'utilisateur: u292729667_moha_bibi');
      console.log('2. Vérifiez le mot de passe dans .env');
      console.log('3. Vérifiez les permissions de l\'utilisateur MySQL');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Base de données inexistante:');
      console.log('1. Créez la base de données "fragDb"');
      console.log('2. Vérifiez que l\'utilisateur a accès à cette base');
    }
  }
}

// Exécuter le test
testDatabaseConnection();
