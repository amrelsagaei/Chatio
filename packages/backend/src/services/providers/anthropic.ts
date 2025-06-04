import { BaseProvider } from './base';
import type { ChatMessage, ProviderResponse } from '../../types';

export class AnthropicProvider extends BaseProvider {
  private defaultBaseUrl = 'https://api.anthropic.com';

  constructor(apiKey: string, baseUrl?: string, model: string = 'claude-3-5-sonnet-20241022') {
    super(apiKey, baseUrl || 'https://api.anthropic.com', model);
  }

  getName(): string {
    return 'Anthropic';
  }

  async testConnection(): Promise<boolean> {
    if (!this.validateApiKey()) {
      return false;
    }

    try {
      // Test with a simple message request
      const response = await this.fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hi'
            }
          ]
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(message => {
      // Handle messages with images
      if (message.images && message.images.length > 0) {
        const content = [];
        
        // Add images first (recommended by Anthropic)
        message.images.forEach(image => {
          if (image.startsWith('data:')) {
            // Extract mime type and data from data URL
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              content.push({
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: matches[1],
                  data: matches[2]
                }
              });
            }
          } else {
            // Assume it's base64 image data
            content.push({
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image
              }
            });
          }
        });
        
        // Add text content
        content.push({
          type: 'text',
          text: message.content
        });
        
        return {
          role: message.role,
          content: content
        };
      }
      
      // Regular text-only message
      return {
        role: message.role,
        content: message.content
      };
    });
  }

  async sendMessage(messages: ChatMessage[], options?: any): Promise<ProviderResponse> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid API key');
    }

    try {
      const formattedMessages = this.formatMessages(messages);
      
      const requestBody = {
        model: this.model,
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
        messages: formattedMessages,
        stream: false,
      };

      const response = await this.fetch(`${this.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.content || data.content.length === 0) {
        throw new Error('No content received from Anthropic');
      }

      const content = data.content.map((item: any) => item.text).join('');

      return {
        content,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      console.error('Anthropic API call failed:', error);
      throw error;
    }
  }

  async streamMessage(messages: ChatMessage[], options?: any): Promise<AsyncIterable<string>> {
    if (!this.validateApiKey()) {
      throw new Error('Invalid API key');
    }

    const formattedMessages = this.formatMessages(messages);
    
    const requestBody = {
      model: this.model,
      max_tokens: options?.maxTokens || 4000,
      temperature: options?.temperature || 0.7,
      messages: formattedMessages,
      stream: true,
    };

    const response = await this.fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
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
          if (trimmed === '' || trimmed.startsWith(':')) continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              
              if (data.type === 'content_block_delta' && data.delta?.text) {
                yield data.delta.text;
              }
            } catch (error) {
              console.error('Error parsing SSE data:', error);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
} 