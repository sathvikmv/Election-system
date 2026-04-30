"use client";

import React from 'react';
import styles from '../app/dashboard/page.module.css';

interface Step {
  id: number;
  label: string;
  status: 'completed' | 'pending' | 'action';
  time?: string;
}

const steps: Step[] = [
  { id: 1, label: 'Registration Status', status: 'completed', time: 'Oct 12' },
  { id: 2, label: 'Voting Method Selected', status: 'completed', time: 'Oct 20' },
  { id: 3, label: 'Ballot Reviewed', status: 'action' },
  { id: 4, label: 'Vote Cast', status: 'pending' },
];

export default function VotingJourney() {
  return (
    <div className="card">
      <h3 className={styles.cardTitle}>🗳 Your Voting Journey</h3>
      <div style={{marginTop: '1.5rem', position: 'relative', paddingLeft: '1.5rem'}}>
        <div style={{position: 'absolute', left: '4px', top: '0', bottom: '0', width: '2px', background: 'var(--border)'}}></div>
        {steps.map((step, idx) => (
          <div key={step.id} style={{marginBottom: '2rem', position: 'relative'}}>
            <div style={{
              position: 'absolute', 
              left: '-24px', 
              top: '4px', 
              width: '12px', 
              height: '12px', 
              borderRadius: '50%', 
              background: step.status === 'completed' ? 'var(--success)' : step.status === 'action' ? 'var(--warning)' : 'var(--border)',
              border: '2px solid var(--surface)'
            }}></div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: step.status === 'pending' ? 'var(--text-tertiary)' : 'var(--text-primary)'
              }}>{step.label}</span>
              {step.time && <span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>{step.time}</span>}
            </div>
            {step.status === 'action' && (
              <div style={{
                marginTop: '0.5rem', 
                padding: '0.4rem 0.6rem', 
                background: 'rgba(210, 153, 34, 0.1)', 
                color: 'var(--warning)', 
                fontSize: '0.75rem', 
                borderRadius: '4px',
                border: '1px solid rgba(210, 153, 34, 0.2)'
              }}>
                Action Needed: Review your sample ballot items.
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{marginTop: '1rem'}}>
        <div style={{height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden'}}>
          <div style={{height: '100%', width: '65%', background: 'var(--primary)'}}></div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem'}}>
          <span style={{fontSize: '0.75rem', color: 'var(--text-tertiary)'}}>Progress</span>
          <span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)'}}>65%</span>
        </div>
      </div>
    </div>
  );
}
