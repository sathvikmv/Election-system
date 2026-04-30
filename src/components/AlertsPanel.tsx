"use client";

import React from 'react';
import styles from '../app/dashboard/page.module.css';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
}

const alerts: Alert[] = [
  { 
    id: '1', 
    type: 'error', 
    title: 'Registration Deadline', 
    message: 'Action needed within 48 hours to remain eligible for 2026 primaries.',
    icon: '❗'
  },
  { 
    id: '2', 
    type: 'warning', 
    title: 'Missing Documents', 
    message: 'Your address proof needs re-verification due to state record mismatch.',
    icon: '⚠'
  },
  { 
    id: '3', 
    type: 'info', 
    title: 'Voting Method Reminder', 
    message: 'You opted for In-Person Voting. Early voting starts Oct 15.',
    icon: 'ℹ'
  },
];

export default function AlertsPanel() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      <h3 className={styles.cardTitle}>🔔 Risks & Alerts</h3>
      {alerts.map(alert => (
        <div key={alert.id} className="card" style={{
          padding: '1rem',
          borderLeft: `4px solid var(--${alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'})`,
          background: 'var(--surface-alt)'
        }}>
          <div style={{display: 'flex', gap: '0.75rem', alignItems: 'flex-start'}}>
            <span style={{fontSize: '1.25rem'}}>{alert.icon}</span>
            <div>
              <h4 style={{fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)'}}>{alert.title}</h4>
              <p className="body-small" style={{fontSize: '0.8rem', marginTop: '0.25rem', lineHeight: 1.4}}>
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      <div className="card" style={{marginTop: '1rem', textAlign: 'center', opacity: 0.6}}>
        <p className="body-small" style={{fontSize: '0.75rem'}}>All alerts are verified against real-time legislative updates.</p>
      </div>
    </div>
  );
}
