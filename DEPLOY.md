# Guide de déploiement LOOKUP

## 1. Supabase (Base de données)

1. Va sur https://supabase.com et connecte-toi avec GitHub
2. Clique "New Project"
3. Choisis un nom: `lookup-db`
4. Mot de passe: génère-en un fort et **note-le**
5. Région: choisir la plus proche (eu-west)
6. Clique "Create new project"

Une fois créé, va dans **Settings > Database** et copie:
- **Host**: `db.xxxx.supabase.co`
- **Database name**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: celui que tu as créé

L'URL de connexion sera:
```
postgresql://postgres:TON_MOT_DE_PASSE@db.xxxx.supabase.co:5432/postgres
```

---

## 2. GitHub (Code source)

1. Va sur https://github.com/new
2. Nom du repo: `lookup`
3. Public ou Private selon ton choix
4. Ne coche rien d'autre
5. Clique "Create repository"

Puis dans le terminal:
```bash
cd ~/Desktop/Developpement/LOOKUP
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/lookup.git
git push -u origin main
```

---

## 3. Render (Backend)

1. Va sur https://render.com et connecte-toi avec GitHub
2. Clique "New +" > "Web Service"
3. Connecte ton repo GitHub `lookup`
4. Configure:
   - **Name**: `lookup-api`
   - **Region**: Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Clique "Advanced" et ajoute les **Environment Variables**:
   ```
   DATABASE_URL = postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
   SECRET_KEY = une-longue-chaine-aleatoire-32-caracteres
   ```

6. Clique "Create Web Service"

Ton backend sera sur: `https://lookup-api.onrender.com`

---

## 4. Vercel (Frontend)

1. Va sur https://vercel.com et connecte-toi avec GitHub
2. Clique "Add New" > "Project"
3. Importe ton repo `lookup`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`

5. Ajoute une **Environment Variable**:
   ```
   VITE_API_URL = https://lookup-api.onrender.com
   ```

6. Clique "Deploy"

Ton frontend sera sur: `https://lookup-xxx.vercel.app`

---

## 5. Configurer le frontend pour la prod

Avant de push, modifier le fichier `frontend/src/api/client.js` pour utiliser l'URL de prod.
