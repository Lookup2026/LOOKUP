# LOOKUP - Contexte Projet

---

## Description
App mobile sociale type Instagram pour partager ses looks vestimentaires et découvrir ceux des gens croisés dans la rue. Géolocalisation en temps réel pour détecter les croisements, même quand l'app est fermée ou le téléphone verrouillé.

**Concept principal** : Quand deux utilisateurs LOOKUP se croisent dans la rue (app ouverte ou non), et que chacun a posté son look du jour, le look de l'un s'affiche dans l'app de l'autre. Pas de notifications push — l'utilisateur ouvre l'app quand il veut vérifier.

---

## Stack Technique
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (hébergé sur Render)
- **Frontend**: React + Vite + TailwindCSS
- **Mobile**: Capacitor 8 (wrapper natif iOS/Android)
- **Géolocalisation**: @capgo/background-geolocation (plugin natif)
- **Hébergement**: Backend sur Render, Frontend sur Vercel
- **Stockage photos**: Supabase Storage
- **Domaine**: lookup-app.fr (OVH) → configuré sur Vercel (A record 76.76.21.21 + CNAME www → cname.vercel-dns.com)
- **Email**: contact@lookup-app.fr
- **URLs**:
  - Backend: `https://lookup-htrd.onrender.com`
  - Frontend: `https://lookup-gamma.vercel.app` / `https://lookup-app.fr`

---

## Services en ligne utilisés

| Service | Usage | URL Dashboard |
|---------|-------|---------------|
| **Render** | Backend FastAPI + PostgreSQL | https://dashboard.render.com |
| **Vercel** | Frontend React (hosting) | https://vercel.com/dashboard |
| **Supabase** | Stockage des photos | https://supabase.com/dashboard |
| **OVH** | Nom de domaine lookup-app.fr | https://www.ovh.com/manager |
| **Apple Developer** | Publication App Store (à faire) | https://developer.apple.com |

---

## Architecture Backend (`backend/`)
- `app/main.py` — Point d'entrée FastAPI + middleware sécurité + endpoints admin protégés
- `app/core/config.py` — Config (CORS, DB, JWT, géoloc paramètres)
- `app/models/user.py` — Modèles User, Follow (avec status pending/accepted), BlockedUser
- `app/models/` — Autres modèles SQLAlchemy (look, crossing, notification)
- `app/schemas/` — Schemas Pydantic
- `app/api/endpoints/` — Routes (auth, users, looks, crossings, photos, notifications)
- CORS configuré pour: localhost:5173, localhost:3000, vercel, capacitor://localhost, http://localhost
- **IMPORTANT**: La variable `CORS_ORIGINS` sur Render override le code — modifier sur le dashboard Render

### Sécurité Backend (implémentée)
- JWT HS256, expiration **24h**
- Hachage mots de passe bcrypt
- Validation Pydantic sur toutes les entrées
- Rate limiting (slowapi)
- **SecurityHeadersMiddleware** : X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, HSTS (prod)
- Endpoints admin protégés par **X-Admin-Key** header (/migrate, /cleanup-crossings, /debug-crossings)
- SECRET_KEY obligatoire en production (crash si manquante avec PostgreSQL)

### Paramètres Géolocalisation Backend
- `CROSSING_RADIUS_METERS`: **200m** (rayon de détection d'un croisement)
- `CROSSING_TIME_WINDOW_MINUTES`: **5 min** (fenêtre de temps pour considérer un croisement)

---

## Architecture Frontend (`frontend/`)

### Pages principales
- `src/pages/Home.jsx` — Feed croisements + amis, carrousel "Mes looks"
- `src/pages/Profile.jsx` — Profil utilisateur
- `src/pages/EditProfile.jsx` — **[NOUVEAU]** Édition profil (photo, bio, username avec restriction 15 jours)
- `src/pages/Search.jsx` — Recherche utilisateurs avec boutons Follow/Demander/En attente
- `src/pages/Discover.jsx` — **[NOUVEAU]** Page découverte de looks populaires
- `src/pages/Notifications.jsx` — Notifications + demandes d'abonnement
- `src/pages/Settings.jsx` — Paramètres avec dark mode toggle
- `src/pages/AddLook.jsx` — Création/édition de look
- `src/pages/Crossings.jsx` — Liste des croisements
- `src/pages/Welcome.jsx`, `Login.jsx`, `Register.jsx` — Auth
- `src/pages/Onboarding.jsx` — Onboarding 4 étapes
- `src/pages/CGU.jsx`, `Privacy.jsx` — Pages légales

### Composants
- `src/components/Layout.jsx` — Layout principal avec navbar flottante + FAB "+"
- `src/components/PhotoCarousel.jsx` — Carrousel photos Swiper
- `src/components/FeedCard.jsx` — Carte de feed (croisement ou look ami)
- `src/components/Skeleton.jsx` — Skeleton loaders

### Stores (Zustand)
- `src/stores/locationStore.js` — Géolocalisation (plugin natif + fallback web)
- `src/stores/authStore.js` — Auth (arrête le tracking au logout)

### API Client
- `src/api/client.js` — Client Axios avec toutes les fonctions API

### Styles
- `src/index.css` — Styles globaux, glassmorphism, dark mode, scrollbar cachée

---

## Fonctionnalités Implémentées

### Core
- [x] Auth (register/login/JWT)
- [x] Création/affichage de looks avec photos (multi-photos)
- [x] Géolocalisation et détection de croisements
- [x] **Géolocalisation arrière-plan** (plugin natif iOS, fonctionne app fermée)
- [x] Feed des croisements + feed amis
- [x] Like / Unlike sur les looks et croisements
- [x] Follow / Unfollow
- [x] Recherche d'utilisateurs

### Social
- [x] **Système de demandes d'abonnement** pour profils privés (pending/accepted)
- [x] Notifications in-app (follow, follow_request, follow_accepted, like)
- [x] Section demandes d'abonnement dans Notifications (accepter/refuser)
- [x] Icône cadenas sur profils privés dans Search
- [x] Signalement de contenu
- [x] Blocage d'utilisateurs

### UI/UX
- [x] **Dark mode** complet avec toggle dans Settings
- [x] **Page Découvrir** (remplace Croisements dans navbar)
- [x] **Édition profil** (photo, bio, username avec restriction 15 jours)
- [x] Pull to refresh sur Home
- [x] Safe areas iPhone (Dynamic Island/notch)
- [x] Headers sticky sur toutes les pages
- [x] Navbar flottante "bulle" avec FAB "+" séparé
- [x] Scroll fluide
- [x] **Scrollbar masquée** globalement
- [x] Espacement carrousel "Mes looks" (ml-4)

### Légal & Sécurité
- [x] CGU / Politique de confidentialité
- [x] Suppression de compte et données
- [x] Headers de sécurité (middleware)
- [x] Rate limiting backend
- [x] Endpoints admin protégés

### Autres
- [x] Domaine personnalisé (lookup-app.fr)
- [x] Système de parrainage (referral_code)
- [x] Bandeau permission GPS refusée
- [x] Onboarding 4 étapes

---

## Navbar & Layout (Layout.jsx)

- **Navbar** : `paddingBottom: '12px'` — barre flottante en bas
- **FAB bouton +** : `bottom: '85px'` — au-dessus de la navbar avec petit espace
- **4 icônes navbar** : Accueil, Notifs (avec badge), Découvrir (Compass), Profil
- **Style navbar** : fond quasi transparent, backdrop-filter blur 12px

---

## Système de Follow avec demandes (Profils privés)

### Backend endpoints (`/api/endpoints/users.py`)
- `POST /{user_id}/follow` — Si profil privé → status="pending" + notif "follow_request"
- `GET /{user_id}/is-following` — Retourne `is_following` + `status` (null/pending/accepted)
- `GET /follow-requests` — Liste des demandes en attente
- `GET /follow-requests/count` — Nombre de demandes
- `POST /follow-requests/{id}/accept` — Accepter + notif "follow_accepted"
- `POST /follow-requests/{id}/reject` — Refuser (supprime la demande)
- `GET /search` — Retourne `is_private` et `follow_status` pour chaque user

### Frontend
- **Search.jsx** : Boutons "Suivre" / "Demander" / "En attente" / "Suivi"
- **Notifications.jsx** : Section "Demandes d'abonnement" avec Accept/Reject

---

## ATTENTION : Mode Démo actif
**`DEMO_MODE = true` dans `src/pages/Home.jsx`** — affiche des données fictives (mock looks, crossings, friends) pour tester l'interface sans compte. **À passer à `false` avant la publication.**

---

## TODO avant publication App Store

### Obligatoire (Apple refuse sans ça)
- [ ] Compte Apple Developer (99€/an)
- [ ] Icône d'app haute résolution (1024x1024)
- [ ] Screenshots App Store (6.7" iPhone 15 Pro Max + 6.1" iPhone 15 Pro)
- [ ] Description et metadata App Store
- [ ] Supprimer DEMO_MODE dans Home.jsx

### Obligatoire côté serveur
- [ ] Upgrader Render Backend vers Starter (7$/mois) — serveur toujours allumé
- [ ] Upgrader Render PostgreSQL vers Starter (7$/mois) — base persistante
- [ ] Définir ADMIN_KEY sur Render (variable d'environnement)
- [ ] Définir SECRET_KEY fixe sur Render (variable d'environnement)

### Recommandé
- [x] Écran "pas de connexion internet" — OfflineBanner.jsx
- [x] Compression images avant upload — utils/imageCompression.js (3-5MB → 200-400KB)
- [x] Gestion token expiré (re-login auto) — toast + redirect vers login

### Après publication App Store
- [ ] **Endpoint admin stats** — GET /admin/stats → { users, looks, crossings } pour tableau de bord rapide
- [ ] Monitorer crashs via App Store Connect
- [ ] Surveiller avis utilisateurs

---

## Infrastructure & Coûts

### Phase 1 : TestFlight (10-50 testeurs) — ~15$/mois
| Service | Plan | Prix |
|---------|------|------|
| Apple Developer | Obligatoire | 99€/an |
| Render Backend | **Starter** | 7$/mois |
| Render PostgreSQL | **Starter** | 7$/mois |
| Supabase | Gratuit | 0$ |
| Vercel | Gratuit | 0$ |
| OVH domaine | Déjà payé | - |

**CRITIQUE**: Le plan gratuit Render éteint le serveur après 15min → les pings GPS sont perdus. Starter (7$/mois) = serveur toujours allumé.

### Phase 2 : Lancement public — ~175$/mois
| Service | Plan | Prix |
|---------|------|------|
| Render Backend | Standard | 25$/mois |
| Render PostgreSQL | Standard | 25$/mois |
| Supabase | Pro | 25$/mois |

---

## Plan Economique / Monetisation

### Phase 1 : Croissance (0 - 10 000 users)
- **Objectif** : Acquerir des utilisateurs, pas de monetisation
- Tout gratuit, pas de friction
- Pas de liens externes (garder pour plus tard)
- Collecter les donnees produits (Marque + Nom = future base)

### Phase 2 : Monetisation douce (10 000 - 50 000 users)
**Affiliation :**
- Amazon Associates : 3-10%
- Awin (Zalando, ASOS) : 5-12%
- Rakuten : 5-15%
- Estimation : 1000 clics/jour × 5% conversion × 50€ × 8% = ~200€/jour

**Looks sponsorises :**
- Marque sponsorise un look : 50-200€/look
- Badge "Partenaire" : 100€/mois

### Phase 3 : Monetisation complete (50 000+ users)
**LOOKUP Premium (4,99€/mois) :**
- Looks illimites
- Voir QUI a vu ton look
- Filtres exclusifs, badge, stats

**Marques - Dashboard analytics :**
- Acces trends : 500€/mois
- Campagne influenceurs : 2000€+
- Placement dans Discover : 1000€/semaine

**Projections :**
| Users | Revenus/mois |
|-------|--------------|
| 10 000 | 500 - 2 000€ |
| 50 000 | 5 000 - 15 000€ |
| 100 000 | 20 000 - 50 000€ |

**IMPORTANT** : Ne pas ajouter de liens externes gratuits — reserve pour affiliation future.

---

## Commandes Utiles

```bash
# Dev frontend
cd /Users/gabrielazoulay/Desktop/Developpement/LOOKUP/frontend
npm run dev

# Build + deploy sur iPhone
cd /Users/gabrielazoulay/Desktop/Developpement/LOOKUP/frontend
npm run build && npx cap sync

# Ouvrir Xcode
npx cap open ios
# OU ouvrir directement : ios/App/App.xcworkspace

# Si erreur "No such module Capacitor" dans Xcode
cd ios/App && pod install

# Nettoyer cache Xcode (si changements pas visibles)
rm -rf ~/Library/Developer/Xcode/DerivedData

# Backend local
cd /Users/gabrielazoulay/Desktop/Developpement/LOOKUP/backend
uvicorn app.main:app --reload
```

---

## Documents générés

- `~/Desktop/LOOKUP_Analyse_Business.html` — Personas, Étude de marché, SWOT, PESTEL
- `~/Desktop/LOOKUP_Document_Technique.pdf` — Architecture, sécurité, checklist App Store

---

## Problèmes Résolus (référence)

- **Scroll feed saccadé**: `touch-action: pan-x` sur PhotoCarousel bloquait le scroll vertical → supprimé
- **Swipe photos vs scroll**: Swiper simplifié (threshold=20, touchAngle=30)
- **DNS CNAME conflit OVH**: CNAME ne peut pas coexister avec A/TXT → utilisé "mode textuel"
- **CSS over-optimisation**: will-change, contain, translateZ empiraient les perfs → revert au CSS minimal
- **Icônes invisibles sur navbar glass**: icônes blanches sur fond clair → passées en gris foncé
- **Erreur "No such module Capacitor"**: Après `rm -rf DerivedData`, faire `pod install` dans ios/App
- **Changements non visibles sur iPhone**: Supprimer l'app, `rm -rf DerivedData`, rebuild Xcode

---

## Session du 8 février 2026 - Résumé

### Nouvelles fonctionnalités ajoutées :
1. **Dark mode** complet (toggle dans Settings, persistance localStorage)
2. **Page Découvrir** (remplace "Croisements" dans la navbar)
3. **Édition profil** (photo, bio, username avec restriction 15 jours)
4. **Système de demandes d'abonnement** pour profils privés
5. **Scrollbar masquée** globalement pour look mobile natif
6. **Espacement carrousel** "Mes looks" corrigé
7. **Positionnement navbar et FAB** ajustés

### Fichiers modifiés/créés :
- `frontend/src/pages/EditProfile.jsx` (nouveau)
- `frontend/src/pages/Discover.jsx` (nouveau)
- `frontend/src/pages/Home.jsx` (carrousel spacing)
- `frontend/src/pages/Search.jsx` (follow status)
- `frontend/src/pages/Notifications.jsx` (demandes d'abonnement)
- `frontend/src/pages/Settings.jsx` (dark mode, profil privé)
- `frontend/src/components/Layout.jsx` (navbar/FAB position)
- `frontend/src/api/client.js` (nouveaux endpoints)
- `frontend/src/index.css` (dark mode, scrollbar hide)
- `backend/app/api/endpoints/users.py` (follow requests)
- `backend/app/api/endpoints/auth.py` (profile update)
- `backend/app/models/user.py` (Follow.status, username_changed_at)

---

## Rappels pour prochaine session

**Si l'app est sur l'App Store :**
- Créer l'endpoint `/admin/stats` pour voir nb utilisateurs, looks, croisements
- Vérifier les crashs sur App Store Connect
- Lire les premiers avis

**Si pas encore lancé :**
- Vérifier où en est le compte Apple Developer
- Supprimer DEMO_MODE quand prêt
- Faire le build TestFlight

---

*Dernière mise à jour : 8 février 2026*
