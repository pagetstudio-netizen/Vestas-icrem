# Déploiement Vestas sur Plesk avec Supabase

## 1. Préparer le dépôt

Depuis le dossier du projet :

```bash
npm ci
npm run check
npm run build
```

Le build crée :

- `dist/index.cjs` : serveur Node/Express de production
- `dist/public/` : frontend compilé

Ne committez pas `node_modules`, `dist` ou un fichier `.env` contenant des secrets.

## 2. Réglages Node.js dans Plesk

Dans **Websites & Domains > votre domaine > Node.js** :

- **Application mode** : `Production`
- **Application root** : le dossier racine du dépôt cloné, par exemple `/var/www/vhosts/example.com/vestas`
- **Document root** : `dist/public` à l’intérieur de l’Application root
- **Application startup file** : `dist/index.cjs`
- **Node.js version** : Node.js 20 ou plus récent
- **Application URL** : votre domaine HTTPS, par exemple `https://example.com`

Le serveur Express sert les fichiers de `dist/public` et les routes `/api`. Le Document root est indiqué pour Plesk, mais toutes les requêtes doivent être transmises à l’application Node afin que l’API et le frontend fonctionnent ensemble.

## 3. Commandes de déploiement

Après **Pull**, utilisez :

```bash
npm ci
npm run build
```

Puis cliquez sur **Restart App**. Si Plesk propose une commande de démarrage personnalisée, utilisez :

```bash
npm start
```

Le script `start` lance `NODE_ENV=production node dist/index.cjs`.

## 4. Variables d’environnement Plesk

À renseigner dans **Node.js > Environment variables** :

| Variable | Valeur |
| --- | --- |
| `NODE_ENV` | `production` |
| `PORT` | Laisser vide si Plesk fournit automatiquement le port |
| `SUPABASE_DATABASE_URL` | Chaîne PostgreSQL Supabase complète |
| `SESSION_SECRET` | Secret long et aléatoire, différent du mot de passe admin |
| `APP_URL` | URL publique HTTPS exacte, sans slash final |
| `ADMIN_PASSWORD` | Mot de passe admin souhaité au premier démarrage (obligatoire en production) |
| `SOLEASPAY_API_KEY` | Clé API Soleaspay, si les dépôts automatiques sont activés |
| `OMNIPAY_API_KEY` | Clé API Omnipay, si cette intégration est utilisée |

`SUPABASE_DATABASE_URL` doit être la connexion PostgreSQL, pas l’URL REST Supabase. Dans Supabase, utilisez la chaîne de connexion PostgreSQL adaptée à votre hébergement. Activez SSL ; le serveur l’utilise automatiquement pour cette variable.

`SESSION_SECRET` et `ADMIN_PASSWORD` sont obligatoires lorsque `NODE_ENV=production`. Ne copiez pas les valeurs dans GitHub.

Ne définissez pas `DATABASE_URL` dans Plesk si `SUPABASE_DATABASE_URL` est utilisée, sauf si vous avez réellement besoin de la migration depuis une autre base.

## 5. Base de données Supabase

Au premier démarrage, l’application crée la table de session et initialise les données de base. Pour une base Supabase vide, vérifiez les logs Plesk et laissez le premier démarrage se terminer avant de tester la connexion.

Les sessions utilisent aussi `SUPABASE_DATABASE_URL`. Cela est nécessaire pour que les connexions restent disponibles après un redémarrage Plesk.

## 6. HTTPS, cookies et proxy

Activez le certificat SSL dans Plesk avant le premier test. En production, l’application utilise des cookies sécurisés et `SameSite=None`, donc l’accès doit se faire en HTTPS.

Le domaine utilisé dans `APP_URL` doit être le même domaine HTTPS que celui ouvert par les utilisateurs. Cette URL est également utilisée par Soleaspay pour les retours de paiement.

## 7. Vérifications après Pull + Deploy + Restart

Dans les logs Plesk, vérifiez notamment :

```text
serving on port ...
```

Puis testez :

```bash
curl -I https://example.com/
curl -i https://example.com/api/auth/me
```

Une réponse `401` sur `/api/auth/me` avant connexion est normale. Une erreur `500` ou une erreur de connexion PostgreSQL indique une variable Supabase incorrecte ou une base non accessible.

## 8. Attention aux uploads

Les captures de dépôts sont actuellement stockées dans la base de données. Les fichiers statiques du frontend sont reconstruits dans `dist/public`. Ne supprimez pas les données Supabase pendant un redéploiement.