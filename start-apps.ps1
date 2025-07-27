# Script PowerShell pour démarrer Tiforama React + FragTifo API
Write-Host "========================================" -ForegroundColor Green
Write-Host "     TIFORAMA - Démarrage complet" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Vérifier si les ports sont libres
Write-Host "🔍 Vérification des ports..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000"
$port3030 = netstat -ano | findstr ":3030"

if ($port3000) {
    Write-Host "⚠️  Port 3000 déjà utilisé (React)" -ForegroundColor Orange
}
if ($port3030) {
    Write-Host "⚠️  Port 3030 déjà utilisé (FragTifo API)" -ForegroundColor Orange
}

# Démarrer le serveur FragTifo API
Write-Host "� Démarrage du serveur FragTifo API (port 3030)..." -ForegroundColor Cyan
$apiProcess = Start-Process -FilePath "node" -ArgumentList "fragtifo-dev-server.js" -WindowStyle Normal -PassThru
Start-Sleep -Seconds 3

# Démarrer React
Write-Host "⚛️  Démarrage de React App (port 3000)..." -ForegroundColor Cyan
$env:PORT = "3000"
$reactProcess = Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Applications démarrées !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "📱 React App    : http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 FragTifo API : http://localhost:3030" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PIDs des processus:"
Write-Host "   FragTifo API: $($apiProcess.Id)" -ForegroundColor Gray
Write-Host "   React App: $($reactProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Adaptation complète de Flutter vers React avec API FragTifo réussie !" -ForegroundColor Green
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
