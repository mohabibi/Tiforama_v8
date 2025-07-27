// Script de test pour vérifier la récupération du nombre de places
const http = require('http');

const testApiEndpoint = (path, description) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Test: ${description}`);
    console.log(`📡 GET http://localhost:3030${path}`);
    
    const req = http.get(`http://localhost:3030${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📄 Response:`, JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📄 Response (text):`, data);
          resolve(data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Erreur:`, error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

async function runTests() {
  console.log('🚀 Test de l\'API FragTifo pour la récupération des places\n');
  
  try {
    // Test 1: Vérifier que le serveur répond
    await testApiEndpoint('/groups', 'Récupération des groupes');
    
    // Test 2: Récupérer les tifos du groupe 1
    await testApiEndpoint('/tifos/1', 'Récupération des tifos du groupe 1');
    
    // Test 3: Tester la récupération des informations d'un tifo (avec place=0)
    await testApiEndpoint('/data?groupe=Supporters%20Nord&tifo=Tifo%20Victoire&place=0', 
                          'Récupération des informations du tifo "Tifo Victoire" (place 0)');
    
    // Test 4: Tester avec une autre place pour voir les différences
    await testApiEndpoint('/data?groupe=Supporters%20Nord&tifo=Tifo%20Victoire&place=149', 
                          'Récupération des informations du tifo "Tifo Victoire" (place 149)');
    
    console.log('\n✅ Tests terminés');
    
  } catch (error) {
    console.error('\n❌ Erreur lors des tests:', error.message);
    console.log('\n💡 Assurez-vous que le serveur FragTifo est démarré:');
    console.log('   node fragtifo-dev-server.js');
  }
}

runTests();
