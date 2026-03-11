#!/usr/bin/env bash
set -euo pipefail

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm n'est pas installe. Installe-le avant de continuer."
  exit 1
fi

pnpm install

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo ".env.local cree depuis .env.example"
fi

echo "Configuration terminee."
echo "1. Renseigne les variables Supabase et OAuth dans .env.local"
echo "2. Lance le web: pnpm dev:web"
echo "3. Lance le mobile: pnpm dev:mobile"
echo "4. Initialise la BDD locale Supabase: supabase db reset"
