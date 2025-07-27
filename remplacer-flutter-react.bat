@echo off
echo =========================================
echo   REMPLACEMENT FLUTTER PAR REACT
echo =========================================
echo.

cd /d "c:\Tiforama_v8"
echo Repertoire actuel: %CD%
echo.

echo 1. Verification Git...
if exist ".git" (
    echo Git deja initialise
) else (
    echo Initialisation Git...
    git init
)

echo.
echo 2. Configuration Git...
git config user.name "mohabibi"
git config user.email "mohabibi@users.noreply.github.com"

echo.
echo 3. Ajout de tous les fichiers...
git add .

echo.
echo 4. Creation du commit...
git commit -m "feat: Remplacement complet Flutter par React TypeScript - Application React moderne avec PWA, TypeScript, Material-UI et services integres"

echo.
echo 5. Configuration GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/mohabibi/Tiforama_v8.git

echo.
echo ============================================
echo   ATTENTION - REMPLACEMENT COMPLET !
echo ============================================
echo Cette action va EFFACER COMPLETEMENT 
echo l'ancienne version Flutter de GitHub
echo et la remplacer par votre version React.
echo.
echo Tapez "OUI" pour continuer ou appuyez sur
echo une autre touche pour annuler.
echo.
set /p confirm="Votre choix: "

if /i "%confirm%"=="OUI" (
    echo.
    echo 6. REMPLACEMENT EN COURS...
    echo Effacement de l'ancienne version Flutter...
    git push --force --set-upstream origin master
    
    if %errorlevel% equ 0 (
        echo.
        echo ========================================
        echo          SUCCES !
        echo ========================================
        echo L'application Flutter a ete completement
        echo effacee et remplacee par React !
        echo.
        echo Votre depot: https://github.com/mohabibi/Tiforama_v8
        echo.
        echo Creation du tag...
        git tag -a v1.0.0-react -m "Version React finale"
        git push origin v1.0.0-react
        echo Tag v1.0.0-react cree !
    ) else (
        echo.
        echo ERREUR lors du push vers GitHub
        echo Verifiez vos permissions d'acces
    )
) else (
    echo.
    echo Remplacement annule.
    echo Aucune modification sur GitHub.
)

echo.
echo Script termine.
pause
