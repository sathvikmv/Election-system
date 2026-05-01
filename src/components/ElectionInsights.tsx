"use client";

import React from 'react';
import styles from '../app/dashboard/page.module.css';
import dynamic from 'next/dynamic';
import Skeleton from './ui/Skeleton';

const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <Skeleton height="160px" borderRadius="12px" />
});

export default function ElectionInsights() {
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      {/* Upcoming Election Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(47, 129, 247, 0.05) 100%)',
        border: '1px solid rgba(47, 129, 247, 0.2)'
      }}>
        <h3 className={styles.cardTitle}>📍 Next Election in Your Area</h3>
        <div style={{marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <div>
            <h4 style={{fontSize: '1.25rem', fontWeight: 700}}>2026 General Elections</h4>
            <p className="body-small" style={{color: 'var(--text-secondary)'}}>National & State Assembly</p>
          </div>
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)'}}>12:04:45</div>
            <p className="body-small" style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase'}}>Countdown to Polls</p>
          </div>
        </div>
        <div style={{marginTop: '1.5rem', display: 'flex', gap: '0.5rem'}}>
          <span style={{padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem'}}>📅 Nov 05, 2026</span>
          <span style={{padding: '0.2rem 0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', fontSize: '0.75rem'}}>🏛️ 543 Seats</span>
        </div>
      </div>

      {/* Polling Information */}
      <div className="card">
        <h3 className={styles.cardTitle}>🏢 Polling Information</h3>
        <div style={{marginTop: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start'}}>
          <div style={{ flex: '0 0 160px', width: '160px' }}>
            <MapView />
          </div>
          <div style={{flex: 1}}>
            <h4 style={{fontSize: '0.95rem', fontWeight: 600}}>Govt. Senior Secondary School</h4>
            <p className="body-small" style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem'}}>
              Room 4, Sector 12, Main City Road.<br/>
              Distance: 1.2 km from your home.
            </p>
            <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
              <div>
                <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block'}}>OPENS</span>
                <span style={{fontSize: '0.85rem', fontWeight: 600}}>07:00 AM</span>
              </div>
              <div>
                <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block'}}>CLOSES</span>
                <span style={{fontSize: '0.85rem', fontWeight: 600}}>06:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Instructions */}
      <div className="card">
        <h3 className={styles.cardTitle}>📋 Election Day Checklist</h3>
        <ul style={{marginTop: '1rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <li style={{display: 'flex', gap: '0.75rem', fontSize: '0.9rem'}}>
            <span style={{color: 'var(--success)'}}>✓</span>
            <span>Carry original Voter ID or Aadhar Card.</span>
          </li>
          <li style={{display: 'flex', gap: '0.75rem', fontSize: '0.9rem'}}>
            <span style={{color: 'var(--success)'}}>✓</span>
            <span>Check your name in the Voter List again.</span>
          </li>
          <li style={{display: 'flex', gap: '0.75rem', fontSize: '0.9rem'}}>
            <span style={{color: 'var(--success)'}}>✓</span>
            <span>Reach at least 15 minutes before closing.</span>
          </li>
          <li style={{display: 'flex', gap: '0.75rem', fontSize: '0.9rem'}}>
            <span style={{color: 'var(--success)'}}>✓</span>
            <span>No cellphones allowed inside polling booth.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
