import React from 'react';
import { useNavigate } from 'react-router-dom';

const SAFETY_GUIDES = [
  {
    id: 'electrical',
    title: 'Electrical Hazard & Fire Safety',
    icon: '⚡',
    image: '/images/safety-electrical.svg',
    warning: 'DANGER: High voltage electric shock and rapid flashover fire risk.',
    actions: [
      'Switch OFF the main distribution board (MCB) immediately if safe to reach.',
      'Unplug any appliance emitting smoke or burning plastic odors.',
      'Keep everyone, especially children and pets, at least 15 feet away.',
      'Use only dry Class C / CO2 extinguishers on electrical flames — NEVER water.'
    ],
    donts: [
      'DO NOT touch wet electrical outlets or stand in pooled water near cables.',
      'DO NOT pull a shocked person with bare hands (use a dry wooden stick).',
      'DO NOT attempt DIY rewiring during an active short circuit.'
    ],
    callHotline: 'If visible flames spread or high-voltage sparks are sparking on the street pole, call 101 (Fire) or 112 immediately.',
    tradeCode: 'electrical'
  },
  {
    id: 'plumbing',
    title: 'Water Pipe Burst & Flooding Safety',
    icon: '💧',
    image: '/images/safety-water.svg',
    warning: 'STRUCTURAL HAZARD: Rapid water flooding causes ceiling collapse and hidden electrical short circuits.',
    actions: [
      'Locate and turn off the main water gate valve from your overhead tank or meter.',
      'Power OFF all circuit breakers feeding sub-floor or wall outlets in the flooded zone.',
      'Place containment buckets and build towel berms around door thresholds.',
      'Move valuable electronic devices and documents to higher shelves.'
    ],
    donts: [
      'DO NOT step into deep pooled water if power sockets are submerged.',
      'DO NOT run the booster pump motor if lines are ruptured.',
      'DO NOT attempt high-pressure tape patching on high-pressure main PVC feeds.'
    ],
    callHotline: 'If sewage contamination occurs or main municipal pipeline bursts outside, contact Kolhapur Municipal Disaster Cell (112).',
    tradeCode: 'plumbing'
  },
  {
    id: 'automotive',
    title: 'Highway Breakdown & Vehicle Safety',
    icon: '🚗',
    image: '/images/safety-vehicle.svg',
    warning: 'TRAFFIC COLLISION HAZARD: Secondary crashes on highway shoulders cause 60% of roadside fatalities.',
    actions: [
      'Steer vehicle completely onto the outer road shoulder as far left as possible.',
      'Engage hazard emergency flashers (four-way blinkers) immediately.',
      'Step out through the passenger side (away from traffic) and stand behind the metal barrier.',
      'Place reflective emergency triangle 50 meters behind the vehicle.'
    ],
    donts: [
      'DO NOT open the radiator cap while the engine is hot (boiling coolant scalding!).',
      'DO NOT remain seated inside a disabled vehicle on active highway lanes.',
      'DO NOT walk across active expressway lanes at night.'
    ],
    callHotline: 'If vehicle is stranded in the middle of a fast highway lane or smoke emerges from engine, call 112 (Police) immediately.',
    tradeCode: 'automotive'
  },
  {
    id: 'locksmith',
    title: 'Emergency Lockout & Burglary Damage',
    icon: '🔐',
    image: '/images/safety-locksmith.svg',
    warning: 'SECURITY ADVISORY: Attempting improvised window entry leads to severe falls and broken glass injuries.',
    actions: [
      'Wait in a secure, well-lit area such as a building lobby or security booth.',
      'Have legal occupancy verification ready (ID proof or tenant agreement) for the locksmith.',
      'Check if a spare key exists with a trusted family member nearby.',
      'Verify technician badge on FixNearby before allowing them to manipulate the deadbolt.'
    ],
    donts: [
      'DO NOT attempt to scale pipes or jump across balconies to enter.',
      'DO NOT jam wire hangers or knives into key cylinders (destroys internal tumblers).',
      'DO NOT break double-glazed window glass without safety gloves and goggles.'
    ],
    callHotline: 'If an infant or person requiring critical medicine is locked inside alone, call 112 / 101 immediately for emergency breach.',
    tradeCode: 'locksmith'
  },
  {
    id: 'gas',
    title: 'LPG Gas Leak & Smell Protocol',
    icon: '🔥',
    image: '/images/safety-gas.svg',
    warning: 'EXPLOSION DANGER: Minor sparks from electrical switches can trigger an LPG vapor cloud explosion.',
    actions: [
      'Put the safety cap immediately onto the LPG cylinder valve regulator.',
      'Open all doors and windows wide to maximize cross-ventilation.',
      'Evacuate all occupants and pets outside into open air.',
      'Call the emergency gas distributor helpline from safely OUTSIDE the house.'
    ],
    donts: [
      'DO NOT turn ON or OFF any electrical light switches or exhaust fans.',
      'DO NOT strike matches, lighters, or use candles for illumination.',
      'DO NOT use mobile phones or smartphones inside the room smelling of gas.'
    ],
    callHotline: 'Call National Emergency 112 or Fire Brigade 101 immediately if gas leak hiss continues loudly.',
    tradeCode: 'electrical'
  }
];

export function Safety() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-tag badge-verified" style={{ marginBottom: '0.75rem' }}>
          📶 OFFLINE CACHED PROTOCOLS
        </span>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Emergency Crisis Safety Guides
        </h1>
        <p className="section-subtitle" style={{ maxWidth: '640px', margin: '0 auto' }}>
          Crucial lifesaving instructions for citizens facing sudden domestic and roadside emergencies. These guides remain available even without internet connection.
        </p>
      </div>

      <div className="safety-guides-grid">
        {SAFETY_GUIDES.map((guide) => (
          <article key={guide.id} className="safety-guide-card">
            <img
              src={guide.image}
              alt={guide.title}
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
              loading="lazy"
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{guide.icon}</span>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>{guide.title}</h2>
            </div>

            <div style={{ background: 'rgba(255, 51, 51, 0.08)', borderLeft: '3px solid var(--alert-red)', padding: '0.6rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', color: '#ffb3b3', fontWeight: 600 }}>
              {guide.warning}
            </div>

            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--accent-aqua)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Immediate Do's:
              </h3>
              <ul className="safety-actions-list" style={{ fontSize: '0.85rem' }}>
                {guide.actions.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--alert-red)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                What NOT To Do:
              </h3>
              <ul className="safety-dont-list" style={{ fontSize: '0.85rem' }}>
                {guide.donts.map((dnt, idx) => (
                  <li key={idx}>{dnt}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: 'var(--surface-2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <strong>Helpline Directive:</strong> {guide.callHotline}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate(`/emergency?category=${guide.tradeCode}`)}
              >
                Request Verified {guide.title.split(' ')[0]} Pro ➔
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Safety;

