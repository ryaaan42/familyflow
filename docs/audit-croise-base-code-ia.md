# Audit croisé (base réelle / migrations / code / logique produit / logique IA)

_Date: 2026-03-15_

## 0) Limite bloquante constatée

Le dump réel mentionné dans l'IDE (`/Users/ryan/backup.sql`) n'est pas présent dans cet environnement d'exécution, donc je n'ai pas pu faire une **diff factuelle dump↔migrations** ligne à ligne.

Conséquence: les écarts “base réelle” ci-dessous sont formulés comme **écarts probables / causes racines vérifiables** à contrôler dès que le dump est monté dans le workspace.

---

## 1) Écarts structurels probables entre base réelle et code

### 1.1 Bloc tâches (fort risque si migrations récentes non appliquées)

- Le code web/mobiles attend désormais `task_assignments.household_id` et `task_assignments.day_of_week`, et un modèle “1 assignment actif par task” (`onConflict: "task_id"`).
- Ces éléments sont ajoutés tardivement dans `20260314183000_harden_task_assignment_persistence.sql`.
- Si la base réelle a été dumpée avant cette migration, symptômes attendus:
  - assignations qui semblent faites dans l'UI mais reviennent mal après refresh,
  - collisions/duplicats d'assignations,
  - lecture non déterministe de l'assignation “active”.

### 1.2 Bloc préférences repas / IA repas

- Le code API attend la table `household_meal_preferences` (créée en `20260319090000_unify_meal_preferences_and_birth_list_actions.sql`).
- Si absente en base réelle: endpoints IA repas/shopping retombent sur des comportements génériques et perdent la personnalisation alimentaire.

### 1.3 Bloc liste de naissance (réservations)

- Le code récent suppose l'attribut `birth_list_reservations.action` (migration `20260319090000...`).
- Si la colonne manque dans la base réelle: incohérences sur le suivi intent/reserved/purchased.

---

## 2) Policies/RLS: zones à risque de non-persistance “silencieuse”

### 2.1 `ai_suggestions` modifiables seulement par admins

- Les policies créées sur `ai_suggestions` sont “managed by admins” (`is_household_admin`) pour les opérations d'écriture.
- L'API `PATCH /api/ai/suggestions` tente pourtant un update direct pour tout utilisateur du foyer (sans fallback explicite côté UX).
- Résultat produit typique: module “semble marcher” (toggle en UI), mais pour membre non-admin, l'écriture est rejetée RLS.

### 2.2 Écriture cross-module IA sans contrôle d'erreur fin

- Dans `POST /api/ai/household-plan`, plusieurs écritures critiques sont enchaînées sans vérification explicite de `error` (households.ai_context, meal_plans, household_goals, shopping_list_items).
- En cas d'échec partiel (RLS, contrainte, réseau), la route peut continuer et retourner un plan “OK”, ce qui masque les problèmes de persistance.

---

## 3) Causes racines des bugs de persistance

## 3.1 Mobile: assignation de tâche fragile

- `assignTask()` fait `upsert` sur `task_assignments` **sans** `onConflict` explicite, alors que le schéma a unicité logique sur la tâche (`idx_task_assignments_unique_task`).
- Deuxième assignation de la même tâche peut échouer ou se comporter différemment selon l'état SQL exact.

### 3.2 Mobile: lecture incomplète des assignations

- Le bootstrap mobile charge `tasks` depuis `tasks` uniquement, sans jointure `task_assignments`.
- Donc même si l'écriture assignment réussit en base, l'écran peut continuer à afficher un état non assigné (illusion de non-persistance côté utilisateur).

### 3.3 Web IA: aucune transaction globale

- La route `ai/household-plan` écrit dans plusieurs tables en séquence (compteur usage, génération, suggestions, tâches, goals, meals, shopping) sans transaction englobante.
- Un échec intermédiaire crée des états partiellement persistés difficiles à diagnostiquer.

---

## 4) Modules “semblent fonctionner” mais n'écrivent pas (ou pas la source de vérité)

### 4.1 Écran mobile `tasks`

- `apps/mobile/app/(tabs)/tasks.tsx` utilise `useFamilyFlowStore` du package shared (store démo), pas le contexte Supabase mobile (`useApp`).
- Ce module peut sembler interactif mais opère sur un state local/demo et non la base réelle.

### 4.2 Assistant mobile

- `apps/mobile/app/(tabs)/assistant.tsx` affiche des conseils statiques calculés localement (`pendingTasks`, `doneGoals`) sans appel IA ni sync avec `ai_suggestions`/`ai_generations`.
- Produit perçu “IA active”, mais pas de boucle persistante côté base.

---

## 5) Modules IA non synchronisés avec le contexte global foyer

### 5.1 Contexte IA partiel

- `buildHouseholdAiContext()` agrège goals/budget/meal_preferences, mais ne lit pas `households.ai_context`, ni shopping list, ni historique d'exécution IA, ni événements de réalisation de tâches.
- Les assistants IA peuvent donc ignorer des décisions globales déjà stockées dans `ai_context`.

### 5.2 Écrasement de `households.ai_context`

- `persistCrossModuleData()` met à jour `households.ai_context` avec un objet `latest_plan` reconstruit, sans merge sûr d'un contexte antérieur plus riche.
- Risque de perte de contexte global si d'autres modules stockent des clés supplémentaires dans `ai_context`.

---

## 6) Contrôles immédiats recommandés sur la base réelle

1. Vérifier présence des migrations >= `20260314183000` et `20260319090000` dans le schéma dumpé.
2. Vérifier policies effectives sur `ai_suggestions` (écriture membre vs admin).
3. Rejouer scénario réel non-admin:
   - génération IA,
   - toggle suggestion,
   - assignation mobile,
   - refresh complet.
4. Ajouter logs d'échec explicites sur chaque insert/update critique de `ai/household-plan`.
5. Uniformiser mobile sur la même source de vérité (`useApp`) pour tous les onglets opérationnels.

---

## 7) Commandes exécutées pour cet audit

- `node scripts/audit-db-schema.mjs`
- `rg -n "meal_plans|day_of_week|check" supabase/migrations/*.sql`
- lectures ciblées des routes API IA, hooks mobiles, et migrations SQL.

