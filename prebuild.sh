#!/bin/zsh

# 1. Remove devDependencies and install only production dependencies
npm install --workspaces --production

# 2. Copy frontend node_modules
if [ -d "./packages/frontend/node_modules" ]; then
  mkdir -p ./dist
  cp -R ./packages/frontend/node_modules ./dist/node_modules
  echo "Successfully copied frontend node_modules in ./dist/node_modules"
else
  echo "Warning: ./packages/frontend/node_modules not found."
fi

# 2. Copia node_modules di backend
if [ -d "./packages/backend/node_modules" ]; then
  mkdir -p ./dist/backend
  cp -R ./packages/backend/node_modules ./dist/backend/node_modules
  echo "Successfully copied backend node_modules in ./dist/backend/node_modules"
else
  echo "Warning: ./packages/backend/node_modules not found."
fi

# 3. Reinstalla tutte le dipendenze (prod + dev) per sviluppo
npm install --workspaces

echo "Pre-build completed."
