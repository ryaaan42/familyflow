# Deploiement FamilyFlow

## Web

1. Creer un projet Supabase.
2. Appliquer les migrations: `supabase db push`
3. Injecter des donnees de seed uniquement sur environnements de demo ou preview.
4. Configurer Google et Apple dans Supabase Auth.
5. Creer un projet Vercel pointe sur `apps/web`.
6. Definir les variables d'environnement du fichier `.env.example`.
7. Activer `NEXT_PUBLIC_ENABLE_DEMO_MODE=false` pour la production connectee.

## Mobile

1. Connecter Expo et EAS Build.
2. Definir les variables `EXPO_PUBLIC_*`.
3. Configurer les bundles iOS / Android dans `apps/mobile/app.json`.
4. Ajouter les certificats Apple Sign In et les SHA Android pour Google.
5. Lancer `eas build --platform ios` puis `eas build --platform android`.

## Auth social

- Google: configurer `Authorized redirect URLs` avec l'URL Supabase.
- Apple: configurer `Services ID`, `Key ID`, `Team ID`, `private key`.

## Storage

- Bucket `pdf-exports` pour conserver les exports premium.
- Bucket `avatars` pour les profils et foyers.

## Observabilite recommandee

- Sentry pour erreurs web/mobile
- PostHog ou Amplitude pour analytics produit
- Logs et audit trail Supabase pour operations sensibles
