-- ============================================================
-- FixNearby Emergency Discovery & Service Marketplace
-- PostgreSQL 15+ & PostGIS Production Database Schema
-- ============================================================

-- Enable required PostGIS & cryptographic extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
    saved_address TEXT,
    saved_latitude DOUBLE PRECISION,
    saved_longitude DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. SERVICE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(20) NOT NULL,
    image_url VARCHAR(255),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_code ON service_categories(code);

-- 3. PROBLEM TYPES TABLE
CREATE TABLE IF NOT EXISTS problem_types (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    code VARCHAR(80) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    urgency_default VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (urgency_default IN ('CRITICAL', 'HIGH', 'NORMAL')),
    safety_instructions TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_category_problem UNIQUE (category_id, code)
);

CREATE INDEX IF NOT EXISTS idx_problems_category_id ON problem_types(category_id);

-- 4. TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES service_categories(id),
    badge_code VARCHAR(10) UNIQUE NOT NULL CHECK (badge_code ~ '^FN-[A-Z0-9]{5}$'),
    trade VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 1 CHECK (experience_years >= 0),
    phone VARCHAR(25) NOT NULL,
    whatsapp_number VARCHAR(25) NOT NULL,
    rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    jobs_completed INTEGER NOT NULL DEFAULT 0 CHECK (jobs_completed >= 0),
    operating_radius_km NUMERIC(5,2) NOT NULL DEFAULT 15.00 CHECK (operating_radius_km > 0),
    is_on_duty BOOLEAN NOT NULL DEFAULT FALSE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    profile_image_url VARCHAR(255),
    specialties TEXT,
    current_latitude DOUBLE PRECISION NOT NULL,
    current_longitude DOUBLE PRECISION NOT NULL,
    current_location GEOGRAPHY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PostGIS GIST Spatial Index
CREATE INDEX IF NOT EXISTS idx_technicians_current_location ON technicians USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_technicians_badge_code ON technicians(badge_code);
CREATE INDEX IF NOT EXISTS idx_technicians_category_duty ON technicians(category_id, is_on_duty, is_verified);

-- 5. CREDENTIALS TABLE (4-Point Verification System)
CREATE TABLE IF NOT EXISTS credentials (
    id SERIAL PRIMARY KEY,
    technician_id UUID UNIQUE NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    legal_name VARCHAR(150) NOT NULL,
    identity_verified BOOLEAN NOT NULL DEFAULT FALSE,
    identity_document_type VARCHAR(50) DEFAULT 'National ID',
    license_number VARCHAR(100),
    trade_license_name VARCHAR(150),
    license_verified BOOLEAN NOT NULL DEFAULT FALSE,
    license_valid_until DATE,
    address_verified BOOLEAN NOT NULL DEFAULT FALSE,
    residential_address TEXT,
    police_verified BOOLEAN NOT NULL DEFAULT FALSE,
    police_clearance_number VARCHAR(100),
    police_check_date DATE,
    audit_notes TEXT,
    failure_reasons TEXT, -- Semicolon-separated or JSON list of failures
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credentials_technician ON credentials(technician_id);

-- 6. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS emergency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id INTEGER NOT NULL REFERENCES service_categories(id),
    problem_type_id INTEGER REFERENCES problem_types(id),
    problem_custom_desc TEXT,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('CRITICAL', 'HIGH', 'NORMAL')),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(25) NOT NULL,
    customer_address TEXT,
    customer_latitude DOUBLE PRECISION NOT NULL,
    customer_longitude DOUBLE PRECISION NOT NULL,
    customer_location GEOGRAPHY(Point, 4326),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'CANCELLED')
    ),
    assigned_technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    distance_km NUMERIC(6,2),
    estimated_eta_minutes INTEGER,
    route_polyline TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON emergency_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_technician ON emergency_requests(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_requests_customer_loc ON emergency_requests USING GIST (customer_location);

-- 7. LOCATION LOGS (For breadcrumb tracking during emergency dispatch)
CREATE TABLE IF NOT EXISTS location_logs (
    id BIGSERIAL PRIMARY KEY,
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    request_id UUID REFERENCES emergency_requests(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed_kmh NUMERIC(5,2),
    heading NUMERIC(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loc_logs_req_time ON location_logs(request_id, recorded_at);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    request_id UUID UNIQUE NOT NULL REFERENCES emergency_requests(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_technician ON reviews(technician_id);

-- 9. VERIFICATION AUDIT LOGS (To record and rate-limit public badge verification queries)
CREATE TABLE IF NOT EXISTS verification_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    badge_code VARCHAR(20) NOT NULL,
    queried_by_ip VARCHAR(50),
    check_result VARCHAR(30) NOT NULL, -- VERIFIED, NOT_VERIFIED, INVALID_FORMAT, NOT_FOUND
    failure_reasons TEXT,
    queried_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_badge_audit_code ON verification_audit_logs(badge_code, queried_at);

-- TRIGGER TO SYNC PostGIS GEOGRAPHY POINT FROM LATITUDE & LONGITUDE
CREATE OR REPLACE FUNCTION sync_technician_geography()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_latitude IS NOT NULL AND NEW.current_longitude IS NOT NULL THEN
        NEW.current_location := ST_SetSRID(ST_MakePoint(NEW.current_longitude, NEW.current_latitude), 4326)::geography;
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_technician_geography ON technicians;
CREATE TRIGGER trg_technician_geography
BEFORE INSERT OR UPDATE ON technicians
FOR EACH ROW EXECUTE FUNCTION sync_technician_geography();

CREATE OR REPLACE FUNCTION sync_request_geography()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_latitude IS NOT NULL AND NEW.customer_longitude IS NOT NULL THEN
        NEW.customer_location := ST_SetSRID(ST_MakePoint(NEW.customer_longitude, NEW.customer_latitude), 4326)::geography;
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_request_geography ON emergency_requests;
CREATE TRIGGER trg_request_geography
BEFORE INSERT OR UPDATE ON emergency_requests
FOR EACH ROW EXECUTE FUNCTION sync_request_geography();

