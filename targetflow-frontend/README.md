# TargetFlow Frontend

Interface React connectée au backend Django de TargetFlow.

---

## Stack technique

- **React 18** + **Vite 5**
- **React Router v6** — navigation & routes protégées
- **Recharts** — graphiques dashboard
- **JWT** — stocké en `sessionStorage`

---

## Structure du projet

```
src/
├── api/
│   └── client.js          # Client API — appels vers le backend
├── components/
│   └── Layout.jsx          # Sidebar + navigation partagée
├── pages/
│   ├── LoginPage.jsx       # POST /auth/login/
│   ├── RegisterPage.jsx    # POST /auth/register/
│   ├── HomePage.jsx        # Sélection du mode
│   ├── ExpertModePage.jsx  # POST /analysis/upload/
│   ├── StartupModePage.jsx # POST /ai/startup/
│   ├── DashboardPage.jsx   # GET /analysis/dashboard/
│   └── InsightsPage.jsx    # GET /analysis/insights/
├── App.jsx                 # Routes + PrivateRoute
├── main.jsx
└── index.css
```

---

## Installation & lancement

### 1. Démarrer le backend Django

```bash
cd myproject
pip install -r requirements.txt   # ou pipenv install
python manage.py migrate
python manage.py runserver         # → http://localhost:8000
```

### 2. Démarrer le frontend

```bash
cd targetflow-frontend
npm install
npm run dev                        # → http://localhost:5173
```

> Le proxy Vite redirige `/auth`, `/analysis`, `/ai` → `http://localhost:8000`
> **Aucune modification CORS nécessaire en développement.**

---

## Routes frontend

| Route        | Page              | Endpoint backend         |
|--------------|-------------------|--------------------------|
| `/login`     | Connexion         | `POST /auth/login/`      |
| `/register`  | Inscription       | `POST /auth/register/`   |
| `/`          | Accueil           | —                        |
| `/expert`    | Mode Expert       | `POST /analysis/upload/` |
| `/startup`   | Mode Startup AI   | `POST /ai/startup/`      |
| `/dashboard` | Dashboard KPIs    | `GET /analysis/dashboard/` |
| `/insights`  | Insights & Campagnes | `GET /analysis/insights/` |

---

## Format CSV attendu (Mode Expert)

```csv
customer_id,order_date,amount
1,2024-01-15,250
2,2024-02-10,480
...
```

---

## Déploiement production

```bash
npm run build
# → génère dist/ à servir avec Nginx ou tout autre serveur statique
```

En production, configurer CORS dans Django (`django-cors-headers`) :

```python
# settings.py
CORS_ALLOWED_ORIGINS = ["https://votre-domaine.com"]
```
