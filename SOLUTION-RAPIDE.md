# 🚨 SOLUTION RAPIDE - Démarrage des serveurs

## Problème actuel
- ✅ **React App** fonctionne sur http://localhost:3000
- ❌ **API FragTifo** n'est pas démarrée sur le port 3030
- 🔌 L'application React ne peut pas communiquer avec l'API

## 🚀 Solution immédiate

### Étape 1: Démarrer le serveur FragTifo API

**Option A - Double-clic sur le fichier :**
```
📁 Naviguez vers : c:\Tiforama_web - 01\
📄 Double-cliquez sur : start-fragtifo-dev.bat
```

**Option B - PowerShell :**
```powershell
cd "c:\Tiforama_web - 01"
node fragtifo-dev-server.js
```

**Option C - Invite de commandes :**
```cmd
cd "c:\Tiforama_web - 01"
node fragtifo-dev-server.js
```

### Étape 2: Vérifier que l'API fonctionne

Ouvrez dans votre navigateur : http://localhost:3030

Vous devriez voir : **"Bienvenue sur l'API FragTifo de développement !"**

### Étape 3: Tester l'application complète

1. **React App** : http://localhost:3000
2. **API FragTifo** : http://localhost:3030

L'application devrait maintenant fonctionner complètement !

## 🧪 Test rapide de l'API

Une fois l'API démarrée, testez ces URLs :

- **Groupes** : http://localhost:3030/groups
- **Tifos du groupe 1** : http://localhost:3030/tifos/1
- **Validation** : Utilisez l'interface React

## 📱 Test complet dans React

1. Sélectionnez "Supporters Nord" 
2. Sélectionnez "Tifo Victoire"
3. Entrez place "1"
4. Cliquez "Valider"

➡️ Les données d'animation devraient se charger !

## 🔧 Si le problème persiste

1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez les ports libres : `netstat -ano | findstr ":3030"`
3. Redémarrez votre éditeur de code
4. Essayez le script `start-apps.bat` pour tout démarrer

---

**L'application est prête, il suffit de démarrer le serveur FragTifo !** 🎯
