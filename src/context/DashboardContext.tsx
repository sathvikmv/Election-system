"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveSession, loadSession } from '@/lib/firebase';
import { StepData, INITIAL_STEPS } from '@/components/CivicProcessMap';

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

interface TrustMetrics {
  accuracy: number;
  clarity: number;
  biasRisk: number;
  completeness: number;
  recommendation: string;
}

interface DashboardContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
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
  const [messages, setMessages] = useState<Message[]>([
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

    console.log("DashboardContext: Initializing session...");
    let sId = localStorage.getItem('election_session_id');
    if (!sId) {
      sId = uuidv4();
      localStorage.setItem('election_session_id', sId);
    }
    setSessionId(sId);

    const init = async () => {
      try {
        const data = await loadSession(sId!);
        if (data) {
          console.log("DashboardContext: Session loaded", sId);
          if (data.messages) setMessages(data.messages);
          if (data.steps) setSteps(data.steps);
          if (data.activeStep) setActiveStep(data.activeStep);
          if (data.userLocation) setUserLocation(data.userLocation);
          if (data.trustScore) setTrustScore(data.trustScore);
          if (data.trustMetrics) setTrustMetrics(data.trustMetrics);
        } else {
          console.log("DashboardContext: No existing session found, starting fresh.");
        }
      } catch (err) {
        console.error("DashboardContext: Error loading session", err);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  // Save changes
  useEffect(() => {
    if (!sessionId || !isLoaded) return;
    
    const save = async () => {
      console.log("DashboardContext: Auto-saving session...");
      await saveSession(sessionId, {
        messages, steps, activeStep, userLocation, trustScore, trustMetrics
      });
    };
    const timer = setTimeout(save, 3000);
    return () => clearTimeout(timer);
  }, [messages, steps, activeStep, userLocation, trustScore, trustMetrics, sessionId, isLoaded]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputValue, history: messages, context: { location: userLocation, activeStep } })
      });
      const data = await res.json();
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', content: data.reply || "Error." };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("DashboardContext: Chat error", err);
      const errorMsg: Message = { id: Date.now().toString(), role: 'bot', content: "I'm having trouble connecting right now. Please try again later." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectStep = (id: number) => {
    setActiveStep(id);
    setSteps(prev => prev.map(s => ({
      ...s,
      status: s.id < id ? 'completed' : s.id === id ? 'active' : s.status === 'completed' ? 'completed' : 'pending'
    })));
  };

  const handleMarkComplete = () => {
    setSteps(prev => prev.map(s => s.id === activeStep ? { ...s, status: 'completed' } : s));
    if (activeStep < steps.length) handleSelectStep(activeStep + 1);
  };

  return (
    <DashboardContext.Provider value={{
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
    }}>
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
