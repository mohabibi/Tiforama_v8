@echo off
echo ===================================
echo      TIFORAMA - DEMARRAGE COMPLET
echo ===================================
echo.

cd /d "c:\Tiforama_web"

echo 1. Verification que Node.js est installe...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installe ou non accessible
    echo Veuillez installer Node.js depuis https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js detecte

echo.
echo 2. Verification que npm est installe...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas accessible
    pause
    exit /b 1
)
echo ✅ npm detecte

echo.
echo 3. Demarrage du serveur API sur le port 3020...
start "Serveur API Tiforama" cmd /k "echo ===== SERVEUR API (Port 3020) ===== && node server.js"

echo ✅ Serveur API demarre (nouvelle fenetre)
echo.

echo 4. Attente de 3 secondes pour le serveur API...
timeout /t 3 /nobreak >nul

echo.
echo 5. Demarrage de React sur le port 3000...
set PORT=3000
start "React Tiforama" cmd /k "echo ===== REACT APP (Port 3000) ===== && set PORT=3000 && npm start"

echo ✅ React demarre (nouvelle fenetre)
echo.

echo 6. Attente de 10 secondes pour React...
timeout /t 10 /nobreak >nul

echo.
echo 7. Ouverture du navigateur...
start http://localhost:3000

echo.
echo ===================================
echo       DEMARRAGE TERMINE !
echo ===================================
echo.
echo Deux fenetres se sont ouvertes :
echo - Serveur API (port 3020)
echo - React App (port 3000)
echo.
echo Et votre navigateur s'est ouvert sur :
echo http://localhost:3000
echo.
echo NE FERMEZ PAS ces fenetres !
echo.
pause
