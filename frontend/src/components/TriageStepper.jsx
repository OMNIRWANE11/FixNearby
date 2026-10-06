import React from 'react';

const STEPS = [
  { step: 1, label: 'Trade' },
  { step: 2, label: 'Problem' },
  { step: 3, label: 'Severity' },
  { step: 4, label: 'Location' },
  { step: 5, label: 'Dispatch' },
];

export function TriageStepper({ currentStep, onStepClick }) {
  return (
    <nav className="triage-stepper" aria-label="Emergency Triage Progress">
      {STEPS.map((s) => {
        const isActive = s.step === currentStep;
        const isCompleted = s.step < currentStep;

        return (
          <div
            key={s.step}
            className={`stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            onClick={() => onStepClick && isCompleted && onStepClick(s.step)}
            style={{ cursor: isCompleted ? 'pointer' : 'default' }}
          >
            <div className="stepper-circle">
              {isCompleted ? '✓' : s.step}
            </div>
            <span className="stepper-label">{s.label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export default TriageStepper;

