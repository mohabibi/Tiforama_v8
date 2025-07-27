const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnosticServeur() {
  console.log('🔍 DIAGNOSTIC COMPLET DU SERVEUR API TIFORAMA');
  console.log('=' * 50);
  
  // 1. Vérification des variables d'environnement
  console.log('\n📋 1. VARIABLES D\'ENVIRONNEMENT:');
  console.log(`DB_HOST: ${process.env.DB_HOST || 'NON DÉFINI'}`);
  console.log(`DB_USER: ${process.env.DB_USER || 'NON DÉFINI'}`);
  console.log(`DB_NAME: ${process.env.DB_NAME || 'NON DÉFINI'}`);
  console.log(`DB_PORT: ${process.env.DB_PORT || 'NON DÉFINI'}`);
  console.log(`PASSWORD défini: ${process.env.DB_PASSWORD ? 'OUI' : 'NON'}`);
  
  // 2. Test de connexion MySQL
  console.log('\n🔌 2. TEST DE CONNEXION MYSQL:');
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fragDb',
    port: process.env.DB_PORT || 3306,
    connectTimeout: 10000,
  };
  
  console.log(`Tentative de connexion à: ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL réussie !');
    
    // Test des tables
    try {
      const [tables] = await connection.execute(`SHOW TABLES FROM ${dbConfig.database}`);
      console.log(`📊 Tables trouvées dans ${dbConfig.database}:`);
      tables.forEach(table => {
        console.log(`   - ${Object.values(table)[0]}`);
      });
      
      // Test spécifique de la table groups
      try {
        const [groups] = await connection.execute(`SELECT COUNT(*) as count FROM groups`);
        console.log(`👥 Nombre de groupes: ${groups[0].count}`);
        
        const [groupList] = await connection.execute(`SELECT id, name FROM groups LIMIT 5`);
        console.log('📋 Premiers groupes:');
        groupList.forEach(group => {
          console.log(`   #${group.id} - ${group.name}`);
        });
        
      } catch (error) {
        console.log('❌ Erreur lors de la lecture de la table groups:', error.message);
      }
      
    } catch (error) {
      console.log('❌ Erreur lors de l\'exploration des tables:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.log('❌ Erreur de connexion MySQL:', error.message);
    console.log('Code d\'erreur:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Le serveur MySQL refuse la connexion');
      console.log('   → Vérifiez que MySQL est démarré');
      console.log('   → Vérifiez les paramètres de firewall');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('💡 Timeout de connexion');
      console.log('   → Le serveur MySQL n\'est pas accessible');
      console.log('   → Vérifiez l\'IP et le port');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Accès refusé');
      console.log('   → Vérifiez les identifiants MySQL');
    }
  }
  
  // 3. Test des dépendances Node.js
  console.log('\n📦 3. DÉPENDANCES NODE.JS:');
  try {
    const express = require('express');
    console.log('✅ Express disponible');
  } catch (error) {
    console.log('❌ Express manquant - npm install express');
  }
  
  try {
    const cors = require('cors');
    console.log('✅ CORS disponible');
  } catch (error) {
    console.log('❌ CORS manquant - npm install cors');
  }
  
  try {
    require('dotenv');
    console.log('✅ dotenv disponible');
  } catch (error) {
    console.log('❌ dotenv manquant - npm install dotenv');
  }
  
  // 4. Recommandations
  console.log('\n💡 4. RECOMMANDATIONS:');
  
  if (!process.env.DB_HOST) {
    console.log('⚠️ Créez un fichier .env avec vos paramètres de base de données');
  }
  
  console.log('🚀 Pour résoudre l\'erreur 500:');
  console.log('   1. Vérifiez que MySQL est accessible depuis votre machine');
  console.log('   2. Configurez MySQL pour accepter les connexions externes');
  console.log('   3. Vérifiez les paramètres firewall du VPS');
  console.log('   4. Testez la connexion avec: node test-hostinger.js');
  
  console.log('\n✅ Diagnostic terminé!');
}

diagnosticServeur().catch(console.error);
