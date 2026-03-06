#!/bin/zsh

# 1. Rimuovi devDependencies e installa solo prod
npm install --workspaces --production

# 2. Copy frontend node_modules
if [ -d "./packages/frontend/node_modules" ]; then
  mkdir -p ./dist
  cp -R ./packages/frontend/node_modules ./dist/node_modules
  echo "Successfully copied frontend node_modules in ./dist/node_modules"
else
  echo "Attenzione: ./packages/frontend/node_modules non esiste."
fi

# 2. Copia node_modules di backend
if [ -d "./packages/backend/node_modules" ]; then
  mkdir -p ./dist/backend
  cp -R ./packages/backend/node_modules ./dist/backend/node_modules
  echo "Copiato backend node_modules in ./dist/backend/node_modules"
else
  echo "Attenzione: ./packages/backend/node_modules non esiste."
fi

# 3. Reinstalla tutte le dipendenze (prod + dev) per sviluppo
npm install --workspaces

echo "Pre-build completato."
