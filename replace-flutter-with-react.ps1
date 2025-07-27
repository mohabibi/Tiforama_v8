# Script pour remplacer complètement Flutter par React dans le dépôt GitHub
Write-Host "🗑️ REMPLACEMENT COMPLET FLUTTER → REACT" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Étape 1: Vérifier l'état actuel
Write-Host "1️⃣ Vérification de l'état actuel..." -ForegroundColor Yellow
Set-Location "c:\Tiforama_v8"
Write-Host "Répertoire actuel: $(Get-Location)" -ForegroundColor Cyan

# Vérifier si Git est initialisé
if (Test-Path ".git") {
    Write-Host "✅ Dépôt Git détecté" -ForegroundColor Green
    git status
} else {
    Write-Host "❌ Pas de dépôt Git - Initialisation..." -ForegroundColor Red
    git init
    Write-Host "✅ Dépôt Git initialisé" -ForegroundColor Green
}

Write-Host ""

# Étape 2: Configurer Git si nécessaire
Write-Host "2️⃣ Configuration Git..." -ForegroundColor Yellow
try {
    $userName = git config user.name
    $userEmail = git config user.email
    
    if ([string]::IsNullOrEmpty($userName) -or [string]::IsNullOrEmpty($userEmail)) {
        Write-Host "⚙️ Configuration Git requise" -ForegroundColor Orange
        Write-Host "Nom d'utilisateur actuel: $userName" -ForegroundColor Gray
        Write-Host "Email actuel: $userEmail" -ForegroundColor Gray
        
        # Vous pouvez modifier ces valeurs
        git config user.name "mohabibi"
        git config user.email "mohabibi@users.noreply.github.com"
        Write-Host "✅ Configuration Git mise à jour" -ForegroundColor Green
    } else {
        Write-Host "✅ Git déjà configuré: $userName <$userEmail>" -ForegroundColor Green
    }
} catch {
    Write-Host "⚙️ Configuration Git par défaut..." -ForegroundColor Orange
    git config user.name "mohabibi"
    git config user.email "mohabibi@users.noreply.github.com"
}

Write-Host ""

# Étape 3: Ajouter tous les fichiers React
Write-Host "3️⃣ Ajout des fichiers React au dépôt..." -ForegroundColor Yellow
git add .
$addStatus = $LASTEXITCODE
if ($addStatus -eq 0) {
    Write-Host "✅ Tous les fichiers React ajoutés" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'ajout des fichiers" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 4: Commit de remplacement
Write-Host "4️⃣ Création du commit de remplacement..." -ForegroundColor Yellow
$commitMessage = @"
feat: Remplacement complet Flutter par React TypeScript

🗑️ SUPPRESSION COMPLÈTE de l'application Flutter
✅ REMPLACEMENT par l'application React TypeScript moderne

Nouvelles fonctionnalités:
- ⚛️ React 18 + TypeScript
- 🎨 Interface Material-UI moderne  
- 🔊 Service audio avec sons synthétiques
- 🕒 Synchronisation temporelle précise
- 📱 Application PWA complète
- 💾 Stockage local pour mode hors ligne
- 🎯 API FragTifo intégrée
- 🧩 Composants modulaires complets

Migration terminée le 27 juillet 2025
"@

git commit -m $commitMessage
$commitStatus = $LASTEXITCODE
if ($commitStatus -eq 0) {
    Write-Host "✅ Commit créé avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du commit" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Étape 5: Connexion au dépôt GitHub
Write-Host "5️⃣ Connexion au dépôt GitHub..." -ForegroundColor Yellow
try {
    # Vérifier si l'origine existe déjà
    $remoteOrigin = git remote get-url origin 2>$null
    if ($remoteOrigin) {
        Write-Host "✅ Origine déjà configurée: $remoteOrigin" -ForegroundColor Green
    } else {
        git remote add origin https://github.com/mohabibi/Tiforama_v8.git
        Write-Host "✅ Origine GitHub ajoutée" -ForegroundColor Green
    }
} catch {
    Write-Host "⚙️ Configuration de l'origine GitHub..." -ForegroundColor Orange
    git remote add origin https://github.com/mohabibi/Tiforama_v8.git
}

Write-Host ""

# Étape 6: Push forcé pour remplacer complètement
Write-Host "6️⃣ REMPLACEMENT COMPLET sur GitHub..." -ForegroundColor Red
Write-Host "⚠️ ATTENTION: Cette action va EFFACER COMPLÈTEMENT l'ancienne version Flutter!" -ForegroundColor Red
Write-Host "⚠️ Tout l'historique Flutter sera PERDU définitivement!" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Tapez 'OUI REMPLACER' pour confirmer le remplacement complet"
if ($confirmation -eq "OUI REMPLACER") {
    Write-Host "🚀 Remplacement en cours..." -ForegroundColor Red
    
    # Push forcé pour écraser complètement l'historique
    git push --force --set-upstream origin master
    $pushStatus = $LASTEXITCODE
    
    if ($pushStatus -eq 0) {
        Write-Host ""
        Write-Host "✅ REMPLACEMENT RÉUSSI!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "🎉 L'application Flutter a été complètement effacée" -ForegroundColor Green
        Write-Host "🎉 L'application React est maintenant en ligne sur GitHub" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔗 Votre dépôt: https://github.com/mohabibi/Tiforama_v8" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Ce qui a changé:" -ForegroundColor Yellow
        Write-Host "  - ❌ Tous les fichiers Flutter (.dart, pubspec.yaml) supprimés" -ForegroundColor Red
        Write-Host "  - ✅ Tous les fichiers React (.tsx, package.json) ajoutés" -ForegroundColor Green
        Write-Host "  - ✅ Structure src/ avec composants TypeScript" -ForegroundColor Green
        Write-Host "  - ✅ Services audio et temps intégrés" -ForegroundColor Green
        Write-Host "  - ✅ Configuration PWA complète" -ForegroundColor Green
        
        # Créer un tag pour marquer cette version
        Write-Host ""
        Write-Host "🏷️ Création d'un tag pour cette version..." -ForegroundColor Yellow
        git tag -a v1.0.0-react -m "Version React finale - Flutter complètement remplacé"
        git push origin v1.0.0-react
        Write-Host "✅ Tag v1.0.0-react créé" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Erreur lors du push - vérifiez vos permissions GitHub" -ForegroundColor Red
        Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
        Write-Host "  1. Vérifiez que vous êtes connecté à GitHub" -ForegroundColor Gray
        Write-Host "  2. Utilisez un token d'accès personnel si nécessaire" -ForegroundColor Gray
        Write-Host "  3. Vérifiez l'URL du dépôt" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Remplacement annulé par l'utilisateur" -ForegroundColor Yellow
    Write-Host "💡 Aucune modification n'a été apportée à GitHub" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Script terminé." -ForegroundColor Gray
