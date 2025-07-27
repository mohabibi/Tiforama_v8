#!/bin/bash
echo "🚀 Démarrage du serveur Tiforama avec diagnostic"
echo "================================================"

# Vérifier Node.js
echo "📋 Vérification de l'environnement..."
node --version
npm --version

# Vérifier les dépendances
echo ""
echo "📦 Vérification des dépendances..."
if npm list mysql2 &> /dev/null; then
    echo "✅ mysql2 installé"
else
    echo "❌ mysql2 manquant - Installation..."
    npm install mysql2
fi

if npm list express &> /dev/null; then
    echo "✅ express installé"
else
    echo "❌ express manquant - Installation..."
    npm install express
fi

if npm list cors &> /dev/null; then
    echo "✅ cors installé"
else
    echo "❌ cors manquant - Installation..."
    npm install cors
fi

echo ""
echo "🔧 Configuration détectée dans .env:"
if [ -f .env ]; then
    grep "^DB_" .env | sed 's/DB_PASSWORD=.*/DB_PASSWORD=***/'
else
    echo "⚠️ Fichier .env non trouvé"
fi

echo ""
echo "🌟 Démarrage du serveur sur le port 3020..."
echo "   - API accessible sur: http://localhost:3020"
echo "   - Test groupes: http://localhost:3020/api/groups"
echo ""

# Démarrer le serveur
node server.js
