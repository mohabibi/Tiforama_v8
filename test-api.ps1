# Test de connectivité API
Write-Host "🔍 Test de connectivité vers l'API Tiforama..." -ForegroundColor Yellow
Write-Host ""

try {
    # Test du serveur principal
    Write-Host "📡 Test: http://localhost:3020" -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri "http://localhost:3020" -Method Get -TimeoutSec 5
    Write-Host "✅ Serveur principal accessible" -ForegroundColor Green
    Write-Host "Réponse: $response" -ForegroundColor White
} catch {
    Write-Host "❌ Serveur principal inaccessible" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

try {
    # Test de l'endpoint groups
    Write-Host "📡 Test: http://localhost:3020/api/groups" -ForegroundColor Cyan
    $groups = Invoke-RestMethod -Uri "http://localhost:3020/api/groups" -Method Get -TimeoutSec 5
    Write-Host "✅ Endpoint /api/groups accessible" -ForegroundColor Green
    Write-Host "Nombre de groupes: $($groups.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Endpoint /api/groups inaccessible" -ForegroundColor Red
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Processus Node.js actifs:"
Get-Process -Name "node" -ErrorAction SilentlyContinue | Format-Table Id, ProcessName, StartTime

Write-Host ""
Write-Host "🔍 Ports en écoute:"
netstat -ano | findstr ":3020"

Write-Host ""
Write-Host "Appuyez sur Entrée pour continuer..."
Read-Host
