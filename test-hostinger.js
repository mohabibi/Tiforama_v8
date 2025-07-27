const mysql = require('mysql2/promise');
require('dotenv').config();

// Configurations à tester pour votre VPS Hostinger (31.170.165.41)
const configs = [
  {
    name: "VPS Hostinger - IP directe",
    config: {
      host: '31.170.165.41',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
      connectTimeout: 30000,
      acquireTimeout: 30000,
      timeout: 30000,
    }
  },
  {
    name: "VPS Hostinger - Utilisateur root",
    config: {
      host: '31.170.165.41',
      user: 'root',
      password: '8ud3dqy(JlrNAGe',
      database: process.env.DB_NAME || 'u292729667_fragDb',
      port: 3306,
      connectTimeout: 30000,
      acquireTimeout: 30000,
      timeout: 30000,
    }
  },
  {
    name: "VPS Hostinger - Localhost (si exécuté sur le VPS)",
    config: {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 3306,
    }
  }
];

async function testVPSConnection() {
  console.log('🔄 Test de connexion vers votre VPS Hostinger (31.170.165.41)...\n');
  
  for (const { name, config } of configs) {
    console.log(`\n📡 Test: ${name}`);
    console.log(`Host: ${config.host}`);
    console.log(`User: ${config.user}`);
    console.log(`Database: ${config.database}`);
    console.log(`Port: ${config.port}`);
    
    try {
      console.log('⏳ Tentative de connexion...');
      const connection = await mysql.createConnection(config);
      console.log('✅ Connexion réussie !');
      
      // Test des tables
      try {
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📊 Bases de données disponibles:');
        databases.forEach(db => {
          console.log(`   - ${Object.values(db)[0]}`);
        });
        
        // Test spécifique à votre base fragDb
        const [tables] = await connection.execute(`SHOW TABLES FROM ${config.database}`);
        console.log(`\n📋 Tables dans ${config.database}:`);
        tables.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Test de requête sur la table groups
        try {
          const [groups] = await connection.execute(`SELECT COUNT(*) as count FROM ${config.database}.groups`);
          console.log(`\n🎯 Groupes dans la base: ${groups[0].count}`);
        } catch (error) {
          console.log(`⚠️ Impossible de lire la table groups: ${error.message}`);
        }
        
      } catch (error) {
        console.log(`⚠️ Erreur lors de l'exploration: ${error.message}`);
      }
      
      await connection.end();
      
      console.log('\n🎯 CETTE CONFIGURATION FONCTIONNE !');
      console.log(`Pour utiliser cette config, mettez dans .env:`);
      console.log(`DB_HOST=${config.host}`);
      console.log(`DB_USER=${config.user}`);
      console.log(`DB_PASSWORD=***`);
      console.log(`DB_NAME=${config.database}`);
      console.log(`DB_PORT=${config.port}`);
      
      break; // Arrêter après le premier succès
      
    } catch (error) {
      console.log(`❌ Échec: ${error.message}`);
      console.log(`Code: ${error.code}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('   → Le serveur MySQL refuse la connexion');
        console.log('   → Vérifiez que MySQL écoute sur le port 3306');
        console.log('   → Vérifiez les règles firewall du VPS');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   → Timeout de connexion');
        console.log('   → Le firewall bloque probablement le port 3306');
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('   → Identifiants incorrects');
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('   → Base de données inexistante');
      }
    }
  }
  
  console.log('\n💡 Si aucune configuration ne fonctionne:');
  console.log('1. Connectez-vous en SSH: ssh root@31.170.165.41');
  console.log('2. Vérifiez que MySQL est démarré: systemctl status mysql');
  console.log('3. Configurez MySQL pour les connexions externes:');
  console.log('   - Éditez /etc/mysql/mysql.conf.d/mysqld.cnf');
  console.log('   - Changez bind-address = 127.0.0.1 vers bind-address = 0.0.0.0');
  console.log('   - Redémarrez MySQL: systemctl restart mysql');
  console.log('4. Autorisez le port 3306 dans le firewall:');
  console.log('   - ufw allow 3306');
  console.log('5. Créez un utilisateur pour les connexions externes:');
  console.log('   - GRANT ALL PRIVILEGES ON *.* TO \'u292729667_moha_bibi\'@\'%\' IDENTIFIED BY \'79I*$6Dd975zZZ\';');
}

testVPSConnection();
