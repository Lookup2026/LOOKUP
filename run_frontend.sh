#!/bin/bash
cd "$(dirname "$0")/frontend"

# Installer les dependances si necessaire
if [ ! -d "node_modules" ]; then
    echo "Installation des dependances npm..."
    npm install
fi

# Lancer le serveur de dev
echo "Demarrage du frontend sur http://localhost:5173"
npm run dev
