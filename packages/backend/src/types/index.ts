export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: FileAttachment[];
  images?: string[]; // Base64 encoded images or data URLs
}

export interface FileAttachment {
  name: string;
  type: string;
  content: string;
  size?: number;
}

export interface ChatSettings {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface ProviderResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  provider?: string;
}

export interface TestConnectionRequest {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface SendMessageRequest {
  messages: ChatMessage[];
  settings: ChatSettings;
}

// Provider configurations
export interface ProviderConfig {
  name: string;
  baseUrl: string;
  models: string[];
  requiresApiKey: boolean;
  supportedFeatures: string[];
} 