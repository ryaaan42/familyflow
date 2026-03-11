# FamilyFlow Blueprint

## Resume produit

FamilyFlow est une plateforme familiale unifiee pour organiser les taches du foyer, suivre le budget, estimer les economies possibles et produire des exports PDF imprimables. La V1 cible les foyers qui veulent une base simple, belle et exploitable en production, avec une extension naturelle vers des fonctions premium plus intelligentes.

## Stack retenue

- Monorepo `pnpm` + `Turborepo`
- Web: Next.js App Router, TypeScript, Tailwind CSS, composants de style `shadcn/ui`, React Hook Form, Zod, Framer Motion
- Mobile: React Native avec Expo Router, TypeScript, logique partagee via `@familyflow/shared`
- Backend: Supabase (Auth, PostgreSQL, Storage, RLS)
- PDF: `@react-pdf/renderer` via route Next.js
- Etat client: Zustand partage entre web et mobile
- Graphiques: Recharts web, composants natifs mobiles simples

## Architecture repo

```text
.
├─ apps/
│  ├─ web/          # Landing, app SaaS, API PDF
│  └─ mobile/       # App iOS / Android Expo
├─ packages/
│  └─ shared/       # Types, schemas, engines, store, donnees demo
├─ supabase/
│  ├─ migrations/   # SQL schema + RLS
│  └─ seed.sql      # Seed de demo
├─ docs/
│  ├─ blueprint.md
│  └─ deployment.md
└─ scripts/
```

## Flows UX V1

1. Authentification
   - Email + mot de passe
   - Google / Apple prepares via Supabase
   - Redirection sur onboarding apres premiere connexion
2. Onboarding foyer
   - Nom du foyer
   - Type de logement, surface, pieces
   - Membres, ages, roles, disponibilites
   - Animaux
3. Dashboard
   - Taches du jour
   - Progression semaine
   - Vue budget du mois
   - Economies potentielles
4. Repartition des taches
   - Suggestions intelligentes
   - Assignation manuelle
   - Reequilibrage automatique
   - Historique / completion
5. Budget & economies
   - Revenus / depenses
   - Scenarios d'habitudes couteuses
   - Projections 3 / 6 / 12 mois
6. Export PDF
   - Themes
   - Planning hebdo
   - Budget + economies

## V1 realiste

- Landing marketing premium
- Web app fonctionnelle en mode demo et branchable sur Supabase
- App mobile Expo avec navigation et ecrans principaux
- Schema Postgres / Supabase complet
- Moteur de suggestion de taches
- Moteur de projection d'economies
- Export PDF stylise
- Architecture prete pour la production

## Prepare pour V2

- Paiement Stripe et plans freemium
- Push notifications cloud
- IA plus poussee pour suggestions et planning
- Drag and drop avance
- Collaboration multi-foyers / garde alternee
- Automatisations hebdomadaires intelligentes

## Decision produit

- V1 fonctionne avec un mode demo riche pour accelerer le time-to-market.
- Les modules lourds sont prepares proprement plutot que simules sans structure.
- Le coeur metier est partage entre web et mobile pour eviter la divergence.

