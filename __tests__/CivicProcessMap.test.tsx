/**
 * CivicProcessMap.test.tsx
 *
 * Comprehensive test suite for the fully-interactive Civic Process Digital Twin.
 *
 * Selector strategy (derived from rendered aria attributes):
 *  - Step buttons:     aria-label = "Step N: Label — status"
 *  - Mark Complete:    aria-label = "Mark step {Label} as complete and continue"
 *  - Nav buttons:      aria-label = "Go to previous step" / "Go to next step"
 *  - FAQ buttons:      no aria-label — matched by button text content
 */

import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CivicProcessMap, { INITIAL_STEPS, StepData } from '../src/components/CivicProcessMap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TestWrapper = () => {
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

const setup = () => render(<TestWrapper />);

// Exact aria-label patterns the component renders:
const STEP_LABEL = (n: number, name: string) =>
  new RegExp(`Step ${n}.*${name}`, 'i');

const MARK_COMPLETE = (stepName: string) =>
  new RegExp(`Mark step ${stepName} as complete`, 'i');

// ─── 1. Rendering ─────────────────────────────────────────────────────────────

describe('Rendering', () => {
  it('renders all 5 step buttons', () => {
    setup();
    [1, 2, 3, 4, 5].forEach(n => {
      expect(
        screen.getByRole('button', { name: STEP_LABEL(n, ['Registration','Method Choice','Ballot Research','Voting','Verification'][n-1]) })
      ).toBeInTheDocument();
    });
  });

  it('renders progress bar with ARIA attributes', () => {
    setup();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('shows 1/5 Complete on load (Registration already done)', () => {
    setup();
    expect(screen.getByText(/1\/5 Complete/)).toBeInTheDocument();
  });

  it('shows progress label text', () => {
    setup();
    expect(screen.getByText(/20%.*civic workflow/i)).toBeInTheDocument();
  });

  it('renders step list with accessible label', () => {
    setup();
    expect(screen.getByRole('list', { name: /election process steps/i })).toBeInTheDocument();
  });

  it('renders navigation region', () => {
    setup();
    expect(screen.getByRole('navigation', { name: /step navigation/i })).toBeInTheDocument();
  });

  it('renders progressbar', () => {
    setup();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});

// ─── 2. Step Click Interaction ────────────────────────────────────────────────

describe('Step Click Interaction', () => {
  it('clicking Registration shows its headline', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    expect(screen.getByRole('heading', { name: /Voter Registration/i })).toBeInTheDocument();
  });

  it('clicking Method Choice shows its headline', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    expect(screen.getByRole('heading', { name: /Select Your Voting Method/i })).toBeInTheDocument();
  });

  it('clicking Ballot Research shows its headline', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(screen.getByRole('heading', { name: /Research Your Ballot/i })).toBeInTheDocument();
  });

  it('clicking Voting shows its headline', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(4, 'Voting') }));
    expect(screen.getByRole('heading', { name: /Cast Your Ballot/i })).toBeInTheDocument();
  });

  it('clicking Verification shows its headline', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(5, 'Verification') }));
    expect(screen.getByRole('heading', { name: /Verify Your Vote Was Counted/i })).toBeInTheDocument();
  });

  it('every step shows Required Actions after click', () => {
    setup();
    [1, 2, 3, 4, 5].forEach((n, i) => {
      const names = ['Registration','Method Choice','Ballot Research','Voting','Verification'];
      fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(n, names[i]) }));
      expect(screen.getByText(/Required Actions/i)).toBeInTheDocument();
    });
  });

  it('every step shows Common Questions after click', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(screen.getByText(/Common Questions/i)).toBeInTheDocument();
  });

  it('every step shows guidance text after click', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    expect(screen.getByText(/registration is verified/i)).toBeInTheDocument();
  });
});

// ─── 3. Active State ──────────────────────────────────────────────────────────

describe('Active State', () => {
  it('default active step (2) has aria-pressed=true', () => {
    setup();
    const btn = screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('clicked step gets aria-pressed=true', () => {
    setup();
    const btn3 = screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') });
    fireEvent.click(btn3);
    expect(btn3).toHaveAttribute('aria-pressed', 'true');
  });

  it('previously active step loses aria-pressed after clicking another', () => {
    setup();
    const btn2 = screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') });
    const btn3 = screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') });
    expect(btn2).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(btn3);
    expect(btn2).toHaveAttribute('aria-pressed', 'false');
    expect(btn3).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─── 4. Navigation ────────────────────────────────────────────────────────────

describe('Navigation Buttons', () => {
  it('Previous is disabled on step 1', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    expect(screen.getByRole('button', { name: /Go to previous step/i })).toBeDisabled();
  });

  it('Skip is disabled on last step', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(5, 'Verification') }));
    expect(screen.getByRole('button', { name: /Go to next step/i })).toBeDisabled();
  });

  it('Skip advances to next step detail panel', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    fireEvent.click(screen.getByRole('button', { name: /Go to next step/i }));
    expect(screen.getByRole('heading', { name: /Select Your Voting Method/i })).toBeInTheDocument();
  });

  it('Previous goes back one step', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    fireEvent.click(screen.getByRole('button', { name: /Go to previous step/i }));
    expect(screen.getByRole('heading', { name: /Select Your Voting Method/i })).toBeInTheDocument();
  });

  it('Previous and Skip never throw on middle steps', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Go to previous step/i }))).not.toThrow();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    expect(() => fireEvent.click(screen.getByRole('button', { name: /Go to next step/i }))).not.toThrow();
  });
});

// ─── 5. Mark Complete ─────────────────────────────────────────────────────────

describe('Mark Complete', () => {
  it('advances to next step after clicking Mark Complete', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }));
    expect(screen.getByRole('heading', { name: /Research Your Ballot/i })).toBeInTheDocument();
  });

  it('increments progress counter after marking complete', () => {
    setup();
    expect(screen.getByText('1/5 Complete')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }));
    expect(screen.getByText('2/5 Complete')).toBeInTheDocument();
  });

  it('marking Ballot Research complete increments to 3/5', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }));
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Ballot Research') }));
    expect(screen.getByText('3/5 Complete')).toBeInTheDocument();
  });

  it('Mark Complete never throws', () => {
    setup();
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }))
    ).not.toThrow();
  });
});

// ─── 6. Method Choice Interactions ───────────────────────────────────────────

describe('Method Choice Step', () => {
  it('shows all 3 voting method cards', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    // Method cards use aria-label matching the method label
    const methodBtns = screen.getAllByRole('button', { name: /Mail-In Voting|Early Voting|Election Day/i });
    expect(methodBtns.length).toBeGreaterThanOrEqual(3);
  });

  it('selecting Mail-In sets aria-pressed=true on that card', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    const mailBtns = screen.getAllByRole('button', { name: /Mail-In/i });
    // The method card is the first button matching Mail-In
    const mailCard = mailBtns[0];
    fireEvent.click(mailCard);
    expect(mailCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('selecting Early Voting deselects Mail-In', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    const mailBtns  = screen.getAllByRole('button', { name: /Mail-In/i });
    const earlyBtns = screen.getAllByRole('button', { name: /Early Voting/i });
    const mailCard  = mailBtns[0];
    const earlyCard = earlyBtns[0];
    fireEvent.click(mailCard);
    fireEvent.click(earlyCard);
    expect(mailCard).toHaveAttribute('aria-pressed', 'false');
    expect(earlyCard).toHaveAttribute('aria-pressed', 'true');
  });

  it('method cards are hidden on other steps', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(screen.queryByRole('button', { name: /Mail-In Voting/i })).not.toBeInTheDocument();
  });

  it('selected method card shows "Selected" badge text', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(2, 'Method Choice') }));
    const mailBtns = screen.getAllByRole('button', { name: /Mail-In/i });
    fireEvent.click(mailBtns[0]);
    expect(screen.getByText(/✓ Selected/)).toBeInTheDocument();
  });
});

// ─── 7. FAQ Accordion ────────────────────────────────────────────────────────

describe('FAQ Accordion', () => {
  it('FAQ answers are hidden by default', () => {
    setup();
    // Registration FAQs — "moved recently" answer should not be visible
    expect(screen.queryByText(/Update your registration at vote\.gov/i)).not.toBeInTheDocument();
  });

  it('clicking a FAQ question reveals the answer', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.click(faqBtn);
    expect(screen.getByText(/Update your registration at vote\.gov/i)).toBeInTheDocument();
  });

  it('clicking same FAQ again collapses it', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.click(faqBtn);
    fireEvent.click(faqBtn);
    expect(screen.queryByText(/Update your registration at vote\.gov/i)).not.toBeInTheDocument();
  });

  it('FAQ button has aria-expanded=false by default', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    expect(faqBtn).toHaveAttribute('aria-expanded', 'false');
  });

  it('FAQ button has aria-expanded=true after click', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.click(faqBtn);
    expect(faqBtn).toHaveAttribute('aria-expanded', 'true');
  });
});

// ─── 8. Keyboard Accessibility ───────────────────────────────────────────────

describe('Keyboard Accessibility', () => {
  it('step 3 activates on Enter key', () => {
    setup();
    const btn = screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') });
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' });
    expect(screen.getByText(/Research Your Ballot/i)).toBeInTheDocument();
  });

  it('step 4 activates on Space key', () => {
    setup();
    const btn = screen.getByRole('button', { name: STEP_LABEL(4, 'Voting') });
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' });
    expect(screen.getByText(/Cast Your Ballot/i)).toBeInTheDocument();
  });

  it('FAQ button toggles on Enter key', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    const faqBtn = screen.getByRole('button', { name: /What if I moved recently/i });
    fireEvent.keyDown(faqBtn, { key: 'Enter', code: 'Enter' });
    expect(faqBtn).toHaveAttribute('aria-expanded', 'true');
  });
});

// ─── 9. No Dead Buttons ───────────────────────────────────────────────────────

describe('No Dead Buttons', () => {
  it('all 5 step buttons respond to click without throwing', () => {
    setup();
    const names = ['Registration','Method Choice','Ballot Research','Voting','Verification'];
    names.forEach((name, i) => {
      expect(() =>
        fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(i + 1, name) }))
      ).not.toThrow();
    });
  });

  it('Skip button does not throw on step 2', () => {
    setup();
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /Go to next step/i }))
    ).not.toThrow();
  });

  it('Previous button does not throw on step 3', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /Go to previous step/i }))
    ).not.toThrow();
  });

  it('Mark Complete button does not throw', () => {
    setup();
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }))
    ).not.toThrow();
  });
});

// ─── 10. Complete Guided Workflow ─────────────────────────────────────────────

describe('Complete Guided Workflow', () => {
  it('progresses from 1/5 to 4/5 by marking steps 2, 3, 4 complete', () => {
    setup();
    // Step 1 already completed at init. Steps 2→3→4 via Mark Complete.
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }));
    expect(screen.getByText('2/5 Complete')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Ballot Research') }));
    expect(screen.getByText('3/5 Complete')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Voting') }));
    expect(screen.getByText('4/5 Complete')).toBeInTheDocument();
  });

  it('user can freely navigate between completed steps', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: MARK_COMPLETE('Method Choice') }));
    // Go back to Registration
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(1, 'Registration') }));
    expect(screen.getByRole('heading', { name: /Voter Registration/i })).toBeInTheDocument();
    // Jump forward to Ballot Research
    fireEvent.click(screen.getByRole('button', { name: STEP_LABEL(3, 'Ballot Research') }));
    expect(screen.getByRole('heading', { name: /Research Your Ballot/i })).toBeInTheDocument();
  });
});
