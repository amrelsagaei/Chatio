import { BaseProvider } from './base';
import type { ChatMessage, ProviderResponse } from '../../types';

export class DeepSeekProvider extends BaseProvider {
  private defaultBaseUrl = 'https://api.deepseek.com';

  constructor(apiKey: string, baseUrl?: string, model: string = 'deepseek-chat') {
    super(apiKey, baseUrl || 'https://api.deepseek.com', model);
  }

  getName(): string {
    return 'DeepSeek';
  }

  async testConnection(): Promise<boolean> {
    if (!this.validateApiKey()) {
      return false;
    }

    try {
      // Test with a simple chat completion request
      const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });

      return response.ok;
    } catch (error) {
      console.error('DeepSeek connection test failed:', error);
      return false;
    }
  }

  private formatMessages(messages: ChatMessage[]): any[] {
    return messages.map(message => {
      // Handle messages with images (DeepSeek follows OpenAI format)
      if (message.images && message.images.length > 0) {
        const content = [
          { type: 'text', text: message.content }
        ];
        
        // Add images in OpenAI vision format
        message.images.forEach(image => {
          content.push({
            type: 'image_url',
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
            }
          });
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
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 4000,
        temperature: options?.temperature || 0.7,
        stream: false,
      };

      const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response choices received from DeepSeek');
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('DeepSeek API call failed:', error);
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
      messages: formattedMessages,
      max_tokens: options?.maxTokens || 4000,
      temperature: options?.temperature || 0.7,
      stream: true,
    };

    const response = await this.fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
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
          if (trimmed === '' || trimmed === 'data: [DONE]') continue;
          
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const content = data.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
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