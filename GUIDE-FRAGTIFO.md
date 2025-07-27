# Guide de Démarrage - Tiforama avec API FragTifo

## Configuration réalisée

✅ **Application React adaptée** pour utiliser l'API FragTifo  
✅ **Service API** configuré pour le port 3030  
✅ **Composant TifoFormFragTifo** créé avec la même logique que Flutter  
✅ **Serveur de développement** FragTifo inclus pour les tests  

## Architecture

### API FragTifo (Port 3030)
- **GET /groups** - Récupère tous les groupes
- **GET /tifos/:groupId** - Récupère les tifos d'un groupe  
- **GET /places/last/:tifoId** - Récupère la dernière place d'un tifo
- **POST /validate** - Valide les données (groupName, tifoName, placeNumber)
- **GET /data** - Récupère les données complètes (groupe, tifo, place)

### Application React (Port 3000)
- **Formulaire adapté** : Groupe → Tifo → Place (comme Flutter)
- **Validation automatique** via l'API
- **Récupération des données** pour l'animation
- **Sauvegarde en mémoire** (localStorage)
- **Interface identique** à l'application Flutter

## Démarrage

### 1. Serveur FragTifo de développement
```bash
# Option 1: Script Windows
double-clic sur start-fragtifo-dev.bat

# Option 2: Script PowerShell  
./start-fragtifo-dev.ps1

# Option 3: Manuel
node fragtifo-dev-server.js
```

### 2. Application React (déjà démarrée)
L'application React est déjà en cours d'exécution sur http://localhost:3000

## Utilisation

### Étapes (identiques à Flutter)

1. **Sélectionner un Groupe**
   - Liste déroulante avec tous les groupes disponibles
   - Chargement automatique depuis l'API FragTifo

2. **Sélectionner un Tifo**  
   - Liste mise à jour automatiquement selon le groupe choisi
   - Récupération de la dernière place utilisée

3. **Saisir le Numéro de Place**
   - Champ numérique avec suggestion (dernière place + 1)
   - Validation automatique de la plage valide

4. **Valider**
   - Validation des données via l'API
   - Récupération des données complètes (couleurs, icônes, durées, palette, MP3)
   - Sauvegarde automatique en mémoire

5. **Mémoire (10 slots)**
   - Cercles numérotés de 1 à 10
   - Clic pour charger une donnée sauvegardée
   - Sauvegarde automatique à chaque validation

### Données de test disponibles

Le serveur de développement inclut des données de test :

**Groupes :**
- Supporters Nord (ID: 1)
- Ultras Sud (ID: 2) 
- Tribune Est (ID: 3)

**Tifos d'exemple :**
- Supporters Nord : "Tifo Victoire", "Chorégraphie Flammes"
- Ultras Sud : "Mosaïque Géante", "Animation Lumière"
- Tribune Est : "Banderoles Unies"

**Test complet :**
```
Groupe: Supporters Nord
Tifo: Tifo Victoire  
Place: 1
→ Récupère les données d'animation complètes
```

## Logs et Debugging

### Console Navigateur
- 📡 Requêtes API avec détails
- ✅ Succès de chargement
- ❌ Erreurs de connexion
- 💾 Sauvegardes en mémoire

### Console Serveur FragTifo
- 📡 Requêtes reçues avec paramètres
- 🚀 Statut du serveur
- 📋 Routes disponibles

## Connexion avec votre VPS

Pour connecter à votre vraie API FragTifo sur le VPS :

1. **Modifier ApiService.ts**
```typescript
this.baseUrl = 'http://31.170.165.41:3030';
```

2. **Variables d'environnement sur le VPS**
```
PORT=3030
DB_HOST=localhost  
DB_USER=u292729667_moha_bibi
DB_PASSWORD=79I*$6Dd975zZZ
DB_NAME=fragDb
DB_PORT=3306
```

3. **Vérifier CORS sur le VPS**
L'API doit autoriser les requêtes depuis http://localhost:3000

## Fidélité à Flutter

✅ **Structure identique** : Même logique de navigation  
✅ **API calls identiques** : Mêmes endpoints et paramètres  
✅ **Gestion d'état similaire** : Groupes → Tifos → Données  
✅ **Validation identique** : Même processus de vérification  
✅ **Mémoire identique** : 10 slots de sauvegarde  
✅ **Interface similaire** : Même apparence et comportement  

## Fichiers principaux

- `src/components/TifoFormFragTifo.tsx` - Composant principal (remplace TifoFormFlutter)
- `src/services/ApiService.ts` - Service API adapté pour FragTifo
- `fragtifo-dev-server.js` - Serveur de développement local
- `package.json` - Proxy configuré pour le port 3030

L'application React est maintenant parfaitement adaptée à votre API FragTifo avec une fidélité totale à votre application Flutter ! 🎉
