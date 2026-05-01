"use client";

import React from 'react';
import { StepData } from '../CivicProcessMap';
import civicStyles from '../CivicProcessMap.module.css';

interface StepListProps {
  steps: StepData[];
  activeStep: number;
  onSelectStep: (id: number) => void;
}

export default function StepList({ steps, activeStep, onSelectStep }: StepListProps) {
  return (
    <ol className={civicStyles.stepList} aria-label="Election process steps">
      {steps.map(step => (
        <li key={step.id} className={civicStyles.stepRow}>
          <button
            id={`step-btn-${step.id}`}
            className={`${civicStyles.stepBtn} ${step.id === activeStep ? civicStyles.stepBtnActive : ''}`}
            onClick={() => onSelectStep(step.id)}
            aria-pressed={step.id === activeStep}
            aria-label={`Step ${step.id}: ${step.label} — ${step.status}`}
          >
            <span className={`${civicStyles.stepCircle} ${step.status === 'completed' ? civicStyles.circleCompleted : step.id === activeStep ? civicStyles.circleActive : civicStyles.circlePending}`} aria-hidden="true">
              {step.status === 'completed' ? '✓' : step.icon}
            </span>
            <span className={civicStyles.stepLabel}>{step.label}</span>
            {step.id === activeStep && <span className={civicStyles.activePip} aria-hidden="true" />}
          </button>
        </li>
      ))}
    </ol>
  );
}
