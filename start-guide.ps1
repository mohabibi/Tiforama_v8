# GUIDE DE DÉMARRAGE MANUEL - TIFORAMA
# =====================================

Write-Host "🚀 GUIDE DE DÉMARRAGE TIFORAMA" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host ""

Write-Host "📋 ÉTAPES À SUIVRE MANUELLEMENT:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  OUVRIR TERMINAL 1 (API SERVER)" -ForegroundColor Green
Write-Host "   Exécutez ces commandes:" -ForegroundColor White
Write-Host "   cd c:\Tiforama_web" -ForegroundColor Gray
Write-Host "   node server.js" -ForegroundColor Gray
Write-Host ""

Write-Host "2️⃣  ATTENDRE LE MESSAGE DE CONFIRMATION" -ForegroundColor Green
Write-Host "   Vous devez voir:" -ForegroundColor White
Write-Host "   'API en cours d'exécution sur le port 3020'" -ForegroundColor Gray
Write-Host ""

Write-Host "3️⃣  OUVRIR TERMINAL 2 (REACT APP)" -ForegroundColor Green
Write-Host "   Exécutez ces commandes:" -ForegroundColor White
Write-Host "   cd c:\Tiforama_web" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""

Write-Host "4️⃣  VÉRIFIER LES SERVICES" -ForegroundColor Green
Write-Host "   - API: http://localhost:3020" -ForegroundColor White
Write-Host "   - React: Port affiché dans le terminal React" -ForegroundColor White
Write-Host ""

Write-Host "⚙️  CONFIGURATION ACTUELLE:" -ForegroundColor Cyan
Write-Host "   - ApiService modifié pour utiliser directement localhost:3020" -ForegroundColor White
Write-Host "   - CORS activé sur l'API" -ForegroundColor White
Write-Host "   - Proxy configuré dans package.json" -ForegroundColor White
Write-Host ""

Write-Host "🔧 EN CAS DE PROBLÈME:" -ForegroundColor Red
Write-Host "   - Vérifiez qu'aucun autre processus n'utilise le port 3020" -ForegroundColor White
Write-Host "   - Arrêtez tous les processus Node.js: Stop-Process -Name 'node' -Force" -ForegroundColor White
Write-Host "   - Redémarrez en suivant les étapes ci-dessus" -ForegroundColor White
Write-Host ""

Write-Host "✅ Une fois les deux services démarrés, testez votre application!" -ForegroundColor Green
