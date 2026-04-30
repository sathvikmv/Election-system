"use client";

import Link from 'next/link';
import styles from './landing.module.css';
import { GeminiLogo, FirebaseLogo, BigQueryLogo, CloudRunLogo, VertexAILogo } from '@/components/TechLogos';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="heading-2" style={{fontSize: '1.25rem', fontWeight: 700}}>Election Navigator AI</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#technology">Technology</a>
          <Link href="/dashboard" className="btn btn-primary">
            Launch Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <div className="animate-up">
            <span className={styles.badge}>Next-Gen Civic Platform</span>
            <h1 className="display-1">
              Navigate Elections with <span className="gradient-text">Absolute Trust</span>
            </h1>
            <p className="body-large" style={{ maxWidth: '600px', margin: '1.5rem auto' }}>
              The AI-powered "Digital Twin" of the election process. Get personalized guidance, 
              verify deadlines, and explore scenarios with real-time risk monitoring.
            </p>
            <div className={styles.heroActions}>
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                Get Started Now
              </Link>
              <a href="#features" className="btn btn-outline" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
                Explore Features
              </a>
            </div>
          </div>
        </div>
        <div className={`${styles.heroImage} animate-up delay-1`}>
          <div className={styles.dashboardPreview}>
            <div className={styles.previewHeader}>
              <div className={styles.dots}><span></span><span></span><span></span></div>
              <div className={styles.addressBar}>election-navigator.ai/dashboard</div>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.previewSidebar}>
                <div className={styles.sidebarItem}></div>
                <div className={styles.sidebarItem} style={{width: '70%'}}></div>
                <div className={styles.sidebarItem} style={{width: '90%'}}></div>
                <div className={styles.sidebarItem} style={{width: '60%'}}></div>
                <div style={{marginTop: 'auto', height: '20px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px'}}></div>
              </div>
              <div className={styles.previewMain}>
                {/* Voting Journey Simulation */}
                <div className={styles.previewCard}>
                  <div className={styles.cardHeader} style={{width: '80%'}}>Journey Progress</div>
                  <div className={styles.journeyStep}><span className={styles.stepDot} style={{background: 'var(--success)'}}></span><div className={styles.stepLine}></div></div>
                  <div className={styles.journeyStep}><span className={styles.stepDot} style={{background: 'var(--success)'}}></span><div className={styles.stepLine}></div></div>
                  <div className={styles.journeyStep}><span className={styles.stepDot} style={{background: 'var(--warning)'}}></span><div className={styles.stepLine}></div></div>
                  <div className={styles.journeyStep}><span className={styles.stepDot}></span></div>
                </div>
                {/* Insights Simulation */}
                <div className={styles.previewCard} style={{background: 'rgba(47, 129, 247, 0.08)'}}>
                  <div className={styles.cardHeader} style={{background: 'var(--primary)', opacity: 0.4}}>Next Election</div>
                  <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0'}}>12 : 04 : 45</div>
                  <div style={{display: 'flex', gap: '4px'}}>
                    <div className={styles.miniChart} style={{height: '30px'}}></div>
                    <div className={styles.miniChart} style={{height: '50px'}}></div>
                    <div className={styles.miniChart} style={{height: '40px'}}></div>
                  </div>
                </div>
                {/* Alerts Simulation */}
                <div className={styles.previewCard}>
                  <div className={styles.cardHeader}>Alerts</div>
                  <div className={styles.alertItem} style={{borderLeftColor: 'var(--error)'}}></div>
                  <div className={styles.alertItem} style={{borderLeftColor: 'var(--warning)'}}></div>
                  <div className={styles.alertItem} style={{borderLeftColor: 'var(--info)'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="heading-1">Engineered for Transparency</h2>
            <p className="body-large">Built with Google's most advanced AI to ensure every citizen has access to trusted election data.</p>
          </div>

          <div className={styles.featureGrid}>
            <div className="card animate-up">
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Civic Process Twin</h3>
              <p>An interactive, state-aware map of your entire voting journey, from registration to verification.</p>
            </div>

            <div className="card animate-up delay-1">
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>AI Copilot (Gemini)</h3>
              <p>Hyper-localized guidance powered by Gemini 2.5 Pro, trained to provide neutral, accurate civic data.</p>
            </div>

            <div className="card animate-up delay-2">
              <div className={styles.featureIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Risk Monitoring</h3>
              <p>Real-time detection of deadline risks and procedural confusion to prevent disenfranchisement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="technology" className={styles.techSection}>
        <div className="container">
          <div className={styles.techContent}>
            <div className={styles.techText}>
              <h2 className="heading-1">Powered by Google Cloud</h2>
              <p className="body-large">We leverage the most robust cloud infrastructure to ensure 100% uptime and data integrity during high-stakes election cycles.</p>
              <ul className={styles.techList}>
                <li><strong>Gemini 2.5 Pro:</strong> Advanced reasoning for complex election laws.</li>
                <li><strong>Firebase Firestore:</strong> Real-time session persistence for voter progress.</li>
                <li><strong>BigQuery:</strong> Secure, anonymized analytics for system optimization.</li>
                <li><strong>Cloud Run:</strong> Highly scalable, secure backend processing.</li>
              </ul>
            </div>
            <div className={styles.techLogos}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <GeminiLogo />
                <FirebaseLogo />
                <BigQueryLogo />
                <CloudRunLogo />
                <VertexAILogo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerInfo}>
              <div className={styles.logo} style={{marginBottom: '1rem'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span style={{fontWeight: 700}}>Election Navigator AI</span>
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                Empowering citizens through trusted AI guidance. Built for global civic engagement and transparent democracy.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <div>
                <h4>Platform</h4>
                <Link href="/dashboard">Dashboard</Link>
                <a href="#features">Features</a>
              </div>
              <div>
                <h4>Resources</h4>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Terms of Use</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2026 Election Navigator AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TechLogos() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      <GeminiLogo />
      <FirebaseLogo />
      <BigQueryLogo />
      <CloudRunLogo />
      <VertexAILogo />
    </div>
  );
}
