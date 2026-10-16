# 🚀 PhishGuard AI — Production Deployment Summary

This document outlines the live production architecture, URLs, environment variable specifications, redeployment workflows, and hosting tier notes for the **AI Phishing Defense Platform**.

---

## 🌐 Live Service Endpoints

| Component | Provider | Live URL | Status |
|---|---|---|---|
| **Frontend (React/Vite)** | **Vercel** | [https://ai-phishing-defense.vercel.app](https://ai-phishing-defense.vercel.app) | 🟢 Active (CDN, Global SSL) |
| **Backend (FastAPI)** | **Render** | [https://ai-phishing-defense.onrender.com](https://ai-phishing-defense.onrender.com) | 🟢 Active (Uvicorn, Python 3) |
| **Database (MySQL)** | **TiDB Cloud Serverless** | `gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000` | 🟢 Active (Managed MySQL) |
| **API Documentation** | **Render / Swagger** | [https://ai-phishing-defense.onrender.com/docs](https://ai-phishing-defense.onrender.com/docs) | 🟢 Active |
| **Health Check** | **Render** | [https://ai-phishing-defense.onrender.com/health](https://ai-phishing-defense.onrender.com/health) | 🟢 Active (`healthy`) |

---

## 🔐 Environment Variables Specification

> **Security Note:** Secrets must never be committed to git. All credentials are provided exclusively through cloud provider dashboards.

### Backend (Render Web Service)
- `DATABASE_URL`: Connection string to TiDB Cloud Serverless (`mysql+pymysql://<user>:<password>@<host>:4000/test?ssl_verify_cert=true`).
- `JWT_SECRET`: Random 256-bit cryptographic secret for signing JSON Web Tokens.
- `CORS_ORIGINS`: Allowed origins, e.g. `https://ai-phishing-defense.vercel.app,http://localhost:5173,http://10.0.2.2:5173`.
- `ENVIRONMENT`: Set to `production`.
- `PORT`: Automatically assigned by Render (default: `10000`).
- `ADMIN_EMAIL`: Seeded administrator email (`admin@phishguard.ai`).
- `ADMIN_PASSWORD`: Default administrator password (`AdminPassword123!`).

### Frontend (Vercel)
- `VITE_API_BASE_URL`: Public HTTPS URL of the backend API (`https://ai-phishing-defense.onrender.com`).

---

## 🔄 How to Redeploy After Code Changes

Both **Render** and **Vercel** are connected to the `main` branch of [https://github.com/king3192/ai-phishing-defense](https://github.com/king3192/ai-phishing-defense).

Whenever you push a change to GitHub:
```bash
git add .
git commit -m "feat: your update message"
git push origin main
```
1. **Frontend**: Vercel automatically detects the push, builds `frontend`, and updates the live site in ~30 seconds with zero downtime.
2. **Backend**: Render automatically pulls the latest commit, runs `pip install -r backend/requirements.txt`, and redeploys the service.

---

## ⏳ Free-Tier Characteristics & Tips

1. **Backend Cold Starts (Render Free Tier):**
   - Free instances spin down after 15 minutes of inactivity.
   - When a request arrives while sleeping, the backend takes ~30–50 seconds to boot.
   - **Built-in Handling:** The frontend has a friendly `ServerWakeBanner` and automatic 3-retry exponential backoff to handle cold starts gracefully.
   - **Tip to eliminate delay:** Use an external free uptime monitor (e.g., [cron-job.org](https://cron-job.org) or UptimeRobot) to ping `https://ai-phishing-defense.onrender.com/health` every 10 minutes, keeping it awake.

2. **TiDB Cloud Serverless (MySQL):**
   - 5 GiB row storage and 50 million Request Units free monthly (more than enough for personal, prototype, and mobile app usage).
   - The connection pool includes `pool_pre_ping=True` and `pool_recycle=300` to prevent dropped connections.

3. **Vercel Frontend:**
   - 100 GB bandwidth / month, unlimited static requests, instant Edge CDN caching, automatic HTTPS certificates.
