@echo off
echo ============================================
echo Migration de Tiforama v6 vers Tiforama v7
echo ============================================

echo 1. Création du nouveau projet...
cd C:\Users\hp
flutter create -t app tiforama_v7

echo 2. Copie des fichiers de code...
xcopy /E /Y C:\Users\hp\tiforama_v6\lib\*.* C:\Users\hp\tiforama_v7\lib\

echo 3. Copie des assets (si existants)...
if exist C:\Users\hp\tiforama_v6\assets (
    mkdir C:\Users\hp\tiforama_v7\assets
    xcopy /E /Y C:\Users\hp\tiforama_v6\assets\*.* C:\Users\hp\tiforama_v7\assets\
)

echo 4. Modifiez manuellement le fichier pubspec.yaml pour inclure vos dépendances
echo 5. Configurez le NDK en modifiant les fichiers build.gradle et gradle.properties

echo Migration terminée! Veuillez compléter les étapes manuelles 4 et 5.
echo Puis exécutez:
echo cd C:\Users\hp\tiforama_v7
echo flutter clean
echo flutter pub get
echo flutter build apk --debug

pause
