# FIXNEARBY — Emergency-First Hyper-Local Service Marketplace

> **Emergency Repair Help. Nearby. Verified. Fast.**

FixNearby is a production-quality, crisis-optimized Progressive Web Application (PWA) and geospatial service marketplace designed for citizens who need immediate assistance with:

1. **⚡ Electrical Emergencies** (Short circuits, sparking panels, MCB trips, power failures)
2. **💧 Plumbing Emergencies** (Burst pipelines, severe flooding leakages, tank overflows)
3. **🚗 Automotive Breakdowns** (Dead battery jumpstarts, highway flat tyres, towing)
4. **🔐 Locksmith Emergencies** (Home/apartment lockouts, broken keys, jammed locks)

Built with an obsidian high-contrast design system, real-time OpenStreetMap tracking, OSRM routing, PostGIS spatial queries, and a strict 4-point technician credential verification audit.

---

## 1. System Architecture

```
                    FIXNEARBY PWA
                         |
                         |
             React 18 + Vite Frontend
       (Leaflet, Socket.IO Client, Service Worker)
                         |
              REST API + Socket.IO
                         |
                  Flask 3 Backend
         (Flask Blueprints, Flask-JWT, Limiter)
                         |
           Service Layer & Dispatch Engine
        (GeoService, Verification, OSRM Client)
                         |
              SQLAlchemy + GeoAlchemy2
                         |
                PostgreSQL + PostGIS
         (GIST Spatial Indexes, Geography Points)
                         |
        --------------------------------
        |                              |
 OpenStreetMap                       OSRM
 Map Tiles                           Routing
```

---

## 2. Technology Stack

### Frontend
* **React 18** with functional components and modern React hooks
* **Vite** for fast HMR and optimized production bundles
* **React Router v6** with `React.lazy` code splitting
* **Leaflet 1.9.4 & react-leaflet** for interactive dark maps
* **OpenStreetMap** raster tiles and **OSRM** public routing API
* **Socket.io-client** for real-time telemetry updates
* **Plain CSS** using CSS variables (Obsidian Dark Theme, WCAG AA accessible)
* **PWA Service Worker** with offline fallback and asset precaching

### Backend
* **Python 3.11+**
* **Flask** with modular Blueprints
* **Flask-SocketIO** for real-time tracking events
* **Flask-JWT-Extended** and **bcrypt** for secure authentication
* **SQLAlchemy** & **Flask-Migrate (Alembic)**
* **GeoAlchemy2** & **psycopg2-binary**
* **Marshmallow** for schema validation
* **Flask-Limiter** for API rate limiting

### Database & Spatial
* **PostgreSQL 15+** with **PostGIS** extension
* Spatial column: `current_location GEOGRAPHY(Point, 4326)`
* Spatial GIST indexes with `ST_DWithin` and `ST_Distance` queries
* Automatic Haversine fallback for lightweight offline development

---

## 3. Getting Started & Installation

### Prerequisites
* **Python 3.11+**
* **Node.js 18+** & **npm**
* **PostgreSQL 15+** with PostGIS (Optional for basic dev; built-in SQLite/Haversine fallback enabled)

---

### Windows (PowerShell) Setup

#### Step 1: Clone and Prepare Environment
```powershell
# Open Windows PowerShell in project root
cd "FIXNEARBY(mp)"

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
.venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt
```

#### Step 2: Configure Environment Variables
```powershell
# Copy backend environment config
Copy-Item backend\.env.example backend\.env

# Copy frontend environment config
Copy-Item frontend\.env.example frontend\.env
```

#### Step 3: Database Migration & Seed Data
```powershell
# Run the database seeder (Creates categories, problem types, and 16 Kolhapur technicians)
python backend/seed.py
```

#### Step 4: Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

---

### Linux / macOS Setup

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend requirements
pip install -r backend/requirements.txt

# Setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Seed the database
python backend/seed.py

# Install frontend
cd frontend
npm install
cd ..
```

---

## 4. Running the Application

### 1. Start the Flask Backend & Socket.IO Server
```powershell
# In terminal 1 (with .venv activated):
python backend/run.py
```
*Backend runs on:* `http://localhost:5000` (API: `http://localhost:5000/api/v1`)

### 2. Start the React Frontend Dev Server
```powershell
# In terminal 2:
cd frontend
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 5. Seed Data & Demo Accounts

The database seed script populates 16 realistic technicians located across Kolhapur, Maharashtra (Shahupuri, Rajarampuri, Tarabai Park, Udyam Nagar, Rankala, etc.):

### Demo Accounts:
* **Admin Account:**
  * Email: `admin@fixnearby.local`
  * Password: `AdminPass@123`
* **Citizen / Customer Account:**
  * Email: `citizen@fixnearby.local`
  * Password: `CitizenPass@123`
* **Verified Technician (Electrical):**
  * Badge Code: **`FN-88492`**
  * Email: `rajesh.patil@fixnearby.local`
  * Password: `TechPass@123`
* **Unverified / Failing Audit Technician:**
  * Badge Code: **`FN-33211`** (Tests audit failure warning)
* **Sample Active Tracking Request ID:**
  * URL: `/tracking/req-live-kolhapur-001`

---

## 6. Testing

### Run Automated Backend Unit Tests:
```powershell
pytest backend/tests -v
```

Refer to `TESTING_GUIDE.md` for complete end-to-end testing procedures, GPS permission handling, offline PWA simulation, and Postman API collection usage.

---

## 7. Production Build & Deployment

### Build Frontend for Production:
```powershell
cd frontend
npm run build
```
The compiled, code-split production files are created in `frontend/dist/`.

### Run Backend with Production WSGI:
```bash
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 -b 0.0.0.0:5000 wsgi:app
```

---

## 8. License & Safety Disclaimer

FixNearby is engineered for emergency response and municipal resilience. In life-threatening emergencies involving active structural fires or medical trauma, always dial **112**, **101**, or **108** first.

