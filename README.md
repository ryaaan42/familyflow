# Planille

Planille est une base monorepo moderne pour une application familiale multi-plateforme:

- web app marketing + application SaaS
- application iOS via Expo
- application Android via Expo
- backend Supabase avec PostgreSQL, Auth, RLS et stockage

Le produit aide une famille a mieux repartir les taches, piloter son budget, estimer les depenses evitables et exporter des plannings PDF propres.

## 1. Cadrage produit

### Resume

Planille relie trois besoins quotidiens qui sont souvent disperses:

- organisation du foyer
- charge mentale / repartition des taches
- maitrise du budget familial

La V1 livre une base exploitable avec:

- landing page premium
- dashboard famille
- gestion du foyer
- moteur de suggestions de taches
- suivi budget
- projections d'economies
- export PDF A4
- app mobile Expo
- schema Supabase complet

### Stack retenue

- Monorepo: `pnpm` + `turbo`
- Web: Next.js App Router, TypeScript, Tailwind CSS, composants `shadcn/ui`, React Hook Form, Zod, Framer Motion
- Mobile: React Native + Expo Router
- Partage metier: `@familyflow/shared`
- Backend: Supabase + PostgreSQL + RLS
- PDF: `@react-pdf/renderer`
- Etat client: Zustand

### Architecture repo

```text
.
├─ apps/
│  ├─ web/        # landing + app Next.js + route PDF
│  └─ mobile/     # app Expo iOS/Android
├─ packages/
│  └─ shared/     # types, schemas, moteurs, store, demo data
├─ supabase/
│  ├─ migrations/ # schema SQL + RLS
│  └─ seed.sql    # donnees demo realistes
├─ docs/
│  ├─ blueprint.md
│  └─ deployment.md
└─ scripts/
```

### Flows UX principaux

1. Auth
   - inscription email
   - connexion email
   - forgot password
   - Google / Apple prepares via Supabase
2. Onboarding
   - creation du foyer
   - logement
   - membres
   - animaux
3. Dashboard
   - taches du jour
   - progression de la semaine
   - budget du mois
   - economies potentielles
4. Taches
   - suggestions intelligentes
   - assignation
   - reequilibrage automatique
   - completion
5. Budget
   - revenus
   - depenses fixes / variables
   - objectif d'epargne
6. Economies
   - scenarios
   - projections 3 / 6 / 12 mois
7. Export PDF
   - theme
   - telechargement

### V1 livree

- design premium colore et familial
- logique metier partagee
- demo data realistes
- app web exploitable en mode demo
- app mobile avec ecrans principaux
- schema BDD complet
- seed
- RLS
- docs de run / deploiement

### V2 preparee

- Stripe / freemium
- suggestions IA avancees
- push notifications cloud
- drag and drop avance
- garde alternee plus riche
- exports automatiques stockes

## 2. Schema base de donnees

Tables principales:

- `users`
- `households`
- `household_members`
- `pets`
- `task_templates`
- `tasks`
- `task_assignments`
- `task_completions`
- `budgets`
- `budget_items`
- `savings_scenarios`
- `savings_projections`
- `pdf_exports`
- `notifications`
- `user_settings`

Le schema complet est dans [supabase/migrations/20260311170500_init_familyflow.sql](/Users/ryan/Desktop/Nouveau%20projet/supabase/migrations/20260311170500_init_familyflow.sql).

## 3. Demarrage local

### Prerequis

- Node.js 20.11.1 (recommande pour eviter les erreurs pnpm `ERR_INVALID_THIS` observees sur Node 22 selon les environnements)
- pnpm 10.6.2
- Supabase CLI
- compte Vercel pour le web
- compte Expo / EAS pour le mobile

### Installation

```bash
pnpm install
cp .env.example .env.local
```

Puis renseigner:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- providers OAuth Google / Apple

### Base de donnees

```bash
supabase start
supabase db reset
```

### Lancer le web

```bash
pnpm dev:web
```

### Lancer le mobile

```bash
pnpm dev:mobile
```

## 4. Comptes de demo

Apres seed local:

- `emma@planille.app`
- `lucas@planille.app`
- mot de passe: `password123`

## 5. Scripts utiles

```bash
pnpm dev
pnpm dev:web
pnpm dev:mobile
pnpm typecheck
pnpm test
pnpm setup
```

## 6. PDF

La route web d'export se trouve ici:

- [apps/web/src/app/api/pdf/route.ts](/Users/ryan/Desktop/Nouveau%20projet/apps/web/src/app/api/pdf/route.ts)

Le template PDF se trouve ici:

- [apps/web/src/components/pdf/familyflow-pdf-document.tsx](/Users/ryan/Desktop/Nouveau%20projet/apps/web/src/components/pdf/familyflow-pdf-document.tsx)

## 7. Moteurs metier

Suggestion de taches:

- [packages/shared/src/engines/task-suggestions.ts](/Users/ryan/Desktop/Nouveau%20projet/packages/shared/src/engines/task-suggestions.ts)

Projections d'economies:

- [packages/shared/src/engines/savings-projections.ts](/Users/ryan/Desktop/Nouveau%20projet/packages/shared/src/engines/savings-projections.ts)

Etat partage web/mobile:

- [packages/shared/src/state/use-familyflow-store.ts](/Users/ryan/Desktop/Nouveau%20projet/packages/shared/src/state/use-familyflow-store.ts)

## 8. Deploiement production

### Web

1. Creer le projet Supabase.
2. Appliquer les migrations.
3. Utiliser le seed uniquement pour la demo, la preview ou le QA.
4. Configurer Google / Apple dans Supabase Auth.
5. Deployer `apps/web` sur Vercel.
6. Injecter les variables d'environnement.
7. Basculer `NEXT_PUBLIC_ENABLE_DEMO_MODE=false`.

### Mobile

1. Configurer `apps/mobile/app.json`.
2. Connecter EAS Build.
3. Definir les variables `EXPO_PUBLIC_*`.
4. Configurer les identifiants Apple / Google.
5. Lancer les builds iOS et Android.

## 9. Notes pragmatiques

- Le repo livre une vraie base exploitable, mais pas une connexion Supabase completee de bout en bout dans tous les ecrans.
- La logique est volontairement centralisee dans `@familyflow/shared` pour reduire la divergence web/mobile.
- Le mode demo permet de travailler le produit et l'UX avant de brancher toutes les mutations serveur.
- Les versions de packages sont des points de depart coherents pour la V1 et doivent etre rafraichies avant un lancement reel si de nouveaux patches sont sortis.

## Billing Stripe (V1)

Variables attendues dans `apps/web`:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

Webhooks à pointer vers `/api/stripe/webhook`.
