# Tiforama Web Application

Application web React/TypeScript pour la gestion et l'affichage de tifos.

## Description

Tiforama est une application web qui permet de :
- Configurer des tifos avec des couleurs, icônes et durées
- Gérer les places et groupes
- Afficher des animations synchronisées
- Sauvegarder en mémoire locale

## Technologies utilisées

- **React 18** avec TypeScript
- **Material-UI (MUI)** pour l'interface
- **Redux Toolkit** pour la gestion d'état
- **Styled Components** pour le styling
- **Service Workers** pour le mode hors ligne

## Installation

```bash
npm install
```

## Développement

```bash
npm start
```

L'application sera accessible sur http://localhost:3000

## Build de production

```bash
npm run build
```

## Structure du projet

```
src/
├── components/          # Composants React
├── hooks/              # Hooks personnalisés
├── services/           # Services API et audio
├── store/              # Redux store et slices
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## Fonctionnalités principales

- **TifoFormFragTifo** : Formulaire principal de configuration
- **AnimationDisplay** : Affichage des animations
- **PlaceInput** : Composant de saisie de numéro de place
- **ApiService** : Service de communication avec l'API
- **AudioService** : Gestion des sons et musiques

## Date de mise à jour

Dernière mise à jour : 27 juillet 2025
