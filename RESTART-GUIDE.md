# Guide de Redémarrage - Tiforama

## Problème Actuel
- ❌ Serveur API ne répond pas sur le port 3020
- ✅ React fonctionne mais ne peut pas se connecter à l'API
- ⚠️ Configuration proxy : `"proxy": "http://localhost:3020"`

## Solution étape par étape :

### 1. Redémarrer le serveur API
Ouvrez un terminal PowerShell et exécutez :
```powershell
cd c:\Tiforama_web
node server.js
```

Vous devriez voir :
```
🚀 Serveur API démarré sur le port 3020
💾 Base de données: fragDb
🌐 API accessible sur: http://localhost:3020
```

### 2. Tester l'API
Dans un autre terminal :
```powershell
curl http://localhost:3020/api/groups
```

### 3. Vérifier React
React devrait maintenant pouvoir se connecter via le proxy.
L'erreur "Failed to fetch" devrait disparaître.

### 4. En cas de problème de port
Si le port 3020 est occupé :
```powershell
netstat -ano | findstr :3020
taskkill /PID [PID_NUMBER] /F
```

## Status des Services
- API Server: Port 3020 (À redémarrer)
- React App: Port auto-assigné (Fonctionnel)
- Proxy: Configuré vers localhost:3020

## Next Steps
1. Démarrez le serveur API avec `node server.js`
2. Testez votre application React
3. Vérifiez que les données s'affichent correctement
