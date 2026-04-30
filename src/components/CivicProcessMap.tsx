"use client";

import { useState, useCallback, KeyboardEvent, useRef, useEffect } from 'react';
import civicStyles from './CivicProcessMap.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StepStatus = 'completed' | 'active' | 'pending';

export interface FAQ {
  q: string;
  a: string;
}

export interface MethodOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface StepData {
  id: number;
  label: string;
  icon: string;
  status: StepStatus;
  headline: string;
  explanation: string;
  requiredActions: string[];
  guidance: string;
  faqs: FAQ[];
  methods?: MethodOption[];
}

// ─── Step Dataset ─────────────────────────────────────────────────────────────

export const INITIAL_STEPS: StepData[] = [
  {
    id: 1,
    label: 'Registration',
    icon: '📋',
    status: 'completed',
    headline: 'Voter Registration — Completed',
    explanation:
      'Voter registration is the foundation of the democratic process. You must be registered in order to vote. Most states require registration 15–30 days before an election.',
    requiredActions: [
      'Confirm your name matches your government-issued ID',
      'Verify your current address is on file',
      'Check your registration is marked "Active" in your state portal',
    ],
    guidance:
      '✅ Your registration is verified. Keep your registered address up-to-date — if you move, re-register immediately to avoid issues on Election Day.',
    faqs: [
      { q: 'What if I moved recently?', a: 'Update your registration at vote.gov or your state\'s portal. Deadlines vary, but act immediately.' },
      { q: 'Can I register on Election Day?', a: 'In 22 states and DC, yes — Same-Day Registration (SDR) is available. Check your state.' },
      { q: 'How do I confirm I\'m registered?', a: 'Visit vote.gov and use the "Check Registration" tool for your state.' },
    ],
  },
  {
    id: 2,
    label: 'Method Choice',
    icon: '🗳️',
    status: 'active',
    headline: 'Select Your Voting Method',
    explanation:
      'You have multiple options for casting your vote. Each method has different deadlines, requirements, and processes. Choose the one that fits your schedule and accessibility needs.',
    requiredActions: [
      'Review all three voting methods below',
      'Check your jurisdiction\'s deadlines for each method',
      'Select your preferred method and note the date',
    ],
    guidance:
      '💡 Early voting is the most flexible option for most first-time voters — no mail delays and shorter lines than Election Day.',
    faqs: [
      { q: 'Can I change my method after choosing?', a: 'If you requested a mail-in ballot and want to vote in person, bring the un-voted ballot to surrender it, or vote provisionally.' },
      { q: 'What if I have a disability?', a: 'All polling places must provide accessible voting equipment. You can also request an accessible absentee ballot.' },
      { q: 'Is mail-in voting safe?', a: 'Yes. Mail-in ballots have multiple security layers: unique barcodes, signature verification, and bipartisan counting teams.' },
    ],
    methods: [
      { id: 'mail', icon: '📮', label: 'Mail-In Voting', description: 'Request your ballot 1–2 weeks before the election. Return by the posted deadline via mail or drop box.' },
      { id: 'early', icon: '🕐', label: 'Early Voting', description: 'Vote in person at designated sites before Election Day. Check your county\'s early voting schedule.' },
      { id: 'election-day', icon: '🗓️', label: 'Election Day', description: 'Vote at your assigned polling place on the official Election Day. Bring valid ID.' },
    ],
  },
  {
    id: 3,
    label: 'Ballot Research',
    icon: '🔍',
    status: 'pending',
    headline: 'Research Your Ballot',
    explanation:
      'Understanding your ballot before you vote allows you to make informed decisions and vote faster at the polls. Ballots include candidates, local measures, and judges.',
    requiredActions: [
      'Find your sample ballot at your county election website',
      'Research all candidates for each race',
      'Read the full text of ballot measures and propositions',
      'Consider endorsements from trusted civic organizations',
    ],
    guidance:
      '📌 Use Ballotpedia.org or your county\'s official voter guide for non-partisan ballot information.',
    faqs: [
      { q: 'Do I have to vote in every race?', a: 'No. Leaving a race blank ("undervoting") is legal and does not invalidate your ballot.' },
      { q: 'Can I bring notes to the polls?', a: 'Yes, in most states you can bring a "cheat sheet" with your voting choices. Check your state\'s specific rules.' },
      { q: 'What are ballot measures?', a: 'Measures (propositions, initiatives) are direct votes on laws or policy changes proposed by the legislature or citizens.' },
    ],
  },
  {
    id: 4,
    label: 'Voting',
    icon: '✅',
    status: 'pending',
    headline: 'Cast Your Ballot',
    explanation:
      'Voting day is your civic moment. Whether in person or by mail, following the correct procedure ensures your vote is counted.',
    requiredActions: [
      'Bring your required ID (check state requirements)',
      'Know your polling place location and hours',
      'Arrive with extra time — allow 15–30 minutes for lines',
      'Follow all ballot marking instructions exactly',
    ],
    guidance:
      '⚠️ If you make a mistake on your ballot, do not submit it. Ask a poll worker for a replacement (called a "spoiled ballot").',
    faqs: [
      { q: 'What if my name is not on the poll book?', a: 'Request a provisional ballot. It will be reviewed after the election once eligibility is confirmed.' },
      { q: 'Can someone help me vote?', a: 'Yes. You can bring a helper (not your employer or union rep) or request assistance from a poll worker.' },
      { q: 'How long can I wait in line?', a: 'Legally, if you are in line before polls close, you have the right to vote regardless of how long it takes.' },
    ],
  },
  {
    id: 5,
    label: 'Verification',
    icon: '🔒',
    status: 'pending',
    headline: 'Verify Your Vote Was Counted',
    explanation:
      'After voting, you can track whether your ballot was received and accepted. This is especially important for mail-in voters.',
    requiredActions: [
      'Note your ballot tracking ID (mail-in voters)',
      'Visit your state\'s ballot tracking portal within 1–5 days',
      'Check for any "cure" notices requiring action on signature issues',
    ],
    guidance:
      '🔒 Most states will notify you by mail or email if your ballot has a problem you need to fix ("cure"). Respond immediately — deadlines are short.',
    faqs: [
      { q: 'What if my ballot is rejected?', a: 'Contact your local election office immediately. You may be able to "cure" a signature mismatch within the allowed window.' },
      { q: 'When will results be official?', a: 'Preliminary results appear on Election Night, but official results are certified 2–4 weeks later after all ballots are counted.' },
      { q: 'Can I see who I voted for after submitting?', a: 'No. Ballot secrecy is protected by law. You can only verify that your ballot was received and counted.' },
    ],
  },
];

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);

  return (
    <div
      className={civicStyles.faqItem}
      role="region"
      aria-label={`FAQ: ${faq.q}`}
    >
      <button
        className={civicStyles.faqQuestion}
        onClick={toggle}
        aria-expanded={open}
        onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') toggle(); }}
      >
        {faq.q}
        <span className={`${civicStyles.faqIcon} ${open ? civicStyles.faqIconOpen : ''}`}>▾</span>
      </button>
      {open && <p className={civicStyles.faqAnswer}>{faq.a}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface CivicProcessMapProps {
  steps: StepData[];
  activeStep: number;
  onSelectStep: (id: number) => void;
  onMarkComplete: () => void;
}

export default function CivicProcessMap({ steps, activeStep, onSelectStep, onMarkComplete }: CivicProcessMapProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeStep]);

  const currentStep = steps.find(s => s.id === activeStep) ?? steps[0];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectStep(id);
    }
  };

  const goNext = () => { if (activeStep < steps.length) onSelectStep(activeStep + 1); };
  const goPrev = () => { if (activeStep > 1) onSelectStep(activeStep - 1); };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={civicStyles.wrapper} role="main" aria-label="Civic Process Guided Workflow">

      <div className={civicStyles.header}>
        <h2 className={civicStyles.title}>Digital Twin Workflow</h2>
        <span className={civicStyles.badge}>{completedCount}/{steps.length} Complete</span>
      </div>

      <div className={civicStyles.progressBarOuter} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Overall progress">
        <div className={civicStyles.progressBarInner} style={{ width: `${progressPct}%` }} />
      </div>
      <p className={civicStyles.progressLabel}>{progressPct}% complete</p>

      <ol className={civicStyles.stepList} aria-label="Election process steps">
        {steps.map(step => (
          <li key={step.id} className={civicStyles.stepRow}>
            <button
              id={`step-btn-${step.id}`}
              className={`${civicStyles.stepBtn} ${step.id === activeStep ? civicStyles.stepBtnActive : ''}`}
              onClick={() => onSelectStep(step.id)}
              onKeyDown={(e) => handleKeyDown(e, step.id)}
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

      <div
        ref={detailRef}
        className={civicStyles.detailPanel}
        role="region"
        aria-labelledby={`step-btn-${currentStep.id}`}
        aria-live="polite"
      >
        <div className={civicStyles.detailHeader}>
          <span className={civicStyles.detailStepIcon} aria-hidden="true">{currentStep.icon}</span>
          <div>
            <h3 className={civicStyles.detailTitle}>{currentStep.headline}</h3>
            <span className={`${civicStyles.statusPill} ${currentStep.status === 'completed' ? civicStyles.pillGreen : currentStep.status === 'active' ? civicStyles.pillBlue : civicStyles.pillGrey}`}>
              {currentStep.status === 'completed' ? '✓ Completed' : currentStep.status === 'active' ? '● In Progress' : '○ Pending'}
            </span>
          </div>
        </div>

        <p className={civicStyles.explanation}>{currentStep.explanation}</p>

        <section className={civicStyles.section} aria-label="Required actions">
          <h4 className={civicStyles.sectionTitle}>📌 Required Actions</h4>
          <ul className={civicStyles.actionList}>
            {currentStep.requiredActions.map((action, i) => (
              <li key={i} className={civicStyles.actionItem}>
                <span className={civicStyles.actionBullet} aria-hidden="true">→</span>
                {action}
              </li>
            ))}
          </ul>
        </section>

        <section className={civicStyles.guidanceBox} aria-label="Guidance">
          <p>{currentStep.guidance}</p>
        </section>

        {currentStep.methods && (
          <section className={civicStyles.section} aria-label="Voting method options">
            <h4 className={civicStyles.sectionTitle}>🗳️ Method Selection</h4>
            <div className={civicStyles.methodGrid}>
              {currentStep.methods.map(m => (
                <button
                  key={m.id}
                  className={`${civicStyles.methodCard} ${selectedMethod === m.id ? civicStyles.methodCardSelected : ''}`}
                  onClick={() => setSelectedMethod(m.id)}
                  aria-pressed={selectedMethod === m.id}
                  aria-label={m.label}
                >
                  <span className={civicStyles.methodIcon} aria-hidden="true">{m.icon}</span>
                  <span className={civicStyles.methodLabel}>{m.label}</span>
                  <span className={civicStyles.methodDesc}>{m.description}</span>
                  {selectedMethod === m.id && <span className={civicStyles.selectedBadge}>✓ Selected</span>}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className={civicStyles.section} aria-label="Frequently asked questions">
          <h4 className={civicStyles.sectionTitle}>💬 FAQ</h4>
          {currentStep.faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} />
          ))}
        </section>

        <div className={civicStyles.navRow} role="navigation" aria-label="Step navigation">
          <button
            className="btn btn-outline"
            style={{flex: 1}}
            onClick={goPrev}
            disabled={activeStep === 1}
            aria-label="Go to previous step"
          >
            ← Previous
          </button>

          <button
            className="btn btn-primary"
            style={{flex: 1.5}}
            onClick={onMarkComplete}
            aria-label={`Mark step ${currentStep.label} as complete and continue`}
          >
            {currentStep.status === 'completed' ? '✓ Done' : 'Complete Step →'}
          </button>

          <button
            className="btn btn-outline"
            style={{flex: 1}}
            onClick={goNext}
            disabled={activeStep === steps.length}
            aria-label="Go to next step"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
