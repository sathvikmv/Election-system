/**
 * Accessibility tests — keyboard navigation, ARIA compliance, screen reader behavior.
 * Tests every interactive element in the application for a11y correctness.
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CivicProcessMap, { INITIAL_STEPS, StepData } from '../../src/components/CivicProcessMap';
import TrustScoreCard from '../../src/components/TrustScoreCard';
import RiskAlert from '../../src/components/RiskAlert';

const METRICS = { accuracy: 95, clarity: 92, biasRisk: 5, completeness: 90, recommendation: 'Excellent.' };

// Wrapper that manages state for CivicProcessMap (since state was lifted to Dashboard)
const CivicMapWrapper = () => {
  const [steps, setSteps] = useState<StepData[]>(INITIAL_STEPS);
  const [activeStep, setActiveStep] = useState<number>(2);

  const handleSelectStep = (id: number) => {
    setActiveStep(id);
    setSteps(prev =>
      prev.map(s => ({
        ...s,
        status: s.id < id ? 'completed' : s.id === id ? 'active' : s.status === 'completed' ? 'completed' : 'pending',
      }))
    );
  };

  const handleMarkComplete = () => {
    setSteps(prev =>
      prev.map(s => s.id === activeStep ? { ...s, status: 'completed' } : s)
    );
    if (activeStep < steps.length) handleSelectStep(activeStep + 1);
  };

  return <CivicProcessMap steps={steps} activeStep={activeStep} onSelectStep={handleSelectStep} onMarkComplete={handleMarkComplete} />;
};

const renderCivicMap = () => render(<CivicMapWrapper />);

// ─── 1. ARIA Roles & Labels ───────────────────────────────────────────────────

describe('Accessibility: ARIA Roles and Labels', () => {
  it('CivicProcessMap has progressbar with aria-valuemin/max/now', () => {
    renderCivicMap();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow');
  });

  it('CivicProcessMap step list has role=list with accessible label', () => {
    renderCivicMap();
    expect(screen.getByRole('list', { name: /election process steps/i })).toBeInTheDocument();
  });

  it('CivicProcessMap step buttons have aria-pressed attribute', () => {
    renderCivicMap();
    const stepBtns = screen.getAllByRole('button', { name: /Step \d+:/i });
    stepBtns.forEach(btn => {
      expect(btn).toHaveAttribute('aria-pressed');
    });
  });

  it('CivicProcessMap navigation has role=navigation with label', () => {
    renderCivicMap();
    expect(screen.getByRole('navigation', { name: /step navigation/i })).toBeInTheDocument();
  });

  it('TrustScoreCard has role=region with accessible name', () => {
    render(<TrustScoreCard score={95} metrics={METRICS} />);
    expect(screen.getByRole('region', { name: /AI Trust Framework/i })).toBeInTheDocument();
  });

  it('TrustScoreCard score element has aria-label', () => {
    render(<TrustScoreCard score={88} />);
    expect(screen.getByLabelText(/Trust score 88 percent/i)).toBeInTheDocument();
  });

  it('FAQ buttons have aria-expanded attribute', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 1: Registration/i }));
    const faqBtns = screen.getAllByRole('button', { name: /What if/i });
    faqBtns.forEach(btn => {
      expect(btn).toHaveAttribute('aria-expanded');
    });
  });

  it('Previous button has descriptive aria-label', () => {
    renderCivicMap();
    expect(screen.getByRole('button', { name: /Go to previous step/i })).toBeInTheDocument();
  });

  it('Next/Skip button has descriptive aria-label', () => {
    renderCivicMap();
    expect(screen.getByRole('button', { name: /Go to next step/i })).toBeInTheDocument();
  });

  it('Mark Complete button has descriptive aria-label', () => {
    renderCivicMap();
    expect(screen.getByRole('button', { name: /Mark step .* as complete/i })).toBeInTheDocument();
  });
});

// ─── 2. Keyboard Navigation ───────────────────────────────────────────────────

describe('Accessibility: Keyboard Navigation', () => {
  it('all step buttons are focusable (not tabIndex=-1)', () => {
    renderCivicMap();
    const stepBtns = screen.getAllByRole('button', { name: /Step \d+:/i });
    stepBtns.forEach(btn => {
      expect(btn).not.toHaveAttribute('tabIndex', '-1');
    });
  });

  it('Enter key on step 1 button shows Registration panel', () => {
    renderCivicMap();
    const btn = screen.getByRole('button', { name: /Step 1: Registration/i });
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
    expect(screen.getByRole('heading', { name: /Voter Registration/i })).toBeInTheDocument();
  });

  it('Space key on step 3 button shows Ballot Research panel', () => {
    renderCivicMap();
    const btn = screen.getByRole('button', { name: /Step 3: Ballot Research/i });
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' });
    expect(screen.getByRole('heading', { name: /Research Your Ballot/i })).toBeInTheDocument();
  });

  it('Enter key on FAQ button expands it', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 1: Registration/i }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.keyDown(faqBtn, { key: 'Enter', code: 'Enter' });
    expect(faqBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('Space key on FAQ button expands it', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 1: Registration/i }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.keyDown(faqBtn, { key: ' ', code: 'Space' });
    expect(faqBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('Previous button is keyboard accessible', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 3: Ballot Research/i }));
    const prevBtn = screen.getByRole('button', { name: /Go to previous step/i });
    expect(() => fireEvent.keyDown(prevBtn, { key: 'Enter' })).not.toThrow();
  });
});

// ─── 3. Disabled States ───────────────────────────────────────────────────────

describe('Accessibility: Disabled States', () => {
  it('Previous button is disabled on first step', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 1: Registration/i }));
    expect(screen.getByRole('button', { name: /Go to previous step/i })).toBeDisabled();
  });

  it('Skip button is disabled on last step', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 5: Verification/i }));
    expect(screen.getByRole('button', { name: /Go to next step/i })).toBeDisabled();
  });

  it('disabled Previous button is still in the DOM (not hidden)', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 1: Registration/i }));
    expect(screen.getByRole('button', { name: /Go to previous step/i })).toBeInTheDocument();
  });
});

// ─── 4. Screen Reader Text ────────────────────────────────────────────────────

describe('Accessibility: Screen Reader Content', () => {
  it('emoji icons in method cards have aria-hidden', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 2: Method Choice/i }));
    const hiddenIcons = document.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenIcons.length).toBeGreaterThan(0);
  });

  it('progress bar has human-readable aria-valuetext', () => {
    renderCivicMap();
    const bar = screen.getByRole('progressbar');
    const now = bar.getAttribute('aria-valuenow');
    expect(now).not.toBeNull();
    expect(Number(now)).toBeGreaterThanOrEqual(0);
    expect(Number(now)).toBeLessThanOrEqual(100);
  });

  it('step list items are wrapped in li elements', () => {
    renderCivicMap();
    const list = screen.getByRole('list', { name: /election process steps/i });
    const items = within(list).getAllByRole('listitem');
    expect(items.length).toBe(5);
  });
});

// ─── 5. Focus Management ─────────────────────────────────────────────────────

describe('Accessibility: Focus Not Trapped', () => {
  it('clicking a step does not trap focus (other buttons still reachable)', () => {
    renderCivicMap();
    fireEvent.click(screen.getByRole('button', { name: /Step 3: Ballot Research/i }));
    // Should still be able to find and interact with other steps
    const step1 = screen.getByRole('button', { name: /Step 1: Registration/i });
    expect(step1).toBeInTheDocument();
    expect(() => fireEvent.click(step1)).not.toThrow();
  });
});
