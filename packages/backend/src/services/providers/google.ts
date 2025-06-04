import { BaseProvider } from './base';
import type { ChatMessage, ProviderResponse } from '../../types';

export class GoogleProvider extends BaseProvider {
  private defaultBaseUrl = 'https://generativelanguage.googleapis.com';

  constructor(apiKey: string, baseUrl?: string, model: string = 'gemini-2.0-flash') {
    super(apiKey, baseUrl || 'https://generativelanguage.googleapis.com', model);
  }

  getName(): string {
    return 'Google';
  }

  async testConnection(): Promise<boolean> {
    if (!this.validateApiKey()) {
      return false;
    }

    try {
      const response = await this.fetch(
        `${this.baseUrl}/v1beta/models?key=${this.apiKey}`,
        {
          method: 'GET',
        }
      );

      return response.ok;
    } catch (error) {
      console.error('Google connection test failed:', error);
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(message => {
      // Handle messages with images
      if (message.images && message.images.length > 0) {
        const parts = [
          { text: message.content }
        ];
        
        // Add images in Gemini format
        message.images.forEach(image => {
          if (image.startsWith('data:')) {
            // Extract mime type and data from data URL
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              parts.push({
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              });
            }
          } else {
            // Assume it's base64 image data
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: image
              }
            });
          }
        });
        
        return {
          role: message.role,
          parts: parts
        };
      }
      
      // Regular text-only message
      return {
        role: message.role,
        parts: [{ text: message.content }]
      };
    });
  }

  private convertToGeminiFormat(messages: ChatMessage[]): any {
    const formattedMessages = this.formatMessages(messages);
    
    // Gemini uses 'contents' array instead of 'messages'
    const contents = formattedMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: msg.parts
    }));

    return { contents };
  }

  async sendMessage(messages: ChatMessage[], options?: any): Promise<ProviderResponse> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid API key');
    }

    try {
      const requestBody = this.convertToGeminiFormat(messages);
      
      // Add generation config
      requestBody.generationConfig = {
        maxOutputTokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
      };

      const response = await this.fetch(
        `${this.baseUrl}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response candidates received from Google');
      }

      const candidate = data.candidates[0];
      const content = candidate.content?.parts?.[0]?.text || '';

      return {
        content,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Google API call failed:', error);
      throw error;
    }
  }

  async streamMessage(messages: ChatMessage[], options?: any): Promise<AsyncIterable<string>> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid API key');
    }

    const requestBody = this.convertToGeminiFormat(messages);
    
    // Add generation config
    requestBody.generationConfig = {
      maxOutputTokens: options?.maxTokens || 4000,
      temperature: options?.temperature || 0.7,
    };

    const response = await this.fetch(
      `${this.baseUrl}/v1beta/models/${this.model}:streamGenerateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    return this.handleStreamResponse(response);
  }

  private async *handleStreamResponse(response: Response): AsyncIterable<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === '' || !trimmed.startsWith('{')) continue;
          
          try {
            const data = JSON.parse(trimmed);
            const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) {
              yield content;
            }
          } catch (error) {
            console.error('Error parsing streaming data:', error);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
} 