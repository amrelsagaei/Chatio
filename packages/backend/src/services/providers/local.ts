import { BaseProvider } from './base';
import type { ChatMessage, ProviderResponse } from '../../types';

export class LocalProvider extends BaseProvider {
  constructor(apiKey: string = '', baseUrl: string = 'http://localhost:1234/v1', model: string = 'local-model') {
    super(apiKey, baseUrl, model);
  }

  getName(): string {
    return 'Local LLM';
  }

  async testConnection(): Promise<boolean> {
    try {
      // For local models, we don't always need an API key
      const headers: any = {
        'Content-Type': 'application/json'
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await this.fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers
      });

      return response.ok;
    } catch (error) {
      console.error('Local LLM connection test failed:', error);
      return false;
    }
  }

  async sendMessage(messages: ChatMessage[], systemPrompt?: string): Promise<ProviderResponse> {
    try {
      const formattedMessages = this.formatMessages(messages, systemPrompt);
      
      const requestBody: any = {
        model: this.model,
        messages: formattedMessages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      };

      const headers: any = {
        'Content-Type': 'application/json'
      };

      // Add authorization header if API key is provided
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      if (!choice) {
        throw new Error('No response received from Local LLM');
      }

      return {
        content: choice.message.content,
        usage: data.usage,
        model: data.model || this.model,
        provider: this.getName()
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 