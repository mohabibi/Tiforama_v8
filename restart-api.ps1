# Script PowerShell pour redémarrer l'API
Write-Host "Redémarrage du serveur API..." -ForegroundColor Yellow
Write-Host "Arrêt des processus Node.js existants..." -ForegroundColor Cyan

# Arrêter tous les processus node.exe
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Démarrage du serveur API sur le port 3020..." -ForegroundColor Green
node server.js
