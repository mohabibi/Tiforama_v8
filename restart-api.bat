@echo off
echo Redemarrage du serveur API...

REM Tuer tous les processus Node.js sur le port 3020
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3020') do (
    taskkill /f /pid %%a 2>nul
)

REM Attendre un peu
timeout /t 2 /nobreak >nul

REM Redemarrer le serveur API
echo Demarrage du serveur API sur le port 3020...
start "API Server" cmd /k "cd /d %~dp0 && node server.js"

echo Serveur API redémarre...
echo Attendez quelques secondes puis testez votre application.
pause
