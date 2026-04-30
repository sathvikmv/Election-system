/**
 * Component tests for TrustScoreCard and RiskAlert.
 * Tests rendering, props, ARIA, and visual states.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrustScoreCard from '../../src/components/TrustScoreCard';
import RiskAlert from '../../src/components/RiskAlert';

// ─── TrustScoreCard ───────────────────────────────────────────────────────────

describe('TrustScoreCard', () => {
  const metrics = {
    accuracy: 96,
    clarity: 94,
    biasRisk: 4,
    completeness: 91,
    recommendation: 'System operating within optimal parameters.',
  };

  it('renders without crashing', () => {
    expect(() => render(<TrustScoreCard score={98} />)).not.toThrow();
  });

  it('displays the trust score percentage', () => {
    render(<TrustScoreCard score={98} />);
    expect(screen.getByText(/98% Quality/)).toBeInTheDocument();
  });

  it('has correct aria-label region', () => {
    render(<TrustScoreCard score={98} />);
    expect(screen.getByRole('region', { name: /AI Trust Framework/i })).toBeInTheDocument();
  });

  it('renders accuracy bar when metrics provided', () => {
    render(<TrustScoreCard score={98} metrics={metrics} />);
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('96%')).toBeInTheDocument();
  });

  it('renders clarity bar when metrics provided', () => {
    render(<TrustScoreCard score={98} metrics={metrics} />);
    expect(screen.getByText('Clarity')).toBeInTheDocument();
    expect(screen.getByText('94%')).toBeInTheDocument();
  });

  it('renders completeness bar when metrics provided', () => {
    render(<TrustScoreCard score={98} metrics={metrics} />);
    expect(screen.getByText('Completeness')).toBeInTheDocument();
    expect(screen.getByText('91%')).toBeInTheDocument();
  });

  it('renders bias risk bar when metrics provided', () => {
    render(<TrustScoreCard score={98} metrics={metrics} />);
    expect(screen.getByText('Bias Risk')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
  });

  it('renders recommendation text', () => {
    render(<TrustScoreCard score={98} metrics={metrics} />);
    expect(screen.getByText(/optimal parameters/i)).toBeInTheDocument();
  });

  it('renders without metrics (minimal props)', () => {
    render(<TrustScoreCard score={75} />);
    expect(screen.getByText(/75% Quality/)).toBeInTheDocument();
    expect(screen.queryByText('Accuracy')).not.toBeInTheDocument();
  });

  it('renders score 0%', () => {
    render(<TrustScoreCard score={0} />);
    expect(screen.getByText(/0% Quality/)).toBeInTheDocument();
  });

  it('renders score 100%', () => {
    render(<TrustScoreCard score={100} />);
    expect(screen.getByText(/100% Quality/)).toBeInTheDocument();
  });

  it('renders Trust Reporting Agent mention', () => {
    render(<TrustScoreCard score={95} />);
    expect(screen.getByText(/Trust Reporting Agent/i)).toBeInTheDocument();
  });

  it('aria-label on score includes percentage', () => {
    render(<TrustScoreCard score={88} />);
    const scoreEl = screen.getByLabelText(/Trust score 88 percent/i);
    expect(scoreEl).toBeInTheDocument();
  });
});

// ─── RiskAlert ───────────────────────────────────────────────────────────────

describe('RiskAlert', () => {
  it('renders without crashing', () => {
    expect(() =>
      render(<RiskAlert type="deadline" title="Deadline" message="Test message" />)
    ).not.toThrow();
  });

  it('displays the title', () => {
    render(<RiskAlert type="deadline" title="Registration Closing" message="Act now" />);
    expect(screen.getByText('Registration Closing')).toBeInTheDocument();
  });

  it('displays the message', () => {
    render(<RiskAlert type="confusion" title="Alert" message="ID requirement misunderstood" />);
    expect(screen.getByText('ID requirement misunderstood')).toBeInTheDocument();
  });

  it('renders deadline alert icon', () => {
    render(<RiskAlert type="deadline" title="T" message="M" />);
    expect(screen.getByText('⏰')).toBeInTheDocument();
  });

  it('renders confusion alert icon', () => {
    render(<RiskAlert type="confusion" title="T" message="M" />);
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('renders procedural alert icon', () => {
    render(<RiskAlert type="procedural" title="T" message="M" />);
    expect(screen.getByText('⚖️')).toBeInTheDocument();
  });

  it('renders all three alert types without crashing', () => {
    (['deadline', 'confusion', 'procedural'] as const).forEach(type => {
      expect(() => render(<RiskAlert type={type} title="T" message="M" />)).not.toThrow();
    });
  });

  it('renders long message without truncation', () => {
    const long = 'A'.repeat(500);
    render(<RiskAlert type="deadline" title="T" message={long} />);
    expect(screen.getByText(long)).toBeInTheDocument();
  });
});
