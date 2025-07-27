# 🧪 Test d'Affichage du Nombre de Places

## 🎯 Objectif
Vérifier que le nombre de places s'affiche correctement lorsqu'un tifo est sélectionné, avec la numérotation 0-based.

## 📋 Étapes de Test

### 1. **Démarrer l'Application React** ✅
```bash
npm start
```
L'app React est accessible sur http://localhost:3000

### 2. **Ouvrir la Console du Navigateur**
- F12 → Console
- Vérifier les messages de debug commençant par 📡, 🔍, 📊

### 3. **Tester l'Affichage des Places**

#### Scénario A : Avec API FragTifo (Idéal)
1. **Démarrer l'API** :
   ```bash
   node fragtifo-dev-server.js
   ```
2. **Sélectionner un groupe** : "Supporters Nord"
3. **Sélectionner un tifo** : "Tifo Victoire"
4. **Vérifier l'affichage** : "Nombre de places : 150"

#### Scénario B : Sans API (Données de Test)
1. **S'assurer que l'API n'est pas démarrée**
2. **Sélectionner un groupe** : "Supporters Nord"
3. **Sélectionner un tifo** : "Tifo Victoire"
4. **Vérifier l'affichage** : "Nombre de places : 150 (données de test)"

## 🔍 Messages Console Attendus

### Avec API Accessible
```
📡 Récupération des informations du tifo Tifo Victoire...
🔍 Paramètres: groupe="Supporters Nord", tifo="Tifo Victoire"
📊 Réponse getTifoInfo: {nombre_places: 150}
✅ Nombre de places récupéré: 150
🔢 TotalPlaces mis à jour: 150
```

### Sans API (Fallback)
```
📡 Récupération des informations du tifo Tifo Victoire...
🔍 Paramètres: groupe="Supporters Nord", tifo="Tifo Victoire"
❌ Erreur lors de la récupération des informations du tifo: Error: Failed to fetch
🧪 Fallback: utilisation de 150 places pour les tests
🔢 TotalPlaces mis à jour: 150
```

## ✅ Validation Visuelle

### Interface Utilisateur
1. **Sélection du groupe** : Liste déroulante fonctionnelle
2. **Sélection du tifo** : Liste déroulante avec tifos du groupe
3. **Affichage des places** : 
   - Text blanc : "Nombre de places : XXX"
   - Si données de test : texte orange "(données de test)"

### Validation des Places (0-based)
1. **Champ place activé** après sélection du tifo
2. **Placeholder dynamique** : "Places disponibles: 0 à 149" (pour 150 places)
3. **Validation en temps réel** :
   - Place 0 : ✅ Valide (première place)
   - Place 149 : ✅ Valide (dernière place)
   - Place 150 : ❌ Erreur (dépasse le total)
   - Place -1 : ❌ Erreur (négatif)

## 🐛 Problèmes Possibles

### Problème 1 : Aucun affichage du nombre de places
- **Cause** : `totalPlaces` reste à 0
- **Debug** : Vérifier les messages console 📊
- **Solution** : Vérifier que `fetchTifoInfo` est appelée

### Problème 2 : API non accessible
- **Symptôme** : "(données de test)" affiché
- **Cause** : Serveur FragTifo non démarré
- **Solution** : `node fragtifo-dev-server.js`

### Problème 3 : Pas de tifos dans la liste
- **Cause** : Groupe sans tifos ou API inaccessible
- **Debug** : Messages 📡 pour `getTifosByGroup`
- **Solution** : Vérifier données de démonstration

## 📱 Données de Test (Sans API)

| Tifo | Places Attendues |
|------|------------------|
| Tifo Victoire | 150 |
| Chorégraphie Flammes | 200 |
| Mosaïque Géante | 300 |
| Animation Lumière | 180 |
| Banderoles Unies | 100 |
| Autres | 50-250 (aléatoire) |

## 🚀 Test Complet

### Étapes Rapides
1. **Ouvrir React** : http://localhost:3000
2. **Ouvrir Console** : F12
3. **Sélectionner** : Supporters Nord → Tifo Victoire
4. **Vérifier** : Affichage "Nombre de places : 150"
5. **Tester validation** : Saisir 0, 149, 150
6. **Valider comportement** : Bouton activé/désactivé

### Résultat Attendu
- ✅ Places affichées automatiquement
- ✅ Validation 0-based (0 à totalPlaces-1)
- ✅ Interface réactive et intuitive
- ✅ Gestion d'erreur avec fallback de test
