# LOOKUP - Contexte Projet

## Description
App mobile sociale type Instagram pour partager ses looks vestimentaires et découvrir ceux des gens croisés dans la rue. Géolocalisation en temps réel pour détecter les croisements.

## Stack Technique
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (hébergé sur Render)
- **Frontend**: React + Vite + TailwindCSS
- **Mobile**: Capacitor (wrapper natif iOS/Android)
- **Hébergement**: Backend sur Render, Frontend sur Vercel
- **URLs**:
  - Backend: `https://lookup-htrd.onrender.com`
  - Frontend: `https://lookup-gamma.vercel.app`

## Architecture Backend (`backend/`)
- `app/main.py` — Point d'entrée FastAPI
- `app/core/config.py` — Config (CORS, DB, etc.)
- `app/models/` — Modèles SQLAlchemy (user, look, crossing, notification)
- `app/schemas/` — Schemas Pydantic
- `app/api/endpoints/` — Routes (users, looks, crossings, notifications)
- CORS configuré pour: localhost:5173, vercel, capacitor://localhost, http://localhost
- **IMPORTANT**: La variable `CORS_ORIGINS` sur Render override le code — modifier sur le dashboard Render

## Architecture Frontend (`frontend/`)
- `src/pages/` — Pages: Home, Profile, Search, AddLook, LookDetail, Notifications, Settings, CrossingDetail, Welcome
- `src/components/Layout.jsx` — Layout principal avec nav bar 5 boutons (Accueil, Notifs, [+], Croisements, Profil)
- `src/api/client.js` — Client Axios avec toutes les fonctions API
- `src/index.css` — Styles globaux, glassmorphism, safe areas

## Capacitor (App Native)
- Config: `frontend/capacitor.config.json`
- Bundle ID: `com.gabrielazoulay.lookup`
- Signing: Personal Team (Apple ID gratuit)
- Build: `npm run build && npx cap sync` puis lancer depuis Xcode
- iOS folder: `frontend/ios/` (dans .gitignore)

## Fonctionnalités Implémentées
- Auth (register/login/JWT)
- Création/affichage de looks avec photos
- Géolocalisation et détection de croisements
- Feed des croisements + feed amis
- Like / Unlike sur les looks
- Follow / Unfollow
- Recherche d'utilisateurs
- Notifications in-app (follow + like) avec badge temps réel
- Pull to refresh sur Home
- Safe areas iPhone (Dynamic Island/notch)
- Headers sticky sur toutes les pages
- Nav bar alignée avec bouton "+" central

## TODO avant publication App Store
### Obligatoire (Apple refuse sans ça)
- [ ] Compte Apple Developer ($99/an)
- [ ] CGU / Politique de confidentialité
- [ ] Signalement de contenu (obligatoire si contenu user-generated)
- [ ] Blocage d'utilisateurs
- [ ] Suppression de compte et données
- [ ] Icône d'app haute résolution + Splash screen

### Important
- [ ] Rate limiting backend (login, register, upload)
- [ ] Compression images avant upload
- [ ] Écran "pas de connexion internet"
- [ ] Gestion token expiré (re-login auto)
- [ ] Messages d'erreur clairs pour l'utilisateur
- [ ] Nom de domaine personnalisé

## Commandes Utiles
```bash
# Dev frontend
cd frontend && npm run dev

# Build + deploy sur iPhone
cd frontend && npm run build && npx cap sync
# Puis ouvrir Xcode: npx cap open ios

# Backend local
cd backend && uvicorn app.main:app --reload
```
