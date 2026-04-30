"use client";

import React from 'react';
import styles from './TrustScoreCard.module.css';

interface TrustMetrics {
  accuracy: number;
  clarity: number;
  biasRisk: number;
  completeness: number;
  recommendation: string;
}

interface TrustScoreCardProps {
  score: number;
  metrics?: TrustMetrics;
}

function MetricRow({ label, value, color, inverse = false }: {
  label: string; value: number; color: string; inverse?: boolean;
}) {
  const displayValue = inverse ? 100 - value : value;
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricInfo}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue}>{displayValue}%</span>
      </div>
      <div className={styles.barOuter}>
        <div 
          className={styles.barInner} 
          style={{ width: `${displayValue}%`, background: color }} 
        />
      </div>
    </div>
  );
}

export default function TrustScoreCard({ score, metrics }: TrustScoreCardProps) {
  const scoreColor = score >= 95 ? 'var(--success)' : score >= 80 ? 'var(--warning)' : 'var(--error)';

  return (
    <div className={`card ${styles.card}`} role="region" aria-label="AI Trust Framework">
      <div className={styles.header}>
        <h2>Trust Analytics</h2>
        <span 
          className={styles.scoreBadge}
          style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
        >
          {score}% Confidence
        </span>
      </div>

      <p className={styles.description}>
        Continuous evaluation of AI-generated guidance across 4 key quality pillars.
      </p>

      {metrics && (
        <div className={styles.metricsList}>
          <MetricRow label="Data Accuracy" value={metrics.accuracy} color="var(--success)" />
          <MetricRow label="Procedural Clarity" value={metrics.clarity} color="var(--primary)" />
          <MetricRow label="Context Completeness" value={metrics.completeness} color="var(--warning)" />
          <MetricRow label="Neutrality (Bias Risk)" value={metrics.biasRisk} color="var(--error)" inverse />
        </div>
      )}

      {metrics?.recommendation && (
        <div className={styles.recommendation}>
          <strong>Next Action:</strong>
          {metrics.recommendation}
        </div>
      )}
    </div>
  );
}
