# 🕐 Test Manuel - Comportement Offset au Démarrage

## 🧪 **Scénarios de Test**

### 📌 **Test 1: Premier Démarrage (En ligne)**
```bash
# 1. Vider le localStorage
localStorage.clear()

# 2. Recharger la page
F5

# Résultat attendu:
✅ Aucun offset sauvé trouvé
✅ Synchronisation avec serveur réussie
✅ Nouvel offset sauvé: +123ms (exemple)
✅ Heure UTC corrigée affichée
```

### 📌 **Test 2: Démarrage avec Offset Sauvé (En ligne)**
```bash
# 1. S'assurer qu'un offset existe
console.log(localStorage.getItem('time_manager_offset'))

# 2. Recharger la page
F5

# Résultat attendu:
✅ Offset chargé depuis mémoire: +123ms
✅ Mise à jour avec serveur: +126ms (nouveau)
✅ Offset mis à jour et sauvé
✅ Heure UTC ajustée affichée
```

### 📌 **Test 3: Démarrage Hors Connexion (Offset Sauvé)**
```bash
# 1. Déconnecter internet
# 2. Recharger la page
F5

# Résultat attendu:
✅ Offset chargé depuis mémoire: +123ms
❌ Synchronisation échouée - mode hors connexion
✅ Utilisation offset sauvé: +123ms
🟠 Affichage orange: "Offset hors ligne: +123ms"
✅ Heure locale CORRIGÉE par l'offset
```

### 📌 **Test 4: Démarrage Hors Connexion (Aucun Offset)**
```bash
# 1. Vider localStorage + déconnecter internet
localStorage.clear()

# 2. Recharger la page
F5

# Résultat attendu:
❌ Aucun offset sauvé
❌ Synchronisation échouée - hors connexion
❌ Mode heure locale brute
🔴 Affichage: "Hors connexion"
```

## 🎯 **Comportement de l'Offset**

### ➕ **Offset Positif (+123ms)**
```
Heure locale:     14:26:12.543
Offset:          +123ms
Heure UTC corrigée: 14:26:12.666
→ L'heure locale était EN RETARD de 123ms
```

### ➖ **Offset Négatif (-89ms)**
```
Heure locale:     14:26:12.543
Offset:          -89ms  
Heure UTC corrigée: 14:26:12.454
→ L'heure locale était EN AVANCE de 89ms
```

### 🔄 **Principe de Correction**
```javascript
// Formule appliquée
heureUTCCorrigée = Date.now() + offset

// Si offset = +123ms → ajoute 123ms à l'heure locale
// Si offset = -89ms  → retire 89ms de l'heure locale
```

## 🎨 **Codes Couleur Affichage**

| État | Couleur | Texte | Signification |
|------|---------|-------|---------------|
| Sync en cours | 🟠 Orange | "Synchronisation..." | Connexion serveur active |
| Offset positif | 🟢 Vert | "+123ms" | UTC était en retard |
| Offset négatif | 🔴 Rouge | "-89ms" | UTC était en avance |
| Offset nul | ⚪ Blanc | "0" | Parfaitement synchronisé |
| Hors connexion | 🟠 Orange | "Offset hors ligne: +123ms" | Utilise offset sauvé |

## 🔧 **Commandes Console de Test**

```javascript
// Voir l'offset actuel
console.log('Offset:', localStorage.getItem('time_manager_offset'))

// Voir la dernière sync
console.log('Dernière sync:', new Date(parseInt(localStorage.getItem('time_manager_last_sync'))))

// Forcer une nouvelle sync
TimeService.getInstance().syncTimeWithServer()

// Simuler un offset (pour test)
localStorage.setItem('time_manager_offset', '150')
localStorage.setItem('time_manager_last_sync', Date.now().toString())

// Nettoyer pour test hors connexion
localStorage.removeItem('time_manager_offset')
localStorage.removeItem('time_manager_last_sync')
```

## ✅ **Validation Finale**

L'application doit maintenant:
1. ✅ Charger l'offset au démarrage
2. ✅ Appliquer l'offset à l'heure locale
3. ✅ Tenter une mise à jour en ligne
4. ✅ Fallback sur offset sauvé si hors connexion  
5. ✅ Affichage couleur selon l'état
6. ✅ Bouton refresh force nouvelle sync
