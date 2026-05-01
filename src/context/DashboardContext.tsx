"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, loadSession } from '@/lib/firebase';
import { StepData, INITIAL_STEPS } from '@/components/CivicProcessMap';
import { TrustMetrics } from '@/types';

interface DashboardContextType {
  trustScore: number;
  setTrustScore: React.Dispatch<React.SetStateAction<number>>;
  trustMetrics: TrustMetrics | undefined;
  setTrustMetrics: React.Dispatch<React.SetStateAction<TrustMetrics | undefined>>;
  steps: StepData[];
  setSteps: React.Dispatch<React.SetStateAction<StepData[]>>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  userLocation: string | null;
  setUserLocation: React.Dispatch<React.SetStateAction<string | null>>;
  isLoaded: boolean;
  handleSelectStep: (id: number) => void;
  handleMarkComplete: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [trustScore, setTrustScore] = useState(98);
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics | undefined>({
    accuracy: 99,
    clarity: 97,
    biasRisk: 2,
    completeness: 95,
    recommendation: "System operating within optimal parameters."
  });

  const [steps, setSteps] = useState<StepData[]>(INITIAL_STEPS);
  const [activeStep, setActiveStep] = useState<number>(2);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const loadingRef = useRef(false);

  // Initial Load
  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    let sId = localStorage.getItem('election_session_id');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('election_session_id', sId);
    }
    setSessionId(sId);

    const init = async () => {
      try {
        const data = await loadSession(sId!) as Record<string, any>;
        if (data) {
          if (data.steps) setSteps(data.steps as StepData[]);
          if (data.activeStep) setActiveStep(data.activeStep as number);
          if (data.userLocation) setUserLocation(data.userLocation as string);
          if (data.trustScore) setTrustScore(data.trustScore as number);
          if (data.trustMetrics) setTrustMetrics(data.trustMetrics as TrustMetrics);
        }
      } catch (err) {
        console.error("DashboardContext: Error loading session", err);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  // Auto-save changes (Debounced)
  useEffect(() => {
    if (!sessionId || !isLoaded) return;
    
    const save = async () => {
      await saveSession(sessionId, {
        steps, activeStep, userLocation, trustScore, trustMetrics
      });
    };
    const timer = setTimeout(save, 3000);
    return () => clearTimeout(timer);
  }, [steps, activeStep, userLocation, trustScore, trustMetrics, sessionId, isLoaded]);

  const handleSelectStep = useCallback((id: number) => {
    setActiveStep(id);
    setSteps(prev => prev.map(s => ({
      ...s,
      status: s.id < id ? 'completed' : s.id === id ? 'active' : s.status === 'completed' ? 'completed' : 'pending'
    })));
  }, []);

  const handleMarkComplete = useCallback(() => {
    setSteps(prev => prev.map(s => s.id === activeStep ? { ...s, status: 'completed' } : s));
    if (activeStep < steps.length) handleSelectStep(activeStep + 1);
  }, [activeStep, steps.length, handleSelectStep]);

  const contextValue = useMemo(() => ({
    trustScore, setTrustScore,
    trustMetrics, setTrustMetrics,
    steps, setSteps,
    activeStep, setActiveStep,
    userLocation, setUserLocation,
    isLoaded,
    handleSelectStep,
    handleMarkComplete
  }), [
    trustScore, trustMetrics, steps, activeStep, userLocation, isLoaded, 
    handleSelectStep, handleMarkComplete
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
