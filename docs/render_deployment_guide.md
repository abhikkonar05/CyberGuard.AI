# Render Deployment Guide: Cyber Attack Detection System

This guide outlines how to deploy the **Django REST API** (Web Service) and **React Frontend** (Static Site) on [Render](https://render.com) using the zero-database architecture.

---

## 1. Architecture On Render

```text
┌────────────────────────────┐          HTTPS REST          ┌───────────────────────────┐
│       Render Static Site   │ ───────────────────────────> │     Render Web Service    │
│  (React 18 + Vite Frontend)│                              │   (Django REST Framework) │
│ cyberguard-frontend...app  │                              │ cyberguard-backend...app  │
└────────────────────────────┘                              └───────────────────────────┘
                                                                         │
                                                                         ▼
                                                            ┌───────────────────────────┐
                                                            │ Local File-Based Storage  │
                                                            │  predictions.jsonl & CSV  │
                                                            │  Preloaded Model in RAM   │
                                                            └───────────────────────────┘
```

- **Zero Database Required**: No Postgres or MySQL add-on needed ($0/month database cost).
- **Sub-Second Latency**: Model is preloaded once when Gunicorn boots up; predictions execute in ~20ms.

---

## 2. Option A: One-Click Deploy via Render Blueprint (`render.yaml`)

1. Push your repository to **GitHub**:
   ```powershell
   git add .
   git commit -m "feat: complete cyber attack detection system"
   git push origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** &rarr; **Blueprint**.
4. Connect your GitHub repository.
5. Render detects `render.yaml` automatically and configures:
   - `cyberguard-backend` (Web Service)
   - `cyberguard-frontend` (Static Site)
6. Click **Apply**.

---

## 3. Option B: Manual Service Setup on Render

### Step 1: Deploy Django Backend (Web Service)
1. In Render Dashboard, click **New +** &rarr; **Web Service**.
2. Connect your GitHub repo.
3. Configure the settings:
   - **Name**: `cyberguard-backend`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120
     ```
4. Add Environment Variables:
   | Key | Value |
   | :--- | :--- |
   | `DEBUG` | `False` |
   | `DJANGO_SECRET_KEY` | *(Generate a 50+ character random string)* |
   | `ALLOWED_HOSTS` | `localhost,127.0.0.1,0.0.0.0,*.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,https://<your-frontend-subdomain>.onrender.com` |
   | `PYTHON_VERSION` | `3.11.9` |
5. In **Advanced**, set **Health Check Path** to:
   `/api/health/`
6. Click **Create Web Service**.

### Step 2: Deploy React Frontend (Static Site)
1. In Render Dashboard, click **New +** &rarr; **Static Site**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `cyberguard-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. In **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://cyberguard-backend.onrender.com/api`
6. Click **Create Static Site**.

---

## 4. Testing Deployed APIs

Once deployed, test your live backend via `curl` or browser:

```bash
# 1. Health Check
curl https://cyberguard-backend.onrender.com/api/health/

# 2. Model Specs
curl https://cyberguard-backend.onrender.com/api/model/info/

# 3. Manual Prediction Test
curl -X POST https://cyberguard-backend.onrender.com/api/predict/manual/ \
  -H "Content-Type: application/json" \
  -d '{"DstPort": 80, "Protocol": 6, "FlowDuration": 2840, "TotFwdPkts": 85, "TotBwdPkts": 0, "TotLenFwdPkts": 24500}'
```

---

## 5. Troubleshooting & FAQ

- **Render Ephemeral Disk**: By default, Render Web Service files reset when a new deployment is triggered. Since the project uses file-based JSONL/CSV storage, historical logs are stored safely during the container's lifecycle. If permanent multi-month persistence across redeploys is required, you can attach a **Render Persistent Disk** mounted at `/app/backend/data/predictions`.
- **CORS Errors**: If frontend requests are blocked, ensure `CORS_ALLOWED_ORIGINS` on the backend matches the exact URL of your frontend (e.g. `https://cyberguard-frontend.onrender.com` without trailing slash).

