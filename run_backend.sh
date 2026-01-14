#!/bin/bash
cd "$(dirname "$0")/backend"

# Creer l'environnement virtuel si necessaire
if [ ! -d "venv" ]; then
    echo "Creation de l'environnement virtuel..."
    python3 -m venv venv
fi

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dependances
echo "Installation des dependances..."
pip install -r requirements.txt

# Lancer le serveur
echo "Demarrage du serveur backend sur http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
