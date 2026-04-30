"use client";

import React from 'react';

interface RiskAlertProps {
  type: 'confusion' | 'deadline' | 'procedural';
  title: string;
  message: string;
}

export default function RiskAlert({ type, title, message }: RiskAlertProps) {
  const getColor = () => {
    switch (type) {
      case 'deadline': return 'var(--error)';
      case 'confusion': return 'var(--warning)';
      case 'procedural': return 'var(--primary)';
      default: return 'var(--info)';
    }
  };

  const color = getColor();

  return (
    <div style={{ 
      padding: '1rem 1.25rem', 
      borderRadius: 'var(--radius-sm)', 
      background: `${color}10`, 
      border: `1px solid ${color}30`,
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{ marginTop: '0.2rem' }}>
        {type === 'deadline' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        )}
        {type === 'confusion' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        )}
        {type === 'procedural' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        )}
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h4>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</p>
      </div>
    </div>
  );
}
