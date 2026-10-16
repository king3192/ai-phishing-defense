# 🛡️ AI Phishing Defense Platform (Full Version)

A production-grade, full-stack cybersecurity web application powered by Machine Learning and Natural Language Processing to detect, explain, and mitigate phishing threats across **URLs**, **raw emails**, **SMS/WhatsApp messages**, and **QR code payloads**.

---

## 🌟 Comprehensive Feature Set

### 1. Multi-Vector Threat Scanners (All 4 Live)
- **URL Scanner**: Lexical feature extractor, suspicious top-level domain (TLD) analysis, IP-address detection, brand spoofing heuristics, and Scikit-Learn Random Forest classifier.
- **Email Scanner**: TF-IDF NLP vectorizer with Logistic Regression text classifier for detecting urgency triggers and financial impersonation.
- **SMS & WhatsApp Scanner**: Social engineering detection for cashback scams, fake OTP requests, and mobile payment lures.
- **QR Code Scanner**: Dual input support (**file upload** & **live browser camera capture**), payload matrix decoding, and automatic routing into URL/text analysis pipelines.

### 2. AI Threat Intelligence
- **Tri-Verdict Engine**: Classified as `Safe`, `Suspicious`, or `Phishing`.
- **Numerical Threat Score (0–100)**: Visual radial threat gauge with animated SVG fill and severity coloring (Crimson, Amber, Emerald).
- **Multi-Class Scam Classification**: Banking, UPI/Payment, OTP, Job, Delivery, Investment, Social Media, Fake KYC, Prize/Lottery, and Other/Unclassified.
- **Explainability Signal Panel**: Transparent itemization of specific heuristics and model triggers behind every verdict.

### 3. Contextual "What Should I Do?" Action Plan Engine
- **Branching Incident Playbooks**: Context-aware guidance dynamically adapted to user interaction levels:
  - *Haven't interacted*: Block sender, delete message, isolate link.
  - *Clicked, no credentials*: Close browser tab, clear cache and cookies, run security scan.
  - *Entered sensitive credentials*: Freeze card/UPI handle, notify bank fraud division, change master passwords, enable 2FA.
- **Category Add-ons**: Targeted reporting advice for cyber crime portals (`cybercrime.gov.in`), telecom spam reporting, and regulator verification (SEBI/RBI).
- **Interactive Checklists**: Save completion progress in the database; completing actions boosts personal security score.

### 4. Personal Security Command Dashboard
- **Executive Metrics**: Total Scans, Safe Count, Phishing Flagged, and Personal Risk Level (`Low`, `Medium`, `High`).
- **Gamified Security Awareness Score**: 0–100 dynamic trust rating.
- **7-Day Activity Trends**: Interactive Recharts visualization tracking safe vs. flagged scans.
- **Live Flagged Threats Feed**: Real-time recent threat cards with one-click audit drilldown.

### 5. Real-Time Alerts & Notification Center
- **In-App Notification Center**: Real-time bell drawer with badge counter in the top navigation bar.
- **Interactive Management**: Mark individual alerts as read, or mark all as read.
- **Notification Preferences**: Toggle email notification dispatches in user settings.

### 6. Historical Audit Trail & Enterprise Reporting
- **Audit Log Table**: Searchable, filterable by vector type and verdict, with full inspection modal.
- **CSV Export**: Detailed spreadsheet audit trail with detected signals and timestamps.
- **Official PDF Export**: Professional report generated via ReportLab with executive headers, metadata box, color-coded verdict rows, and confidentiality disclaimer. Single-scan and date-range exports supported.

### 7. Administration Portal (`/admin`)
- **Multi-Tenant Metrics**: Platform-wide user accounts, global scan totals, and scam category distribution charts.
- **User Management**: View registered security agents, security scores, and activity counts.
- **Security Tips Knowledgebase**: Interactive CRUD interface for adding and removing awareness tips.

### 8. Data & Privacy "Danger Zone" — Reset All Data
- **Dedicated Entry Point**: Exclusively located at the bottom of the Profile page (`/profile`).
- **Atomic Single-Transaction Purge**: Protected `DELETE /api/v1/users/me/data` endpoint verifies account password and empties user scans, action-plan progress, notifications, and generated reports inside a single database transaction.
- **Confirmation Modal**: Requires typing `RESET` and re-entering account password. Includes shortcuts to download a data backup (CSV/PDF) prior to deletion.
- **Account Preservation**: User account, credentials, and session remain intact; Dashboard and History reset to clean empty states.
- **Rate-Limited & Multi-Tenant Scoped**: Strictly isolated to authenticated user ID.

---

## 📁 Repository Structure

```
ai-phishing-defense/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Auth, Users (Reset Data), Scans, Dashboard, Notifications, Tips, Reports, Admin
│   │   ├── core/            # Config, Database (SQLite/MySQL support), JWT Security
│   │   ├── models/          # User, Scan, ActionPlanProgress, Notification, Report, SecurityTip
│   │   ├── schemas/         # Pydantic Schemas & DTOs
│   │   └── services/        # ML Service, Feature Extractor, QR Decoder, Action Engine
│   ├── main.py              # FastAPI application entrypoint
│   ├── requirements.txt     # Python backend dependencies
│   ├── test_full_suite.py   # Comprehensive 11-flow automated test suite
│   ├── phishing_defense.db  # SQLite database
│   └── .env                 # Backend environment configuration
├── ml_model/
│   ├── generate_dataset.py  # Dataset generator for 10 scam types + safe samples
│   ├── train_models.py      # Scikit-Learn training script & model persistence
│   ├── text_dataset.csv     # Synthetic text training data
│   ├── url_dataset.csv      # Synthetic URL training data
│   ├── text_model.pkl       # Serialized NLP Logistic Regression classifier
│   ├── url_model.pkl        # Serialized Random Forest URL classifier
│   ├── tfidf_vectorizer.pkl # Serialized TF-IDF vectorizer
│   └── label_encoder.pkl    # Serialized LabelEncoder for scam categories
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Navbar, Sidebar, NotificationBell, ThreatGauge
│   │   │   ├── dashboard/   # StatsOverview, ThreatCharts, SecurityScoreWidget, RecentThreatsFeed
│   │   │   └── scanner/     # UrlScanner, TextScanner, QrScanner, ResultCard, ActionChecklist
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── pages/           # Login, Register, ForgotPassword, Dashboard, Scanner, History, Tips, Profile, Admin
│   │   └── services/        # Axios API client
│   ├── package.json
│   └── vite.config.js
├── run_backend.bat          # 1-click Windows backend launcher
├── run_frontend.bat         # 1-click Windows frontend launcher
└── README.md
```

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Python 3.10+** (Python 3.11 recommended)
- **Node.js 18+** and npm

---

### Step 1: Backend Setup & ML Models

```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv

# Windows (Command Prompt / PowerShell):
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# Install dependencies (FastAPI, Scikit-Learn, ReportLab, etc.)
pip install -r requirements.txt

# (Optional) Retrain ML models manually
python ../ml_model/train_models.py

# Launch FastAPI Backend Server
python main.py
```
- Swagger API Docs: **`http://localhost:8000/docs`**
- ReDoc API Docs: **`http://localhost:8000/redoc`**

---

### Step 2: Frontend Setup

In a separate terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- React Web App: **`http://localhost:5173`**

---

## 🔑 Default Credentials

- **Default Administrator Account**:
  - **Email**: `admin@phishguard.ai`
  - **Password**: `AdminPassword123!`
- **User Registration**:
  - Any new user can register via the `/register` page and select their role (`User` or `Admin`).

---

## 🧪 Automated End-to-End Verification

To verify all 11 flows in a single run against the application:

```bash
backend\venv\Scripts\python.exe backend\test_full_suite.py
```

### Verification Test Results (All 11 Flows Pass):
1. **Flow 1 — Register & Login**: JWT issuance, session persistence in `localStorage`, and profile read.
2. **Flow 2 — Core Scanners**: URL, Email, SMS/WhatsApp, and QR matrix decoding verified.
3. **Flow 3 — AI Threat Output**: Verdict (`Safe`/`Suspicious`/`Phishing`), Threat Score (0–100), Scam Category, and explainability signals verified.
4. **Flow 4 — Action Plan Checklist**: Toggling action items persists in `action_plan_progress` and updates user security score.
5. **Flow 5 — Dashboard Updates**: Scans count, safe count, phishing count, risk level, Recharts trend points, and recent threats verified.
6. **Flow 6 — Real-Time Alerts**: High-risk scan automatically triggers in-app notification; unread count badge, read state, and read-all verified.
7. **Flow 7 — History Audit Log**: Filter by vector, filter by verdict, search payload text, and detail modal inspection verified.
8. **Flow 8 — Reports Export**: Streamed CSV audit log and binary branded PDF generation verified.
9. **Flow 9 — Admin Portal**: `/admin` stats, platform scam breakdown, user account lists, and security tip CRUD verified.
10. **Flow 10 — Danger Zone (Reset All Data)**: Modal confirmation, `RESET` string validation, and password checks verified; wrong password rejected (400), correct password atomically purges user scans, action progress, alerts, and reports, resets dashboard and security score to baseline, preserves user account/login, and leaves other users' data untouched.
11. **Flow 11 — Protected Routes**: Unauthenticated requests to protected endpoints properly blocked with HTTP 401 Unauthorized.

---

## 🌐 Live Cloud Deployment (Production)

- **Live Web Application (Vercel)**: [https://ai-phishing-defense.vercel.app](https://ai-phishing-defense.vercel.app)
- **Live Backend API (Render)**: [https://ai-phishing-defense.onrender.com](https://ai-phishing-defense.onrender.com)
- **API Swagger Documentation**: [https://ai-phishing-defense.onrender.com/docs](https://ai-phishing-defense.onrender.com/docs)
- **Database Engine**: TiDB Cloud Serverless MySQL (Managed & Auto-Scaling)
- **Full Deployment Documentation**: Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for environment specs and CI/CD redeployment steps.

---

## 📱 Stage 2: Native Android Mobile App (WebView Wrapper)

The `/android` directory contains a complete native Android Studio Kotlin project wrapping the live platform with zero UI compromises:

- **Directory**: [`android/`](./android)
- **Application ID**: `com.phishguard.ai`
- **Target SDK**: Android 15 (API 35), Min SDK: Android 7.0 (API 24)
- **Core Capabilities**:
  - Full-screen immersion with edge-to-edge system insets (notches & gesture navigation).
  - Secure sandboxed navigation (`UrlPolicy`): phishing URLs are quarantined from the app context and open only in external browsers.
  - Live QR code scanning via camera (`getUserMedia` + runtime permission bridge).
  - File picker for image attachments, documents (CSV/PDF), and QR gallery uploads.
  - Native PDF & CSV downloads via `DownloadManager` and client-side `blob:` MediaStore bridge.
  - Share Target Intent: Long-press any message in WhatsApp or SMS and tap **Share → PhishGuard AI** to prefill scanners.
  - Custom offline screen with automated connection recovery.
  - Isolated Firebase Cloud Messaging (FCM) push notification infrastructure.
- **Full Mobile Guide**: See [`android/README.md`](./android/README.md) for keystore generation, release builds, and testing.
