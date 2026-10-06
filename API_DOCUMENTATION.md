# FixNearby API Documentation

**Base API URL:** `http://localhost:5000/api/v1`  
**Protocol:** REST & WebSocket (Socket.IO)  
**Standard Response Envelope:**

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

**Standard Error Envelope:**

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error.",
    "details": { ... }
  }
}
```

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new customer account or technician profile.
* **Authentication:** None
* **Rate Limit:** 10 requests / minute
* **Request Body:**
```json
{
  "email": "sunil@example.com",
  "password": "Password@123",
  "fullName": "Sunil Patil",
  "phone": "+919876543210",
  "role": "customer",
  "savedAddress": "Shahupuri, Kolhapur"
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "c1f7b02d-...",
      "email": "sunil@example.com",
      "fullName": "Sunil Patil",
      "phone": "+919876543210",
      "role": "customer"
    }
  },
  "error": null
}
```

---

### `POST /auth/login`
Authenticate using email and password.
* **Authentication:** None
* **Rate Limit:** 20 requests / minute
* **Request Body:**
```json
{
  "email": "citizen@fixnearby.local",
  "password": "CitizenPass@123"
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "d0e1b2c3-...",
      "email": "citizen@fixnearby.local",
      "fullName": "Ananya Sharma",
      "role": "customer"
    }
  },
  "error": null
}
```

---

### `GET /auth/me`
Retrieve currently authenticated user profile.
* **Authentication:** Bearer JWT required (`Authorization: Bearer <token>`)
* **Success Response (200 OK):** Returns User object with associated profile.

---

## 2. Service Categories & Problem Types

### `GET /categories`
List all active emergency service categories with problem types and on-duty counts.
* **Authentication:** Public
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "electrical",
      "name": "Electrical",
      "icon": "⚡",
      "description": "Urgent electrical faults, sparking, circuit breaker trips...",
      "technicianCount": 3,
      "problemTypes": [
        {
          "id": 1,
          "code": "short-circuit",
          "name": "Short Circuit / Sparking",
          "urgencyDefault": "CRITICAL",
          "safetyInstructions": "Switch OFF the main distribution board switch immediately!"
        }
      ]
    }
  ]
}
```

---

### `GET /categories/<id>/problems`
Retrieve problem triage options for a specific category ID.

---

## 3. Technicians & Spatial Discovery

### `GET /technicians`
Geospatially query nearby active technicians using PostGIS coordinates or filters.
* **Authentication:** Public
* **Query Parameters:**
  * `lat` (float): Citizen latitude
  * `lng` (float): Citizen longitude
  * `radiusKm` (float, default: 25.0): Maximum search radius in kilometers
  * `category` (string, optional): Category slug e.g. `electrical`
  * `onDutyOnly` (boolean, optional): Filter online providers
  * `verifiedOnly` (boolean, optional): Filter 4-point verified providers
  * `minRating` (float, optional): e.g. `4.0`
  * `sort` (string): `nearest`, `rating`, `eta`, `experience`
  * `search` (string, optional): Keyword query
* **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 4,
    "technicians": [
      {
        "id": "84d5f0b1-...",
        "badgeCode": "FN-88492",
        "name": "Rajesh Patil",
        "trade": "Senior Licensed Electrician",
        "rating": 4.9,
        "jobsCompleted": 142,
        "distanceKm": 0.8,
        "etaMinutes": 4,
        "isOnDuty": true,
        "isVerified": true
      }
    ]
  }
}
```

---

### `GET /technicians/<id>`
Retrieve complete technician profile including 4-point credential audit verification results and reviews.

---

## 4. 4-Point Badge Verification System

### `GET /verify/<badge_code>`
Rigorously audits technician credentials before allowing home entry.
* **Authentication:** Public
* **Rate Limit:** 10 requests / minute / IP
* **Path Parameter:** `badge_code` (e.g., `FN-88492`)
* **Validation Regex:** `^FN-[A-Z0-9]{5}$`
* **Success Response (200 OK - Verified):**
```json
{
  "success": true,
  "data": {
    "badgeCode": "FN-88492",
    "overallStatus": "VERIFIED",
    "isVerified": true,
    "technician": {
      "name": "Rajesh Patil",
      "trade": "Senior Licensed Electrician",
      "badgeCode": "FN-88492",
      "rating": 4.9,
      "jobsCompleted": 142
    },
    "audit": {
      "allPassed": true,
      "checks": {
        "identityCheck": {
          "title": "Identity Verification",
          "status": "PASS",
          "passed": true,
          "legalName": "Rajesh Patil",
          "details": "Government photo identity verified with facial matching"
        },
        "licenseCheck": {
          "title": "Trade License & Skills",
          "status": "PASS",
          "passed": true,
          "licenseNumberMasked": "LIC-****8291",
          "tradeName": "Maharashtra State Electrical Licensing Board Class-A"
        },
        "policeCheck": {
          "title": "Address & Police Background",
          "status": "PASS",
          "passed": true,
          "addressStatus": "Verified Physical Address",
          "policeStatus": "Police Clearance Certificate Verified"
        },
        "ratingCheck": {
          "title": "Customer Trust Rating",
          "status": "PASS",
          "passed": true,
          "currentRating": 4.9,
          "jobsCompleted": 142
        }
      }
    }
  }
}
```

---

## 5. Emergency Requests & Dispatch

### `POST /requests`
Registers a new crisis dispatch request, saves record, queries PostGIS candidates, and returns optimal OSRM street route.
* **Authentication:** Optional (Supports anonymous and authenticated citizens)
* **Request Body:**
```json
{
  "categoryId": 1,
  "problemTypeId": 1,
  "severity": "CRITICAL",
  "customerName": "Ananya Sharma",
  "customerPhone": "+919822000002",
  "customerAddress": "Shahupuri 2nd Lane, Kolhapur",
  "customerLatitude": 16.7032,
  "customerLongitude": 74.2389
}
```
* **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req-live-kolhapur-001",
      "status": "PENDING",
      "severity": "CRITICAL",
      "distanceKm": 0.8,
      "estimatedEtaMinutes": 4
    },
    "candidatesFound": 3,
    "candidates": [ ... ],
    "primaryRoute": {
      "coordinates": [[16.7045, 74.2410], [16.7032, 74.2389]]
    }
  }
}
```

---

### `PATCH /requests/<id>/assign`
Assigns chosen technician to the request and triggers real-time tracking simulation.
* **Request Body:** `{ "technicianId": "84d5f0b1-..." }`

### `PATCH /requests/<id>/status`
Transitions emergency status (`ASSIGNED`, `ON_THE_WAY`, `ARRIVED`, `COMPLETED`, `CANCELLED`).

### `POST /requests/<id>/review`
Submits 1-5 star review and comment for the completed emergency request.

---

## 6. Live Tracking & Socket.IO

### `GET /tracking/<request_id>`
Retrieves live coordinates, assigned technician details, and OSRM route waypoints.

### Real-Time Socket.IO Events
* `join_request_room`: Payload `{ "requestId": "..." }`
* `leave_request_room`: Payload `{ "requestId": "..." }`
* `technician_location_update`: Emits `{ "latitude", "longitude", "distanceRemainingKm", "etaMinutes", "speedKmh" }`
* `status_changed`: Emits `{ "status", "message" }`
* `eta_update`: Emits `{ "etaMinutes", "distanceRemainingKm" }`

