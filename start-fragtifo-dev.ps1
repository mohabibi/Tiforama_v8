Write-Host "🚀 Démarrage du serveur FragTifo de développement..." -ForegroundColor Green
Write-Host "📍 Port: 3030" -ForegroundColor Cyan
Write-Host "🌐 URL: http://localhost:3030" -ForegroundColor Cyan
Write-Host ""

try {
    node fragtifo-dev-server.js
} catch {
    Write-Host "❌ Erreur lors du démarrage du serveur" -ForegroundColor Red
    Write-Host "Vérifiez que Node.js est installé" -ForegroundColor Yellow
}

Read-Host "Appuyez sur Entrée pour fermer"
