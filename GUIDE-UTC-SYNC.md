# 🕐 Guide Test Synchronisation UTC - Tiforama

## ✅ Système Implémenté

### 📍 **Affichage Heure UTC**
- **Heure UTC** : Toujours affichée en **BLANC** au format `HH:mm:ss:SSS`
- **Source** : Serveur de temps fiable (worldtimeapi.org)
- **Fréquence** : Mise à jour 10x/seconde pour millisecondes fluides

### 🎯 **Affichage Offset selon États**

#### 🟢 **Vert** - UTC Inférieur (offset positif)
```
UTC: 14:26:12:543
+125ms
```

#### 🔴 **Rouge** - UTC Supérieur (offset négatif) 
```
UTC: 14:26:12:543
-89ms
```

#### ⚪ **Blanc** - Offset Nul
```
UTC: 14:26:12:543
0
```

#### 🟠 **Orange** - Hors Connexion (utilise offset sauvé)
```
UTC: 14:26:12:543
Offset hors ligne: +125ms
```

#### 🟠 **Orange** - Synchronisation en cours
```
UTC: 14:26:12:543
Synchronisation...
```

## 🔧 **Fonctionnalités**

### 📱 **Sauvegarde Locale**
- ✅ Offset sauvé dans localStorage
- ✅ Valide 24h maximum
- ✅ Utilisé automatiquement hors connexion

### 🔄 **Synchronisation Auto**
- ✅ Au démarrage de l'app
- ✅ Toutes les 15 minutes 
- ✅ Force sync avec bouton refresh rouge

### 🎛️ **Bouton Refresh Rouge (bas gauche)**
- ✅ Réinitialise formulaire
- ✅ Force nouvelle synchronisation UTC
- ✅ Met à jour horloge immédiatement

## 🧪 **Comment Tester**

### 1. **Test Page HTML**
```bash
# Ouvrir dans navigateur
file://c:/Tiforama_web - 01/test-utc-sync.html
```

### 2. **Test React App**
```bash
# S'assurer que React app tourne
http://localhost:3000
```

### 3. **Scénarios de Test**

#### ✅ **Test Connexion Normale**
1. Ouvrir l'app → Heure UTC en blanc
2. Observer offset en vert/rouge/blanc selon décalage
3. Clic bouton refresh → Nouvelle synchronisation

#### ✅ **Test Hors Connexion**
1. Déconnecter internet
2. Recharger page → Offset orange "hors ligne"
3. Reconnecter → Retour sync normale

#### ✅ **Test Persistence**
1. Utiliser app avec internet
2. Fermer navigateur 
3. Rouvrir sans internet → Offset sauvé utilisé

## 📊 **Correspondance Flutter**

| Flutter | React | Status |
|---------|-------|--------|
| TimeManager().initialize() | TimeService.getInstance().initialize() | ✅ |
| SharedPreferences offset | localStorage offset | ✅ |
| UTC sync server | worldtimeapi.org | ✅ |
| startSecondSync() | startSecondSync() | ✅ |
| Affichage h:mn:s:ms | HH:mm:ss:SSS | ✅ |
| Couleurs offset | Vert/Rouge/Orange/Blanc | ✅ |

## 🚀 **Statut Final**

✅ **Système Complet** - Synchronisation UTC implémentée exactement selon vos spécifications :

- Heure UTC en blanc avec millisecondes
- Offset coloré selon état (vert/rouge/orange/blanc)
- Sauvegarde locale pour usage hors connexion
- Bouton refresh force resynchronisation
- Compatible avec votre logique Flutter existante

**Prêt pour utilisation en production !** 🎯
