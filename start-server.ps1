# Script PowerShell pour démarrer le serveur Tiforama
Write-Host "🚀 Démarrage du serveur Tiforama avec diagnostic" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Vérifier Node.js
Write-Host "`n📋 Vérification de l'environnement..." -ForegroundColor Yellow
Write-Host "Node.js version:" -NoNewline
node --version
Write-Host "NPM version:" -NoNewline
npm --version

# Vérifier les dépendances
Write-Host "`n📦 Vérification des dépendances..." -ForegroundColor Yellow

$dependencies = @("mysql2", "express", "cors", "dotenv", "body-parser")
foreach ($dep in $dependencies) {
    try {
        npm list $dep 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $dep installé" -ForegroundColor Green
        } else {
            Write-Host "❌ $dep manquant - Installation..." -ForegroundColor Red
            npm install $dep
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification de $dep" -ForegroundColor Red
    }
}

# Afficher la configuration
Write-Host "`n🔧 Configuration détectée dans .env:" -ForegroundColor Cyan
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -match "^DB_" } | ForEach-Object {
        if ($_ -match "DB_PASSWORD=") {
            Write-Host "DB_PASSWORD=***" -ForegroundColor Gray
        } else {
            Write-Host $_ -ForegroundColor Gray
        }
    }
} else {
    Write-Host "⚠️ Fichier .env non trouvé" -ForegroundColor Orange
}

# Vérifier les ports
Write-Host "`n🔍 Vérification des ports..." -ForegroundColor Yellow
$port3020 = netstat -ano | findstr ":3020"
if ($port3020) {
    Write-Host "⚠️ Port 3020 déjà utilisé:" -ForegroundColor Orange
    Write-Host $port3020 -ForegroundColor Gray
} else {
    Write-Host "✅ Port 3020 disponible" -ForegroundColor Green
}

Write-Host "`n🌟 Démarrage du serveur sur le port 3020..." -ForegroundColor Magenta
Write-Host "   - API accessible sur: http://localhost:3020" -ForegroundColor White
Write-Host "   - Test groupes: http://localhost:3020/api/groups" -ForegroundColor White
Write-Host "   - Test d'un tifo: http://localhost:3020/api/tifos/1" -ForegroundColor White
Write-Host ""

# Démarrer le serveur
node server.js
