"use client";

import { useState, useRef, useEffect } from 'react';
import civicStyles from './CivicProcessMap.module.css';
import { StepData } from '@/types';
import StepList from './civic/StepList';
import FAQItem from './civic/FAQItem';

export const INITIAL_STEPS: StepData[] = [
  {
    id: 1,
    label: 'Registration',
    icon: '📋',
    status: 'completed',
    headline: 'Voter Registration — Completed',
    explanation: 'Voter registration is the foundation of the democratic process. You must be registered in order to vote.',
    requiredActions: [
      'Confirm your name matches your government-issued ID',
      'Verify your current address is on file',
      'Check your registration is marked "Active" in your state portal',
    ],
    guidance: '✅ Your registration is verified. Keep your registered address up-to-date.',
    faqs: [
      { q: 'What if I moved recently?', a: 'Update your registration at vote.gov or your state\'s portal.' },
      { q: 'Can I register on Election Day?', a: 'In 22 states and DC, yes — Same-Day Registration (SDR) is available.' },
    ],
  },
  {
    id: 2,
    label: 'Method Choice',
    icon: '🗳️',
    status: 'active',
    headline: 'Select Your Voting Method',
    explanation: 'You have multiple options for casting your vote. Choose the one that fits your schedule.',
    requiredActions: [
      'Review all three voting methods below',
      'Check your jurisdiction\'s deadlines for each method',
      'Select your preferred method and note the date',
    ],
    guidance: '💡 Early voting is the most flexible option for most first-time voters.',
    faqs: [
      { q: 'Can I change my method after choosing?', a: 'Generally yes, but requirements vary by state.' },
      { q: 'Is mail-in voting safe?', a: 'Yes. Mail-in ballots have multiple security layers: unique barcodes and signature verification.' },
    ],
    methods: [
      { id: 'mail', icon: '📮', label: 'Mail-In Voting', description: 'Request your ballot 1–2 weeks before the election.' },
      { id: 'early', icon: '🕐', label: 'Early Voting', description: 'Vote in person at designated sites before Election Day.' },
      { id: 'election-day', icon: '🗓️', label: 'Election Day', description: 'Vote at your assigned polling place on official Election Day.' },
    ],
  },
  {
    id: 3,
    label: 'Ballot Research',
    icon: '🔍',
    status: 'pending',
    headline: 'Research Your Ballot',
    explanation: 'Understanding your ballot before you vote allows you to make informed decisions.',
    requiredActions: [
      'Find your sample ballot at your county election website',
      'Research all candidates for each race',
      'Read the full text of ballot measures and propositions',
    ],
    guidance: '📌 Use Ballotpedia.org for non-partisan ballot information.',
    faqs: [
      { q: 'Do I have to vote in every race?', a: 'No. Leaving a race blank ("undervoting") is legal.' },
      { q: 'Can I bring notes to the polls?', a: 'Yes, in most states you can bring a "cheat sheet".' },
    ],
  },
  {
    id: 4,
    label: 'Voting',
    icon: '✅',
    status: 'pending',
    headline: 'Cast Your Ballot',
    explanation: 'Voting day is your civic moment. Following the correct procedure ensures your vote is counted.',
    requiredActions: [
      'Bring your required ID (check state requirements)',
      'Know your polling place location and hours',
      'Arrive with extra time — allow 15–30 minutes for lines',
    ],
    guidance: '⚠️ If you make a mistake on your ballot, ask a poll worker for a replacement.',
    faqs: [
      { q: 'What if my name is not on the poll book?', a: 'Request a provisional ballot.' },
      { q: 'How long can I wait in line?', a: 'If you are in line before polls close, you have the right to vote.' },
    ],
  },
  {
    id: 5,
    label: 'Verification',
    icon: '🔒',
    status: 'pending',
    headline: 'Verify Your Vote Was Counted',
    explanation: 'After voting, you can track whether your ballot was received and accepted.',
    requiredActions: [
      'Note your ballot tracking ID (mail-in voters)',
      'Visit your state\'s ballot tracking portal within 1–5 days',
    ],
    guidance: '🔒 Most states will notify you by mail or email if your ballot has a problem.',
    faqs: [
      { q: 'What if my ballot is rejected?', a: 'Contact your local election office immediately to "cure" it.' },
      { q: 'When will results be official?', a: 'Certified results typically take 2–4 weeks after all ballots are counted.' },
    ],
  },
];

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

  const goNext = () => { if (activeStep < steps.length) onSelectStep(activeStep + 1); };
  const goPrev = () => { if (activeStep > 1) onSelectStep(activeStep - 1); };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={civicStyles.wrapper} role="main" aria-label="Civic Process Guided Workflow">
      <div className={civicStyles.header}>
        <h2 className={civicStyles.title}>Civic Digital Twin</h2>
        <span className={civicStyles.badge}>{completedCount}/{steps.length} Complete</span>
      </div>

      <div className={civicStyles.progressBarOuter} role="progressbar" aria-valuenow={progressPct}>
        <div className={civicStyles.progressBarInner} style={{ width: `${progressPct}%` }} />
      </div>
      <p className={civicStyles.progressLabel}>{progressPct}% complete</p>

      <StepList steps={steps} activeStep={activeStep} onSelectStep={onSelectStep} />

      <div ref={detailRef} className={civicStyles.detailPanel} aria-live="polite">
        <div className={civicStyles.detailHeader}>
          <span className={civicStyles.detailStepIcon}>{currentStep.icon}</span>
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
                <span className={civicStyles.actionBullet}>→</span>
                {action}
              </li>
            ))}
          </ul>
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
                >
                  <span className={civicStyles.methodIcon}>{m.icon}</span>
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

        <div className={civicStyles.navRow}>
          <button className="btn btn-outline" style={{flex: 1}} onClick={goPrev} disabled={activeStep === 1}>
            ← Back
          </button>
          <button className="btn btn-primary" style={{flex: 1.5}} onClick={onMarkComplete}>
            {currentStep.status === 'completed' ? '✓ Done' : 'Complete Step →'}
          </button>
          <button className="btn btn-outline" style={{flex: 1}} onClick={goNext} disabled={activeStep === steps.length}>
            Skip →
          </button>
        </div>
      </div>
    </div>
  );
}
