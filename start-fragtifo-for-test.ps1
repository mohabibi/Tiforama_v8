#!/usr/bin/env powershell

# Script pour démarrer le serveur FragTifo et tester les nouvelles fonctionnalités
Write-Host "🚀 Démarrage du serveur FragTifo pour test des nouvelles fonctionnalités" -ForegroundColor Green
Write-Host ""

# Vérifier si node est installé
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Changer vers le répertoire du projet
Set-Location "c:\Tiforama_web - 01"

Write-Host "📍 Répertoire de travail: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Fonctionnalités à tester:" -ForegroundColor Yellow
Write-Host "  1. Sélection d'un groupe" -ForegroundColor White
Write-Host "  2. Sélection d'un tifo → affichage automatique du nombre de places" -ForegroundColor White
Write-Host "  3. Saisie du numéro de place → format 'numéro/total' avec validation" -ForegroundColor White
Write-Host "  4. Vérification stricte: numéro < total (ex: 1259/1260 OK, 1260/1260 NOK)" -ForegroundColor White
Write-Host "  5. Bouton 'Valider' actif dès le premier chiffre valide" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs de test:" -ForegroundColor Magenta
Write-Host "  React App: http://localhost:3000" -ForegroundColor White
Write-Host "  FragTifo API: http://localhost:3030" -ForegroundColor White
Write-Host ""

Write-Host "🔥 Démarrage du serveur FragTifo..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

# Démarrer le serveur
node fragtifo-dev-server.js
