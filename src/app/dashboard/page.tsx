"use client";

import { useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
export const dynamic = 'force-dynamic';
import styles from './page.module.css';

import VotingJourney from '@/components/VotingJourney';
import ElectionInsights from '@/components/ElectionInsights';
import AlertsPanel from '@/components/AlertsPanel';

export default function Dashboard() {
  const { 
    isLoaded, 
    trustScore, 
    userLocation 
  } = useDashboard();

  useEffect(() => {
    console.log("Dashboard: View mounted. Status:", isLoaded ? "Loaded" : "Loading...");
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your civic dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagePadding}>
      <header className={styles.panelHeader} style={{alignItems: 'flex-start'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem'}}>
            <span style={{fontSize: '1.5rem'}}>🗳️</span>
            <h2 style={{fontSize: '1.75rem', fontWeight: 800}}>Election Navigator Dashboard</h2>
          </div>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <span style={{
              fontSize: '0.75rem', 
              padding: '0.2rem 0.6rem', 
              background: 'rgba(63, 185, 80, 0.1)', 
              color: 'var(--success)', 
              borderRadius: '20px', 
              fontWeight: 600,
              border: '1px solid rgba(63, 185, 80, 0.2)'
            }}>
              ● Ready to Vote
            </span>
            <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
              Location: <strong>{userLocation || 'Global (Set in settings)'}</strong>
            </span>
          </div>
        </div>
        <div style={{textAlign: 'right'}}>
          <div style={{
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)',
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <span style={{fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 700}}>Live Trust Score</span>
            <span style={{fontSize: '1.25rem', fontWeight: 800, color: trustScore > 90 ? 'var(--success)' : 'var(--warning)'}}>{trustScore}%</span>
          </div>
        </div>
      </header>

      <div className={styles.dashboardGrid}>
        {/* Left Panel: Voting Journey */}
        <VotingJourney />

        {/* Center Panel: Insights & Guidance */}
        <ElectionInsights />

        {/* Right Panel: Risk & Alerts */}
        <AlertsPanel />
      </div>
    </div>
  );
}
