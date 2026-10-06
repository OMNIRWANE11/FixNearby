# FixNearby Comprehensive Testing Guide

This guide details how to verify every layer of the FixNearby system — from automated backend unit test suites to end-to-end frontend emergency dispatch workflows.

---

## 1. Automated Backend Unit & API Testing

The backend includes test coverage for authentication, 4-point badge verification, emergency dispatch triage, and geospatial algorithms.

### Running Backend Tests
From the root or `backend/` directory:

```bash
# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Run pytest
pytest backend/tests -v
```

### Verified Test Suites:
1. `test_verification.py`:
   - Valid badge code check (`FN-88492` passes all 4 criteria)
   - Invalid format rejection (`XYZ123` returns 400 `INVALID_FORMAT`)
   - Non-existent badge rejection (`FN-99999` returns 404 `NOT_FOUND`)
   - Unverified failing badge (`FN-33211` flags expired license & missing police check)
   - Regex format validator tests
2. `test_auth.py`:
   - Customer and technician registration
   - Password hashing verification via bcrypt
   - JWT token generation and `/auth/me` protected endpoint access
3. `test_requests.py`:
   - Creation of emergency request with latitude/longitude
   - Proximity candidate query execution
   - Technician assignment and status transition
4. `test_geo.py`:
   - Haversine great-circle calculation between Kolhapur coordinates
   - Dynamic ETA calculation algorithm

---

## 2. End-to-End Functional Test Scenarios

### Test 1: Verified Badge Inspection (Pass Scenario)
1. Navigate to `/verify`.
2. Enter `FN-88492` or click the demo button.
3. Tap **VERIFY BADGE**.
4. **Expected Result:**
   - Large aqua shield banner: **VERIFIED TECHNICIAN**.
   - All 4 audit checks display **PASS ✓** with green/aqua borders.
   - Profile of Rajesh Patil (Senior Licensed Electrician) is rendered with direct phone and WhatsApp contact buttons.

### Test 2: Unverified Failing Badge Inspection (Fail Scenario)
1. Navigate to `/verify`.
2. Enter `FN-33211` and tap **VERIFY BADGE**.
3. **Expected Result:**
   - Red warning banner: **AUDIT NOT VERIFIED / FAILED**.
   - Check cards explicitly display **FAIL ✕** for Trade License & Police Check.
   - Clear failure notice explaining: *"Trade license expired; Police clearance certificate not submitted; Customer rating below 4.0 safety threshold"*.

### Test 3: Invalid Badge Format Error Handling
1. Enter `1234` or `INVALID` into badge input.
2. **Expected Result:**
   - Immediate validation error notifying user of format `FN-XXXXX`.
   - API returns structured 400 error.

### Test 4: Emergency SOS 5-Step Triage Workflow
1. Navigate to `/emergency` or tap the floating **SOS** button.
2. **Step 1:** Select **Electrical (⚡)**.
3. **Step 2:** Select **Short Circuit / Sparking**.
4. **Step 3:** Select **CRITICAL HAZARD** — note that immediate crisis instructions (*"Switch OFF the main distribution board switch immediately!"*) appear with high visual contrast.
5. **Step 4:** Tap **USE MY CURRENT GPS LOCATION** or adjust pin on the Leaflet map. Enter your name and phone number.
6. **Step 5:** Tap **FIND NEAREST TECHNICIANS NOW**.
7. **Expected Result:**
   - Immediate candidate list of verified Kolhapur technicians sorted by proximity.
   - Tap **SELECT TECHNICIAN & START LIVE TRACKING** to transition into `/tracking/:requestId`.

### Test 5: Live Tracking & Movement Simulation
1. On the `/tracking/:requestId` page:
2. **Expected Result:**
   - Leaflet map shows dark OpenStreetMap tiles, user marker (red), technician marker (aqua ⚡), and route polyline.
   - Tracking HUD updates ETA and remaining distance every 2.5 seconds via Socket.IO events.
   - Status automatically transitions from `ASSIGNED` → `ON_THE_WAY` → `ARRIVED`.
3. When marked `ARRIVED`, a toast notification alerts the citizen and the review button is enabled.

### Test 6: Direct Phone & WhatsApp Communication Links
1. On any technician card or tracking screen:
2. Tap **Call Direct** → opens `tel:+91XXXXXXXXXX`.
3. Tap **WhatsApp** → opens `https://wa.me/...` with pre-filled emergency details and OpenStreetMap coordinates.

### Test 7: Offline PWA Resilience & Caching
1. Open Chrome DevTools → **Application** tab → **Service Workers**.
2. Check the **Offline** checkbox in DevTools Network tab.
3. Navigate to `/safety` or reload `/`.
4. **Expected Result:**
   - The red **You're offline** banner appears.
   - Cached crisis safety guides and national helpline numbers (112, 101, 108, 100) remain fully readable and interactive.
   - Standalone `/offline.html` is rendered if an uncached route is requested.

### Test 8: Mobile Responsiveness & Bottom Sheet UX
1. In Chrome DevTools, toggle device toolbar: test 375px (iPhone) and 414px (Android).
2. **Expected Result:**
   - No horizontal scrolling occurs.
   - Bottom mobile navigation bar (Home, Services, SOS, Track, Profile) becomes visible and pinned.
   - Floating SOS button remains accessible.
   - Leaflet maps adjust smoothly to viewport height.

