# Configuration VPS Hostinger pour MySQL

## 🎯 Problème identifié
- Timeout sur le port 3306 depuis l'extérieur
- MySQL n'accepte que les connexions locales
- Firewall bloque le port MySQL

## 🔧 Solution étape par étape

### 1. Connexion SSH à votre VPS
```bash
ssh root@31.170.165.41
# Mot de passe : 8ud3dqy(JlrNAGe
```

### 2. Vérifier MySQL
```bash
# Vérifier que MySQL fonctionne
systemctl status mysql

# Si MySQL n'est pas démarré
systemctl start mysql
systemctl enable mysql
```

### 3. Configurer MySQL pour les connexions externes
```bash
# Éditer le fichier de configuration MySQL
nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Trouver la ligne :
# bind-address = 127.0.0.1

# La remplacer par :
# bind-address = 0.0.0.0

# Sauvegarder (Ctrl+X, puis Y, puis Entrée)
```

### 4. Redémarrer MySQL
```bash
systemctl restart mysql
```

### 5. Configurer le firewall
```bash
# Autoriser le port MySQL
ufw allow 3306

# Vérifier les règles firewall
ufw status
```

### 6. Créer un utilisateur MySQL pour les connexions externes
```bash
# Se connecter à MySQL
mysql -u root -p
# Mot de passe root MySQL : 8ud3dqy(JlrNAGe

# Dans MySQL, exécuter :
GRANT ALL PRIVILEGES ON *.* TO 'u292729667_moha_bibi'@'%' IDENTIFIED BY '79I*$6Dd975zZZ';
FLUSH PRIVILEGES;

# Vérifier l'utilisateur
SELECT User, Host FROM mysql.user WHERE User = 'u292729667_moha_bibi';

# Quitter MySQL
EXIT;
```

### 7. Test de connexion depuis votre PC
```bash
# Retester depuis votre PC Windows
node test-hostinger.js
```

## 🚀 Alternative : Utiliser cPanel/hPanel de Hostinger

Si vous préférez l'interface graphique :

1. **Connectez-vous à hPanel Hostinger**
2. **Allez dans "Bases de données" → "MySQL Remote"**
3. **Ajoutez l'IP de votre PC local** (ou % pour toutes les IPs)
4. **Vérifiez que l'utilisateur a les permissions correctes**

## 🔍 Test après configuration

Une fois configuré, retestez avec :
```bash
node test-hostinger.js
```

Vous devriez voir :
```
✅ Connexion réussie !
📊 Bases de données disponibles:
   - fragDb
   - information_schema
   - mysql
   - performance_schema
```

## ⚡ Configuration finale pour votre app

Une fois la connexion fonctionnelle, mettez à jour votre `.env` :
```env
DB_HOST=31.170.165.41
DB_USER=u292729667_moha_bibi
DB_PASSWORD=79I*$6Dd975zZZ
DB_NAME=u292729667_fragDb
DB_PORT=3306
```

## 🔒 Sécurité recommandée

Pour la production, limitez l'accès MySQL :
```sql
-- Au lieu de '%', utilisez l'IP spécifique de votre serveur d'application
GRANT ALL PRIVILEGES ON u292729667_fragDb.* TO 'u292729667_moha_bibi'@'VOTRE_IP_SERVEUR_APP';
```
