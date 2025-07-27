@echo off
echo ========================================
echo     TIFORAMA - Demarrage complet
echo ========================================
echo.

echo 1. Demarrage du serveur FragTifo API sur le port 3030...
start "FragTifo API" cmd /k "node fragtifo-dev-server.js"

echo 2. Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo 3. Demarrage de React sur le port 3000...
set PORT=3000
npm start

echo.
echo ========================================
echo   Applications demarrees !
echo ========================================
echo - React App    : http://localhost:3000
echo - FragTifo API : http://localhost:3030
echo.
pause
