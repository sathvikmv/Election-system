"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, loadSession } from '@/lib/firebase';
import { StepData, INITIAL_STEPS } from '@/components/CivicProcessMap';
import { ChatMessage, TrustMetrics } from '@/types';

interface DashboardContextType {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  isTyping: boolean;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
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
  handleSendMessage: (e?: React.FormEvent) => Promise<void>;
  handleSelectStep: (id: number) => void;
  handleMarkComplete: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'bot',
      content: 'Hello! I am your AI Civic Assistant. I can help you navigate registration, ballot research, and voting procedures. How can I assist you today?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
          if (data.messages) setMessages(data.messages as ChatMessage[]);
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
        messages, steps, activeStep, userLocation, trustScore, trustMetrics
      });
    };
    const timer = setTimeout(save, 3000);
    return () => clearTimeout(timer);
  }, [messages, steps, activeStep, userLocation, trustScore, trustMetrics, sessionId, isLoaded]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageToSend = inputValue.trim();
    if (!messageToSend || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageToSend, 
          history: messages, 
          context: { location: userLocation, activeStep } 
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.reply || data.error || "Failed to get response");
      }
      
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'bot', 
        content: data.reply 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error("DashboardContext: Chat error", err);
      const errorMsg: ChatMessage = { 
        id: Date.now().toString(), 
        role: 'bot', 
        content: `I'm sorry, I encountered an issue: ${err.message}. Please try again.` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages, userLocation, activeStep]);

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
    messages, setMessages,
    inputValue, setInputValue,
    isTyping, setIsTyping,
    trustScore, setTrustScore,
    trustMetrics, setTrustMetrics,
    steps, setSteps,
    activeStep, setActiveStep,
    userLocation, setUserLocation,
    isLoaded,
    handleSendMessage,
    handleSelectStep,
    handleMarkComplete
  }), [
    messages, inputValue, isTyping, trustScore, trustMetrics, steps, 
    activeStep, userLocation, isLoaded, handleSendMessage, handleSelectStep, handleMarkComplete
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
