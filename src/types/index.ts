export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  content: string;
}

export interface ChatContext {
  location?: string | null;
  activeStep?: number | string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  context: ChatContext;
}

export interface ChatResponse {
  reply: string;
  error?: string;
}

export interface TrustMetrics {
  accuracy: number;
  clarity: number;
  biasRisk: number;
  completeness: number;
  recommendation: string;
}

export type StepStatus = 'completed' | 'active' | 'pending';

export interface FAQ {
  q: string;
  a: string;
}

export interface MethodOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface StepData {
  id: number;
  label: string;
  icon: string;
  status: StepStatus;
  headline: string;
  explanation: string;
  requiredActions: string[];
  guidance: string;
  faqs: FAQ[];
  methods?: MethodOption[];
}
