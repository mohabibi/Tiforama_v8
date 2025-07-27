# 🔧 GUIDE DE REDÉMARRAGE COMPLET

## 🚨 Problème : Rien ne s'affiche sur localhost:3000

### 🔄 Solution : Redémarrage complet des serveurs

#### Étape 1: Arrêter tous les processus Node.js
```cmd
taskkill /F /IM node.exe
```

#### Étape 2: Attendre 5 secondes
Laissez le temps aux processus de se fermer complètement.

#### Étape 3: Redémarrer dans l'ordre correct

**Option A - Script automatique :**
Double-cliquez sur : `start-apps.bat`

**Option B - Manuel :**
```cmd
# Terminal 1 : API FragTifo
cd "c:\Tiforama_web - 01"
node fragtifo-dev-server.js

# Terminal 2 : React App  
cd "c:\Tiforama_web - 01"
npm start
```

**Option C - PowerShell :**
```powershell
# Terminal 1 : API FragTifo
Set-Location "c:\Tiforama_web - 01"
node fragtifo-dev-server.js

# Terminal 2 : React App
Set-Location "c:\Tiforama_web - 01"
npm start
```

### ✅ Vérifications après redémarrage

1. **API FragTifo (port 3030)** :
   - URL : http://localhost:3030
   - Message attendu : "Bienvenue sur l'API FragTifo de développement !"

2. **React App (port 3000)** :
   - URL : http://localhost:3000  
   - Interface attendue : Formulaire avec Groupe, Tifo, Place

### 🧪 Test complet de fonctionnement

1. Ouvrir http://localhost:3000
2. Vérifier que l'interface s'affiche (thème sombre)
3. Cliquer sur le champ "Groupe" 
4. Vérifier que des groupes se chargent
5. Test avec : Groupe "Supporters Nord" → Tifo "Tifo Victoire" → Place "1"

### 🔧 Si le problème persiste

#### Vérification des ports :
```cmd
netstat -ano | findstr ":3000"
netstat -ano | findstr ":3030" 
```

#### Nettoyage complet :
```cmd
# Arrêter tous les processus
taskkill /F /IM node.exe

# Nettoyer le cache npm
npm cache clean --force

# Redémarrer
npm start
```

### 📋 Checklist de dépannage

- [ ] Node.js installé (`node --version`)
- [ ] Ports 3000 et 3030 libres
- [ ] Firewall/antivirus non bloquant
- [ ] VS Code redémarré si nécessaire

### 🎯 Résultat attendu

Après redémarrage complet :
- ✅ http://localhost:3030 → Message API FragTifo
- ✅ http://localhost:3000 → Interface React Tiforama
- ✅ Communication entre les deux serveurs fonctionnelle

---

**Si tout fonctionne, l'adaptation Flutter → React est complète ! 🚀**
