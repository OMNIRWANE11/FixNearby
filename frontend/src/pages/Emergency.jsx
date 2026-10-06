import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TriageStepper from '../components/TriageStepper';
import SeverityCard from '../components/SeverityCard';
import SafetyAlert from '../components/SafetyAlert';
import LocationPicker from '../components/LocationPicker';
import RatingStars from '../components/RatingStars';
import Loader from '../components/Loader';
import { useGeolocation } from '../hooks/useGeolocation';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import { formatDistance, formatEta } from '../utils/formatters';
import api from '../services/api';

const CATEGORIES = [
  { id: 1, code: 'electrical', name: 'Electrical', icon: '⚡', desc: 'Short circuit, sparks, MCB trip, wiring fault' },
  { id: 2, code: 'plumbing', name: 'Plumbing', icon: '💧', desc: 'Burst pipe, water leakage, tap rupture, motor lock' },
  { id: 3, code: 'automotive', name: 'Automotive', icon: '🚗', desc: 'Dead battery, flat tyre, breakdown, towing' },
  { id: 4, code: 'locksmith', name: 'Locksmith', icon: '🔐', desc: 'House lockout, lost keys, jammed security lock' },
];

export function Emergency() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { location, requestGpsLocation, setManualLocation, gpsStatus } = useGeolocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [problemTypes, setProblemTypes] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [customProblem, setCustomProblem] = useState('');
  const [severity, setSeverity] = useState('HIGH');
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  // Preselect category from query param if provided
  useEffect(() => {
    const catCode = searchParams.get('category');
    if (catCode) {
      const match = CATEGORIES.find((c) => c.code === catCode.toLowerCase());
      if (match) {
        handleCategorySelect(match);
      }
    }
  }, [searchParams]);

  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat);
    try {
      const res = await api.services.getCategoryProblems(cat.id);
      if (res.success && res.data) {
        setProblemTypes(res.data);
      }
    } catch (err) {
      setProblemTypes([]);
    }
    setStep(2);
  };

  const handleProblemSelect = (prob) => {
    setSelectedProblem(prob);
    if (prob.urgencyDefault) {
      setSeverity(prob.urgencyDefault);
    }
    setStep(3);
  };

  const getSafetyInstruction = () => {
    if (selectedProblem?.safetyInstructions) {
      return selectedProblem.safetyInstructions;
    }
    if (selectedCategory?.code === 'electrical') {
      return 'Switch OFF the main distribution board if safe. Do NOT touch exposed wiring or pool of water.';
    }
    if (selectedCategory?.code === 'plumbing') {
      return 'Close the main water inlet valve or turn off the submersible pump immediately.';
    }
    if (selectedCategory?.code === 'automotive') {
      return 'Move away from oncoming traffic onto the shoulder and activate your hazard blinkers.';
    }
    if (selectedCategory?.code === 'locksmith') {
      return 'Do not force the door or attempt unsafe balcony window entry.';
    }
    return 'Ensure you and others are in a safe, well-lit position while help is dispatched.';
  };

  const handleFindHelp = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      showToast('Please provide your name and phone number for the technician.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: selectedCategory.id,
        problemTypeId: selectedProblem?.id || null,
        problemCustomDesc: customProblem.trim() || selectedProblem?.name || 'Emergency Repair',
        severity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: location.address || 'Kolhapur GPS Coordinates',
        customerLatitude: location.latitude,
        customerLongitude: location.longitude,
      };

      const res = await api.requests.create(payload);
      if (res.success && res.data) {
        setDispatchResult(res.data);
        setStep(5);
        showToast(`${res.data.candidatesFound || 0} verified technicians found nearby!`, 'success');
      }
    } catch (err) {
      showToast(err.error?.message || 'Failed to dispatch emergency request.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectTechnician = async (tech) => {
    if (!dispatchResult?.request?.id) return;
    try {
      await api.requests.assign(dispatchResult.request.id, tech.id);
      showToast(`Technician ${tech.name} assigned. Starting live tracking!`, 'success');
      navigate(`/tracking/${dispatchResult.request.id}`);
    } catch (err) {
      navigate(`/tracking/${dispatchResult.request.id}`);
    }
  };

  return (
    <div className="container emergency-page-container">
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span className="badge-tag" style={{ background: 'var(--alert-red-dim)', color: 'var(--alert-red)', fontWeight: 800 }}>
          🚨 RAPID EMERGENCY DISPATCH
        </span>
        <h1 style={{ fontSize: '2.4rem', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
          Emergency Assistance
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Kolhapur 24/7 Verified Technician Dispatch Network
        </p>
      </div>

      {/* Triage Stepper */}
      <TriageStepper currentStep={step} onStepClick={(s) => setStep(s)} />

      <div className="emergency-panel">
        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Step 1: Select Emergency Trade</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              What type of urgent emergency are you experiencing right now?
            </p>

            <div className="services-grid-4" style={{ marginBottom: 0 }}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className={`emergency-card ${selectedCategory?.id === cat.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <div className="card-icon">{cat.icon}</div>
                  <h3 className="card-title">{cat.name}</h3>
                  <p className="card-desc">{cat.desc}</p>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                    Select {cat.name} ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SPECIFIC PROBLEM SELECTION */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Step 2: What is the specific fault?</h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'transparent', color: 'var(--accent-aqua)', padding: 0, minHeight: 'auto' }}
              >
                ← Change Trade
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1.25rem' }}>
              Select the option that best matches your situation for proper safety triage.
            </p>

            <div className="problem-selection-grid">
              {problemTypes.map((prob) => (
                <div
                  key={prob.id}
                  className={`problem-pill ${selectedProblem?.id === prob.id ? 'selected' : ''}`}
                  onClick={() => handleProblemSelect(prob)}
                >
                  <span>{prob.name}</span>
                  <span style={{ fontSize: '0.8rem', color: prob.urgencyDefault === 'CRITICAL' ? 'var(--alert-red)' : 'var(--accent-aqua)' }}>
                    {prob.urgencyDefault}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Description Alternative */}
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Or describe the issue in your own words:
              </label>
              <input
                type="text"
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                placeholder="e.g., Sparks emitting from AC power socket when switched on..."
              />
              {customProblem && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setStep(3)}
                  style={{ marginTop: '0.75rem' }}
                >
                  Continue with this description ➔
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SEVERITY & IMMEDIATE CRISIS SAFETY */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Step 3: Danger & Urgency Level</h2>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{ background: 'transparent', color: 'var(--accent-aqua)', padding: 0, minHeight: 'auto' }}
              >
                ← Back
              </button>
            </div>

            {/* Immediate Safety Instructions */}
            <SafetyAlert
              instructions={getSafetyInstruction()}
              type={severity === 'CRITICAL' ? 'critical' : 'warning'}
            />

            <div className="severity-selector">
              <SeverityCard
                level="CRITICAL"
                label="CRITICAL HAZARD"
                description="Fire hazard, sparking, flooding or life safety threat."
                icon="🔥"
                isSelected={severity === 'CRITICAL'}
                onSelect={setSeverity}
              />
              <SeverityCard
                level="HIGH"
                label="HIGH URGENCY"
                description="Major breakdown, total outage, no water or locked out."
                icon="⚡"
                isSelected={severity === 'HIGH'}
                onSelect={setSeverity}
              />
              <SeverityCard
                level="NORMAL"
                label="STANDARD URGENT"
                description="Non-hazardous fault needing same-day fast repair."
                icon="🛠️"
                isSelected={severity === 'NORMAL'}
                onSelect={setSeverity}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={() => setStep(4)}>
                Confirm & Set Location ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION & CONTACT */}
        {step === 4 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Step 4: Your Emergency Location</h2>
              <button
                type="button"
                onClick={() => setStep(3)}
                style={{ background: 'transparent', color: 'var(--accent-aqua)', padding: 0, minHeight: 'auto' }}
              >
                ← Back
              </button>
            </div>

            {/* Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1rem 0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  Your Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  Phone Number for Technician Call *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+9198XXXXXXXX"
                  required
                />
              </div>
            </div>

            <LocationPicker
              location={location}
              onLocationChange={setManualLocation}
              onGpsRequest={requestGpsLocation}
              gpsStatus={gpsStatus}
            />

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-sos"
                onClick={handleFindHelp}
                disabled={isSubmitting}
                style={{ minHeight: '52px', fontSize: '1.1rem', padding: '0 2rem' }}
              >
                {isSubmitting ? 'Locating Nearby Technicians...' : '🚨 FIND NEAREST TECHNICIANS NOW'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CANDIDATE RESULTS PANEL */}
        {step === 5 && dispatchResult && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-aqua)' }}>
                {dispatchResult.candidatesFound} Verified Technicians Found Nearby
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Technicians are on standby in your sector. Select the technician to initiate live tracking.
              </p>
            </div>

            <div className="tech-cards-grid">
              {dispatchResult.candidates?.map((tech) => (
                <div key={tech.id} className="tech-card" style={{ borderColor: 'var(--accent-aqua)' }}>
                  <div className="tech-card-header">
                    <img
                      src={tech.profileImageUrl || '/images/technicians/tech-default.svg'}
                      alt={tech.name}
                      className="tech-avatar"
                    />
                    <div className="tech-meta" style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>{tech.name}</h3>
                        <span className="badge-tag badge-verified">🛡️ Verified</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tech.trade}</p>
                      <span className="tech-badge-id">{tech.badgeCode}</span>
                    </div>
                  </div>

                  <div className="tech-stats-row">
                    <div>
                      <div className="tech-stat-label">Rating</div>
                      <RatingStars rating={tech.rating} />
                    </div>
                    <div>
                      <div className="tech-stat-label">Distance</div>
                      <div className="tech-stat-val" style={{ color: 'var(--accent-aqua)' }}>
                        {formatDistance(tech.distanceKm)}
                      </div>
                    </div>
                    <div>
                      <div className="tech-stat-label">Est. ETA</div>
                      <div className="tech-stat-val">{formatEta(tech.etaMinutes)}</div>
                    </div>
                  </div>

                  <button
                    className="btn-sos"
                    onClick={() => handleSelectTechnician(tech)}
                    style={{ width: '100%', minHeight: '48px', fontSize: '1rem' }}
                  >
                    SELECT TECHNICIAN & START LIVE TRACKING ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Emergency;

