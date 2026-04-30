"use client";

import { useDashboard } from '@/context/DashboardContext';
import { generateGuidanceReport } from '@/lib/pdfGenerator';
import styles from '../page.module.css';

export default function ReportsPage() {
  const { isLoaded } = useDashboard();

  if (!isLoaded) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Reports...</p>
      </div>
    );
  }

  return (
    <div className={styles.pagePadding}>
      <header className={styles.panelHeader}>
        <div>
          <h2>Civic Guidance Reports</h2>
          <p className="body-small">Download and export your personalized guidance.</p>
        </div>
      </header>

      <div className="card" id="pdf-content">
        <h3 className={styles.cardTitle}>Available Reports</h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-alt)'}}>
            <div>
              <h4 style={{fontSize: '0.95rem', fontWeight: 600}}>Personalized Election Roadmap</h4>
              <p className="body-small">Includes deadlines, registration status, and ballot research tips.</p>
            </div>
            <button className="btn btn-primary" onClick={() => generateGuidanceReport('pdf-content')}>
              Download PDF
            </button>
          </div>
          
          <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-alt)', opacity: 0.7}}>
            <div>
              <h4 style={{fontSize: '0.95rem', fontWeight: 600}}>Ballot Analysis Summary</h4>
              <p className="body-small">Coming soon: A summary of your researched ballot items.</p>
            </div>
            <button className="btn btn-outline" disabled>
              Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
