"use client";

import { useDashboard } from '@/context/DashboardContext';
import CivicProcessMap from '@/components/CivicProcessMap';
import styles from '../page.module.css';

export default function CivicProcessPage() {
  const { isLoaded, steps, activeStep, handleSelectStep, handleMarkComplete } = useDashboard();

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Civic Process map...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagePadding}>
      <header className={styles.panelHeader}>
        <div>
          <h2>Civic Process Digital Twin</h2>
          <p className="body-small">Your personalized, state-aware roadmap to participation.</p>
        </div>
      </header>

      <div className="card">
        <CivicProcessMap 
          steps={steps} 
          activeStep={activeStep} 
          onSelectStep={handleSelectStep}
          onMarkComplete={handleMarkComplete}
        />
      </div>
      
      <div className="card" style={{marginTop: '2rem'}}>
        <h3 className={styles.cardTitle}>About the Process Twin</h3>
        <p className="body-small" style={{color: 'var(--text-secondary)'}}>
          This interactive map represents the official election process tailored to your status. 
          Each node is verified against current election laws and procedural requirements.
        </p>
      </div>
    </div>
  );
}
