# FixNearby Production Quality Assurance Checklist

## 1. FUNCTIONAL REQUIREMENTS
- [x] **User Registration:** Customer & technician accounts created with password hashing.
- [x] **User Login & JWT:** Secure bearer token generation, localStorage persistence, and `/auth/me` profile recovery.
- [x] **Service Categories:** 4 core emergency trades (Electrical ⚡, Plumbing 💧, Automotive 🚗, Locksmith 🔐).
- [x] **Problem Triage Types:** Detailed problem taxonomy with dedicated safety instructions.
- [x] **Technician Discovery:** Filterable by radius, rating, on-duty status, and trade category.
- [x] **PostGIS Spatial Engine:** Spatial GIST indexed queries (`ST_DWithin`, `ST_Distance`) with seamless Haversine fallback.
- [x] **4-Point Badge Verification:** Strict validation of ID, Trade License, Address/Police clearance, and Rating.
- [x] **Audit Failure Transparency:** Failed or incomplete verification checks display explicit failure reasons.
- [x] **Emergency SOS Request Workflow:** 5-step triage with immediate crisis warnings.
- [x] **Technician Assignment:** Instant dispatch pairing closest candidate with customer.
- [x] **Live GPS Tracking:** Leaflet dark OpenStreetMap with user, technician, and OSRM route polyline.
- [x] **Socket.IO Real-time Events:** `technician_location_update`, `status_changed`, `eta_update`.
- [x] **Route Movement Simulator:** Smooth interpolation along waypoints isolated in `tracking_simulator.py`.
- [x] **Direct Phone Communication:** `tel:+91XXXXXXXXXX` direct dialer links.
- [x] **Automated WhatsApp Links:** Formatted incident details with OpenStreetMap location coordinates.
- [x] **Customer Review & Rating:** 1–5 star reviews with dynamic recalculation of technician ratings.
- [x] **Provider Portal:** Duty toggle (ONLINE/OFFLINE), location heartbeat, and dispatch accept/decline.
- [x] **Admin Dashboard:** High-level metrics for active requests, on-duty technicians, and audit status.
- [x] **PWA & Offline Resilience:** Service Worker, Web Manifest, maskable icons, and `offline.html` fallback.
- [x] **Offline Safety Guides:** 5 dedicated emergency crisis guides cached for offline availability.

---

## 2. VISUAL DESIGN & ACCESSIBILITY
- [x] **Obsidian Dark Theme:** Global CSS variables (`--bg-base: #121212`, `--surface-1: #1A1A1A`, etc.).
- [x] **Fluorescent Aqua Highlights:** Accents, borders, and active indicators (`--accent-aqua: #00F0FF`).
- [x] **Red Emergency Actions:** High-urgency action buttons, danger warnings, and SOS button (`--alert-red: #FF3333`).
- [x] **Antique-White Typography:** High readability text (`--text-primary: #FAEBD7`).
- [x] **Font & Sizing:** Inter font family with body text minimum 16px and large headlines (32–56px).
- [x] **Touch Target Standards:** Buttons and touch cards maintain a minimum 48px height.
- [x] **Visual Imagery:** SVG emergency illustrations, trade visuals, and 16 technician portraits.
- [x] **Leaflet Dark Map Staging:** High-contrast tiles styled using CSS filters.
- [x] **State Feedback:** Skeletons, spinners, empty states, and toast notifications.
- [x] **Mobile Responsiveness:** Tested and verified from 320px mobile to 1920px desktop without horizontal overflow.
- [x] **Accessible Focus & Motion:** Visible focus rings and `prefers-reduced-motion` support.

---

## 3. SECURITY & PERFORMANCE
- [x] **Password Protection:** Irreversible bcrypt hashing with unique salt generation.
- [x] **JWT Token Security:** Role-based access control decorators (`customer`, `technician`, `admin`).
- [x] **Input Validation:** Marshmallow schemas and regex format validation for badge codes.
- [x] **Rate Limiting:** Flask-Limiter protecting sensitive endpoints (e.g. `/verify/<badge_code>`).
- [x] **CORS Origin Guard:** Origin verification restricting cross-origin requests.
- [x] **Sensitive Credential Shield:** Legal documents and private police records are never exposed over public APIs.
- [x] **Code Splitting:** React.lazy dynamic imports for lightweight initial bundle delivery.
- [x] **Zero Commission:** Peer-to-peer cash and UPI direct transaction model.

