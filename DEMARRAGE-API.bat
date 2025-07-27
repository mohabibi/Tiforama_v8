@echo off
title FragTifo API Server
color 0A
echo.
echo ========================================
echo     API FRAGTIFO - SERVEUR DE DEV
echo ========================================
echo.
echo Demarrage sur le port 3030...
echo URL: http://localhost:3030
echo.
echo CTRL+C pour arreter le serveur
echo ========================================
echo.

node fragtifo-dev-server.js

echo.
echo ========================================
echo     SERVEUR ARRETE
echo ========================================
pause
