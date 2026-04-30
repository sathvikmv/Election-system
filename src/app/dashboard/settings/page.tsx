"use client";

import { useDashboard } from '@/context/DashboardContext';
import styles from '../page.module.css';

export default function SettingsPage() {
  const { isLoaded, userLocation, setUserLocation, trustScore } = useDashboard();

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagePadding}>
      <header className={styles.panelHeader}>
        <div>
          <h2>Account & Session Settings</h2>
          <p className="body-small">Manage your localized context and platform preferences.</p>
        </div>
      </header>

      <div className="card">
        <h3 className={styles.cardTitle}>Location Context</h3>
        <p className="body-small" style={{marginBottom: '1rem'}}>
          We use your location to provide specific deadlines and election rules.
        </p>
        <div className={styles.inputWrapper} style={{maxWidth: '400px'}}>
          <input 
            type="text" 
            placeholder="Enter State or Zip Code" 
            value={userLocation || ''} 
            onChange={(e) => setUserLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{marginTop: '2rem'}}>
        <h3 className={styles.cardTitle}>Trust Transparency</h3>
        <p className="body-small">
          Current AI Confidence Level: <strong>{trustScore}%</strong>
        </p>
        <p className="body-small" style={{marginTop: '0.5rem', color: 'var(--text-secondary)'}}>
          The platform monitors all AI outputs for bias and accuracy against official civic data sources.
        </p>
      </div>
    </div>
  );
}
