import type { ChatMessage, ProviderResponse, TestConnectionRequest } from '../../types';

// Global type declarations for browser environment
declare global {
  interface Event {
    type: string;
    target: EventTarget | null;
  }
  interface EventTarget {}
  interface Response {
    ok: boolean;
    status: number;
    statusText: string;
    json(): Promise<any>;
    text(): Promise<string>;
  }
  interface XMLHttpRequest {
    open(method: string, url: string, async?: boolean): void;
    setRequestHeader(name: string, value: string): void;
    send(data?: any): void;
    timeout: number;
    status: number;
    statusText: string;
    responseText: string;
    onload: ((this: XMLHttpRequest, ev: Event) => any) | null;
    onerror: ((this: XMLHttpRequest, ev: Event) => any) | null;
    ontimeout: ((this: XMLHttpRequest, ev: Event) => any) | null;
  }
  const XMLHttpRequest: {
    prototype: XMLHttpRequest;
    new(): XMLHttpRequest;
  };
  interface Console {
    log(...data: any[]): void;
    error(...data: any[]): void;
    warn(...data: any[]): void;
  }
  const console: Console;
  interface URL {
    constructor(url: string, base?: string | URL): URL;
  }
  const URL: {
    prototype: URL;
    new(url: string, base?: string | URL): URL;
  };
}

// XMLHttpRequest-based fetch polyfill for browser/plugin environments
const browserFetch = async (url: string, options: any = {}) => {
  return new Promise<Response>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.open(options.method || 'GET', url, true);
    
    // Set headers
    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        xhr.setRequestHeader(key, value as string);
      }
    }
    
    // Set timeout
    xhr.timeout = 30000;
    
    xhr.onload = () => {
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        json: async () => {
          try {
            const parsed = JSON.parse(xhr.responseText);
            return Promise.resolve(parsed);
          } catch (e) {
            return Promise.reject(new Error('Invalid JSON response'));
          }
        },
        text: async () => Promise.resolve(xhr.responseText)
      } as Response;
      
      resolve(response);
    };
    
    xhr.onerror = (_error: Event) => {
      reject(new Error('Network error'));
    };
    
    xhr.ontimeout = () => {
      reject(new Error('Request timeout'));
    };
    
    // Send request
    if (options.body) {
      xhr.send(options.body);
    } else {
      xhr.send();
    }
  });
};

export abstract class BaseProvider {
  protected apiKey: string;
  protected baseUrl: string;
  protected model: string;
  protected fetch: typeof browserFetch;

  constructor(apiKey: string, baseUrl: string, model: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.fetch = browserFetch;
  }

  abstract getName(): string;
  abstract testConnection(): Promise<boolean>;
  abstract sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<ProviderResponse>;
  
  protected validateApiKey(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 0);
  }

  protected validateBaseUrl(): boolean {
    if (!this.baseUrl) return true; // Base URL is optional for some providers
    try {
      new URL(this.baseUrl);
      return true;
    } catch {
      return false;
    }
  }

  protected formatMessages(messages: ChatMessage[], systemPrompt?: string): any[] {
    const formatted = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.images && msg.images.length > 0 && { images: msg.images })
    }));
    
    // Add system prompt if provided
    if (systemPrompt && systemPrompt.trim()) {
      formatted.unshift({
        role: 'system',
        content: systemPrompt.trim()
      });
    }

    return formatted;
  }

  protected handleError(error: any): ProviderResponse {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return {
      content: `Error: ${errorMessage}`,
      provider: this.getName()
    };
  }
} 