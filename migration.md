# Guide de migration de Tiforama v6 vers v7

## Fichiers à copier
1. Tout le contenu du dossier `lib/` (sauf main.dart que nous allons fusionner)
2. Le fichier `pubspec.yaml` (à fusionner avec la nouvelle version)
3. Tous les fichiers d'assets (images, sons, etc.) dans leur dossier respectif
4. Les configurations spécifiques (comme la configuration NDK)

## Étapes de migration

### 1. Migrer le fichier pubspec.yaml
Ajouter vos dépendances et assets au nouveau fichier pubspec.yaml. Ne pas remplacer complètement le fichier - conservez la structure du nouveau projet.

### 2. Migrer votre code Dart
Copier tout le code de lib/ vers le dossier lib/ du nouveau projet.
Pour main.dart, combiner votre code avec le nouveau fichier main.dart.

### 3. Migrer les assets
Copier les dossiers d'assets vers le nouveau projet.

### 4. Configurer le NDK dans le nouveau projet
Ajouter cette ligne à android/app/build.gradle:
```gradle
android {
    // ...existing code...
    ndkVersion "29.0.13113456"
}
```

Et cette ligne à android/gradle.properties:
```properties
android.ndkPath=C:\\Users\\hp\\AppData\\Local\\Android\\Sdk\\ndk\\29.0.13113456
```

### 5. Test et vérification
```bash
cd c:\Users\hp\tiforama_v7
flutter clean
flutter pub get
flutter build apk --debug
```