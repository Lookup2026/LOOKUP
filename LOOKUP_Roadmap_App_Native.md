# LOOKUP — Roadmap vers l'App Native

## Vision du produit

**LOOKUP** permet de retrouver les tenues des gens que tu croises dans la rue.

**Scénario type :**
Tu marches dans la rue, tu vois quelqu'un avec une belle veste. Tu ouvres LOOKUP. Si cette personne a l'app et a publié son look, tu retrouves sa tenue complète (marques, références, liens d'achat).

**Problème actuel :** Le GPS ne fonctionne que quand l'app est ouverte (limitation du navigateur web). En vrai, personne ne se balade avec l'app ouverte.

**Solution :** Passer en app native (iOS/Android) avec tracking GPS en arrière-plan via Capacitor.

---

## Phase 1 — Préparation (Jour 1-2)

### 1.1 Installer Xcode
- Télécharger Xcode depuis le Mac App Store (~15 Go)
- Installer les Command Line Tools : `xcode-select --install`
- Accepter la licence : `sudo xcodebuild -license accept`

### 1.2 Installer Capacitor dans le projet
- Ajouter Capacitor au projet frontend React/Vite existant
- Configurer le fichier `capacitor.config.ts` (nom, bundle ID, serveur API)
- Bundle ID recommandé : `com.lookup.app`

### 1.3 Installer les plugins natifs
- **@capacitor/geolocation** : GPS natif (plus précis que le navigateur)
- **@capacitor-community/background-geolocation** : GPS en arrière-plan (le plugin clé)
- **@capacitor/app** : gestion du cycle de vie de l'app
- **@capacitor/status-bar** : personnalisation de la barre de statut iOS
- **@capacitor/splash-screen** : écran de lancement

---

## Phase 2 — GPS en arrière-plan (Jour 3-5)

### 2.1 Configurer le plugin Background Geolocation
- Le plugin envoie la position au serveur même quand l'app est fermée ou le téléphone verrouillé
- Configuration : intervalle entre les pings, précision GPS, distance minimum entre deux pings
- Paramètres recommandés pour LOOKUP :
  - Intervalle : 30 secondes
  - Distance minimum : 20 mètres (éviter les pings inutiles quand on est immobile)
  - Précision : haute (GPS + WiFi)

### 2.2 Modifier le frontend
- Remplacer le `navigator.geolocation` du navigateur par le plugin Capacitor natif
- Démarrer le tracking au lancement de l'app (une seule fois)
- Le tracking continue en arrière-plan automatiquement
- Ajouter un bouton ON/OFF pour que l'utilisateur contrôle sa visibilité

### 2.3 Modifier le backend
- Le serveur reçoit les pings GPS comme avant (rien ne change côté API)
- Optimiser la détection de croisements pour gérer plus de pings (les utilisateurs enverront des pings en continu)
- Ajouter un nettoyage automatique des vieux pings (> 24h) pour ne pas surcharger la base

---

## Phase 3 — Adaptation iOS (Jour 6-8)

### 3.1 Permissions iOS obligatoires
Configurer dans `Info.plist` :
- **NSLocationAlwaysAndWhenInUseUsageDescription** : "LOOKUP utilise ta position pour détecter les personnes que tu croises et te montrer leurs looks."
- **NSLocationWhenInUseUsageDescription** : "LOOKUP a besoin de ta position pour fonctionner."
- **UIBackgroundModes** : `location` (autoriser le GPS en fond)

### 3.2 Adapter l'interface pour iOS natif
- Safe areas (encoche iPhone)
- Gestes de navigation iOS (swipe back)
- Haptic feedback sur les interactions
- Clavier natif (push du contenu)
- Pull-to-refresh natif (déjà en place)

### 3.3 Gérer le cycle de vie de l'app
- App passe en arrière-plan → le GPS continue
- App revient au premier plan → rafraîchir les croisements
- App complètement fermée → le GPS continue grâce au plugin natif

---

## Phase 4 — Tests sur vrai iPhone (Jour 9-12)

### 4.1 Compte Apple Developer
- Créer un compte sur developer.apple.com (99€/an)
- Configurer les certificats de développement
- Enregistrer ton iPhone comme appareil de test

### 4.2 Tests à réaliser
- [ ] GPS en arrière-plan fonctionne (app fermée, téléphone verrouillé)
- [ ] Les croisements sont détectés entre deux téléphones
- [ ] Les photos de looks s'affichent correctement
- [ ] La batterie n'est pas trop impactée (objectif : < 10% par jour)
- [ ] L'app fonctionne sans connexion temporaire (mode offline)
- [ ] L'app se relance correctement après un redémarrage du téléphone

### 4.3 Optimisation batterie
- Réduire la fréquence des pings quand l'utilisateur est immobile
- Utiliser le mode "significant location changes" d'iOS quand c'est suffisant
- Stopper le GPS quand l'utilisateur désactive sa visibilité

---

## Phase 5 — Préparation App Store (Jour 13-16)

### 5.1 Assets graphiques à créer
- Icône de l'app : 1024 x 1024 px (PNG, sans transparence)
- Screenshots iPhone 6.7" (1290 x 2796 px) — minimum 3, recommandé 5
- Screenshots iPhone 6.5" (1242 x 2688 px)
- Screenshots iPhone 5.5" (1242 x 2208 px)
- Écran de lancement (splash screen)

### 5.2 Fiche App Store Connect
- **Nom** : LOOKUP
- **Sous-titre** : Retrouve les looks que tu croises
- **Description** : Texte de présentation (~300 mots)
- **Catégorie** : Lifestyle ou Shopping
- **Mots-clés** : mode, streetwear, look, tenue, croisement, style, outfit
- **Classification d'âge** : 12+ (contenu utilisateur)
- **Prix** : Gratuit

### 5.3 Pages légales obligatoires
- **Politique de confidentialité** (page web) — obligatoire car tu collectes :
  - Email
  - Localisation GPS
  - Photos
  - Données de profil
- **Conditions d'utilisation** (page web)
- **Déclaration de confidentialité Apple** (formulaire dans App Store Connect)
  - Données collectées : localisation, photos, identifiants, email
  - Utilisation : fonctionnalité de l'app
  - Données liées à l'utilisateur : oui

---

## Phase 6 — Soumission Apple Review (Jour 17-20)

### 6.1 Build et signature
- Générer le build de production dans Xcode
- Signer avec le certificat de distribution
- Uploader via Xcode ou Transporter

### 6.2 Points de vigilance pour la review Apple
Apple est strict. Voici ce qui peut causer un rejet :

| Risque | Solution |
|--------|----------|
| GPS en arrière-plan sans justification claire | Message explicite à l'utilisateur + description dans la fiche |
| Contenu généré par utilisateurs (photos) | Système de signalement (déjà en place) |
| Pas de "Sign in with Apple" | Ajouter le login Apple si tu proposes un login email |
| Pas de politique de confidentialité | Créer une page web avant la soumission |
| Pas de suppression de compte | Déjà en place |
| App trop basique / "web wrapper" | L'app doit avoir des fonctionnalités natives (GPS background, caméra) |

### 6.3 Processus de review
- Délai moyen : 24-48h
- Si rejet : Apple donne la raison, on corrige, on resoumet
- Prévoir 2-3 allers-retours avant approbation
- Une fois approuvée : publication immédiate ou date programmée

---

## Phase 7 — Android (Optionnel, après iOS)

Capacitor génère aussi un projet Android. Les étapes supplémentaires :
- Installer Android Studio
- Configurer le projet Android
- Créer un compte Google Play Developer (25$ une fois)
- Générer un APK/AAB signé
- Soumettre sur Google Play (review plus rapide qu'Apple)

---

## Récapitulatif des coûts

| Élément | Coût |
|---------|------|
| Compte Apple Developer | 99€/an |
| Compte Google Play (optionnel) | 25€ (une fois) |
| Capacitor + plugins | Gratuit (open source) |
| Xcode | Gratuit |
| Backend (Render) | Offre gratuite ou ~7$/mois |
| Base de données (Supabase) | Offre gratuite ou ~25$/mois |
| **Total minimum** | **99€** |

---

## Récapitulatif du planning

| Phase | Durée estimée | Prérequis |
|-------|---------------|-----------|
| 1. Préparation | 2 jours | Xcode installé |
| 2. GPS arrière-plan | 3 jours | Phase 1 |
| 3. Adaptation iOS | 3 jours | Phase 2 |
| 4. Tests iPhone | 4 jours | Compte Apple Dev (99€) |
| 5. Préparation App Store | 4 jours | Assets + pages légales |
| 6. Soumission Apple | 3-5 jours | Phases 1-5 terminées |
| 7. Android (optionnel) | 5 jours | Android Studio |

---

## Prochaine action

1. Installer Xcode (15 Go — lancer le téléchargement maintenant)
2. On installe Capacitor ensemble dans le projet
3. On configure le GPS en arrière-plan
4. On teste

**Tout le développement se fait ensemble. Pas besoin de développeur externe.**
