import type { FrontendSDK } from '@/types';

// Types matching the backend
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  files?: {
    name: string;
    type: string;
    content: string;
  }[];
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
  maxMessages?: number; // Add context message limit
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: any; // Add data property for additional response data
}

export interface ProviderResponse {
  content: string;
  provider?: string;
  usage?: any;
  model?: string;
}

export interface TestConnectionRequest {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  models?: string; // Add models field for local/Ollama provider
}

export interface SendMessageRequest {
  messages: ChatMessage[];
  settings: ChatSettings;
}

/**
 * API Service for Chatio
 * 
 * Implements the following APIs according to official documentation:
 * 
 * 1. OpenAI API (https://platform.openai.com/docs/api-reference)
 *    - Base URL: https://api.openai.com/v1
 *    - Auth: Bearer token in Authorization header
 *    - Endpoint: /chat/completions
 *    - Models: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
 *    - Supports vision with image_url content type
 * 
 * 2. Anthropic Claude API (https://docs.anthropic.com/en/api/overview)
 *    - Base URL: https://api.anthropic.com
 *    - Auth: x-api-key header
 *    - Version: anthropic-version: 2023-06-01
 *    - Endpoint: /v1/messages
 *    - Models: claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022, etc.
 *    - System prompt in separate 'system' field
 *    - Supports vision with base64 image format
 * 
 * 3. Google Gemini API (https://ai.google.dev/docs)
 *    - Base URL: https://generativelanguage.googleapis.com
 *    - Auth: API key as query parameter
 *    - Endpoint: /v1beta/models/{model}:generateContent
 *    - Models: gemini-1.5-pro, gemini-1.5-flash, gemini-pro
 *    - Uses 'parts' array for content and 'inlineData' for images
 * 
 * 4. DeepSeek API (https://api-docs.deepseek.com/)
 *    - Base URL: https://api.deepseek.com/v1
 *    - Auth: Bearer token (OpenAI-compatible)
 *    - Endpoint: /chat/completions
 *    - Models: deepseek-chat, deepseek-reasoner
 *    - OpenAI-compatible format
 * 
 * 5. Local LLM (Ollama) API (https://github.com/ollama/ollama/blob/main/docs/api.md)
 *    - Base URL: http://localhost:11434 (default)
 *    - Endpoint: /api/chat
 *    - Vision models: llava, llama3.2-vision, bakllava, etc.
 *    - Images in separate 'images' array as base64
 * 
 * All implementations include:
 * - Context message limiting (maxMessages setting)
 * - System prompt support
 * - Image/vision support where available
 * - Proper error handling and user feedback
 */
export class ApiService {
  constructor(private sdk: FrontendSDK) {}

  // Frontend HTTP request implementation using fetch
  private async makeHttpRequest(url: string, options: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`[API] HTTP request failed:`, error);
      throw error;
    }
  }

  async testConnection(request: TestConnectionRequest): Promise<ApiResponse> {
    try {
      switch (request.provider) {
        case 'openai':
          return await this.testOpenAI(request);
        case 'anthropic':
          return await this.testAnthropic(request);
        case 'google':
          return await this.testGoogle(request);
        case 'deepseek':
          return await this.testDeepSeek(request);
        case 'local':
          return await this.testLocal(request);
        default:
          return {
            success: false,
            error: `Unsupported provider: ${request.provider}`
          };
      }
    } catch (error) {
      console.error(`[API] Connection test error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Connection test failed'
      };
    }
  }

  private async testOpenAI(request: TestConnectionRequest): Promise<ApiResponse> {
    if (!request.apiKey?.trim()) {
      return { success: false, error: 'API key is required' };
    }

    try {
      const baseUrl = request.baseUrl || 'https://api.openai.com/v1';
      const response = await this.makeHttpRequest(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: data?.data?.length > 0,
        message: data?.data?.length > 0 ? 'Connection successful' : 'No models found'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private async testAnthropic(request: TestConnectionRequest): Promise<ApiResponse> {
    if (!request.apiKey?.trim()) {
      return { success: false, error: 'API key is required' };
    }

    try {
      const baseUrl = request.baseUrl || 'https://api.anthropic.com';
      const model = request.model || 'claude-3-5-sonnet-20241022'; // Default model
      
      const response = await this.makeHttpRequest(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': request.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: data?.content?.length > 0,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private async testGoogle(request: TestConnectionRequest): Promise<ApiResponse> {
    if (!request.apiKey?.trim()) {
      return { success: false, error: 'API key is required' };
    }

    try {
      const baseUrl = request.baseUrl || 'https://generativelanguage.googleapis.com';
      const model = request.model || 'gemini-1.5-flash'; // Default model
      
      const response = await this.makeHttpRequest(`${baseUrl}/v1beta/models/${model}:generateContent?key=${request.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle specific case where user is trying to use deprecated gemini-pro model
        if (request.model === 'gemini-pro' || request.model === 'gemini-pro-vision') {
          throw new Error(`The "${request.model}" model has been retired by Google. Please switch to "gemini-1.5-pro-latest" for the best experience.`);
        }
        
        // Handle generic "model not found" errors for any Google model
        if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
          throw new Error(`Model "${request.model}" is not available. Please select a different Gemini model from the dropdown.`);
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }

      const data = await response.json();
      return {
        success: data?.candidates?.length > 0,
        message: 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  private async testDeepSeek(request: TestConnectionRequest): Promise<ApiResponse> {
    if (!request.apiKey?.trim()) {
      return { success: false, error: 'API key is required' };
    }

    try {
      const response = await this.makeHttpRequest('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${request.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      return {
        success: data?.choices?.length > 0,
        message: 'DeepSeek connection successful!',
        data: { provider: 'DeepSeek', connected: true }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        message: 'DeepSeek connection failed'
      };
    }
  }

  private async testLocal(request: TestConnectionRequest): Promise<ApiResponse> {
    if (!request.baseUrl?.trim()) {
      return { success: false, error: 'Server URL is required' };
    }

    try {
      // Step 1: Test basic connection by fetching available models using correct Ollama endpoint
      const tagsResponse = await this.makeHttpRequest(`${request.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!tagsResponse.ok) {
        return {
          success: false,
          error: `Failed to connect to Ollama server: HTTP ${tagsResponse.status}: ${tagsResponse.statusText}`,
          message: 'Could not reach Ollama server'
        };
      }

      const availableData = await tagsResponse.json();
      const availableModelNames = availableData.models?.map((m: any) => m.name) || [];
      
      if (availableModelNames.length === 0) {
        return {
          success: false,
          error: 'No models found on Ollama server',
          message: 'Could not reach Ollama server'
        };
      }

      // Step 2: If user provided specific models to test, validate and test each one
      if (request.models?.trim()) {
        const requestedModels = request.models.split(',').map(m => m.trim()).filter(m => m);
        const validModels: string[] = [];
        const invalidModels: string[] = [];
        const failedModels: string[] = [];
        
        // Check each requested model
        for (const requestedModel of requestedModels) {
          // Check if model exists on server
          const modelExists = availableModelNames.some((available: string) => 
            available === requestedModel || available.includes(requestedModel)
          );
          
          if (!modelExists) {
            invalidModels.push(requestedModel);
            continue;
          }
          
          // Step 3: Test the model with an actual chat request
          try {
            const testChatResponse = await this.makeHttpRequest(`${request.baseUrl}/api/chat`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: requestedModel,
                messages: [{ role: 'user', content: 'Hello' }],
                stream: false,
                options: {
                  num_predict: 5 // Very short response for testing
                }
              })
            });

            if (testChatResponse.ok) {
              const testData = await testChatResponse.json();
              if (testData.message?.content) {
                validModels.push(requestedModel);
              } else {
                failedModels.push(requestedModel);
              }
            } else {
              failedModels.push(requestedModel);
            }
          } catch (testError) {
            failedModels.push(requestedModel);
          }
        }
        
        // Build detailed response message
        const messages: string[] = [];
        if (validModels.length > 0) {
          messages.push(`Working models: ${validModels.join(', ')}`);
        }
        if (invalidModels.length > 0) {
          messages.push(`Models not found: ${invalidModels.join(', ')}`);
        }
        if (failedModels.length > 0) {
          messages.push(`Models found but failed test: ${failedModels.join(', ')}`);
        }
        
        messages.push(`Available on server: ${availableModelNames.join(', ')}`);
        
        const allRequestedValid = invalidModels.length === 0 && failedModels.length === 0;
        
        return {
          success: allRequestedValid && validModels.length > 0,
          message: messages.join('\n'),
          data: { 
            validModels, 
            invalidModels, 
            failedModels,
            availableModels: availableModelNames,
            totalTested: requestedModels.length,
            totalWorking: validModels.length
          }
        };
      } else {
        // No specific models to test, just return server connection status
        return {
          success: true,
          message: `Ollama server connected - ${availableModelNames.length} models available\nPlease add model names to the "Available Models" field to test specific models (e.g., llama3.2, mistral, codellama)`,
          data: { 
            availableModels: availableModelNames,
            modelsFound: availableModelNames.length 
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    try {
      switch (request.settings.provider) {
        case 'openai':
          return await this.sendOpenAIMessage(request);
        case 'anthropic':
          return await this.sendAnthropicMessage(request);
        case 'google':
          return await this.sendGoogleMessage(request);
        case 'deepseek':
          return await this.sendDeepSeekMessage(request);
        case 'local':
          return await this.sendLocalMessage(request);
        default:
          throw new Error(`Unsupported provider: ${request.settings.provider}`);
      }
    } catch (error) {
      console.error(`[API] Send message error:`, error);
      throw error;
    }
  }

  private formatMessages(messages: ChatMessage[], systemPrompt?: string, maxMessages?: number): any[] {
    const formattedMessages: any[] = [];
    
    // Apply system prompt first
    if (systemPrompt && systemPrompt.trim()) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt.trim()
      });
    }

    // Apply context limit if specified
    if (maxMessages && maxMessages > 0 && messages.length > maxMessages) {
      // Keep the system prompt (if present) and the most recent messages
      const systemPrompts = messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = messages.filter(msg => msg.role !== 'system');

      // Take the most recent non-system messages
      const recentMessages = nonSystemMessages.slice(-maxMessages);
      
      formattedMessages.push(...systemPrompts, ...recentMessages);
    } else {
      formattedMessages.push(...messages);
    }

    return formattedMessages;
  }

  private async sendOpenAIMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    const { settings, messages } = request;
    const baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    
    // CRITICAL: Validate model parameter is present
    if (!settings.model || settings.model.trim() === '') {
      throw new Error('Model parameter is required for OpenAI API request');
    }
    
    // Get maxMessages from settings, with a sensible default
    const maxMessages = settings.maxMessages || 20;
    
    // Apply context message limit - keep most recent messages within limit
    let messagesToProcess = messages;
    if (maxMessages && maxMessages > 0 && messages.length > maxMessages) {
      // Keep the most recent maxMessages
      messagesToProcess = messages.slice(-maxMessages);
    }
    
    // Format messages with image support for OpenAI vision
    const formattedMessages: any[] = [];
    
    if (settings.systemPrompt && settings.systemPrompt.trim()) {
      formattedMessages.push({
        role: 'system',
        content: settings.systemPrompt.trim()
      });
    }

    messagesToProcess.forEach(message => {
      // Handle messages with images for OpenAI vision
      if (message.images && message.images.length > 0) {
        const content: any[] = [];
        
        // Add text content first if it exists
        if (message.content && message.content.trim()) {
          content.push({ type: 'text', text: message.content });
        }
        
        // Add images in OpenAI vision format
        message.images.forEach(image => {
          content.push({
            type: 'image_url',
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
            }
          });
        });
        
        // Only add message if we have content (text or images)
        if (content.length > 0) {
          formattedMessages.push({
            role: message.role,
            content: content
          });
        }
      } else if (message.content && message.content.trim()) {
        // Regular text-only message
        formattedMessages.push({
          role: message.role,
          content: message.content
        });
      }
    });
    
    // ENSURE MODEL PARAMETER IS INCLUDED - CRITICAL FIX
    const requestBody = {
      model: settings.model, // This MUST be present for OpenAI API
      messages: formattedMessages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: false
    };
    
    // Final validation before API call
    if (!requestBody.model) {
      throw new Error('CRITICAL ERROR: Model parameter is missing from OpenAI API request');
    }
    
    const response = await this.makeHttpRequest(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('No response received from OpenAI');
    }

    return {
      content: choice.message.content,
      usage: data.usage,
      model: data.model,
      provider: 'OpenAI'
    };
  }

  private async sendAnthropicMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    const { settings, messages } = request;
    const baseUrl = settings.baseUrl || 'https://api.anthropic.com';
    
    // Get maxMessages from settings, with a sensible default
    const maxMessages = settings.maxMessages || 20;
    
    // Apply context message limit - keep most recent messages within limit
    let messagesToProcess = messages;
    if (maxMessages && maxMessages > 0 && messages.length > maxMessages) {
      // Keep the most recent maxMessages
      messagesToProcess = messages.slice(-maxMessages);
    }
    
    const formattedMessages = messagesToProcess.map(msg => {
      // Handle messages with images
      if (msg.images && msg.images.length > 0) {
        const content = [];
        
        // Add images first (recommended by Anthropic)
        msg.images.forEach(image => {
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
        if (msg.content) {
          content.push({
            type: 'text',
            text: msg.content
          });
        }
        
        return {
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: content
        };
      }
      
      // Regular text-only message
      return {
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      };
    });

    const requestBody: any = {
      model: settings.model,
      max_tokens: 4000,
      messages: formattedMessages
    };

    // Claude API requires system prompt in separate 'system' field, not in messages array
    if (settings.systemPrompt && settings.systemPrompt.trim()) {
      requestBody.system = settings.systemPrompt.trim();
    }

    const response = await this.makeHttpRequest(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) {
      throw new Error('No response received from Anthropic');
    }

    return {
      content: content,
      usage: data.usage,
      model: data.model,
      provider: 'Anthropic'
    };
  }

  private async sendGoogleMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    const { settings, messages } = request;
    const baseUrl = settings.baseUrl || 'https://generativelanguage.googleapis.com';
    
    // Validate model parameter for Google API
    if (!settings.model || settings.model.trim() === '') {
      throw new Error('Model parameter is required for Google API request');
    }
    
    // Get maxMessages from settings, with a sensible default
    const maxMessages = settings.maxMessages || 20;
    
    // Apply context message limit - keep most recent messages within limit
    let messagesToProcess = messages;
    if (maxMessages && maxMessages > 0 && messages.length > maxMessages) {
      // Keep the most recent maxMessages
      messagesToProcess = messages.slice(-maxMessages);
    }
    
    const contents: any[] = [];

    // Google/Gemini handles system prompts by adding them as the first user message
    // followed by a model acknowledgment
    if (settings.systemPrompt && settings.systemPrompt.trim()) {
      contents.push({
        parts: [{ text: settings.systemPrompt.trim() }],
        role: 'user'
      });
      contents.push({
        parts: [{ text: 'I understand. I will act as a cybersecurity expert and provide helpful, ethical guidance.' }],
        role: 'model'
      });
    }

    messagesToProcess.forEach(message => {
      if (message.role !== 'system') {
        const parts: any[] = [];
        
        // Add text content first if it exists and is not empty
        if (message.content && message.content.trim()) {
          parts.push({ text: message.content });
        }
        
        // Add images for Gemini vision
        if (message.images && message.images.length > 0) {
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
        }
        
        // Only add message if we have parts (text or images)
        if (parts.length > 0) {
          contents.push({
            parts: parts,
            role: message.role === 'assistant' ? 'model' : 'user'
          });
        }
      }
    });

    const response = await this.makeHttpRequest(`${baseUrl}/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          maxOutputTokens: 4000,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Handle specific case where user is trying to use deprecated gemini-pro model
      if (settings.model === 'gemini-pro' || settings.model === 'gemini-pro-vision') {
        throw new Error(`The "${settings.model}" model has been retired by Google. Please switch to "gemini-1.5-pro-latest" for the best experience.`);
      }
      
      // Handle generic "model not found" errors for any Google model
      if (errorMessage.includes('not found') || errorMessage.includes('not supported')) {
        throw new Error(`Model "${settings.model}" is not available. Please select a different Gemini model from the dropdown.`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('No response received from Google');
    }

    return {
      content: candidate.content.parts[0].text,
      usage: data.usageMetadata,
      model: settings.model,
      provider: 'Google'
    };
  }

  private async sendDeepSeekMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    const { settings, messages } = request;
    
    // Get maxMessages from settings, with a sensible default
    const maxMessages = settings.maxMessages || 20;
    
    const formattedMessages = this.formatMessages(messages, settings.systemPrompt, maxMessages);
    
    const response = await this.makeHttpRequest(`https://api.deepseek.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages: formattedMessages,
        max_tokens: 4000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) {
      throw new Error('No response received from DeepSeek');
    }

    return {
      content: choice.message.content,
      usage: data.usage,
      model: settings.model,
      provider: 'DeepSeek'
    };
  }

  private async sendLocalMessage(request: SendMessageRequest): Promise<ProviderResponse> {
    const { settings, messages } = request;
    
    // Get maxMessages from settings, with a sensible default
    const maxMessages = settings.maxMessages || 20;
    
    // Apply context message limit - keep most recent messages within limit
    let messagesToProcess = messages;
    if (maxMessages && maxMessages > 0 && messages.length > maxMessages) {
      // Keep the most recent maxMessages
      messagesToProcess = messages.slice(-maxMessages);
    }
    
    // Check if images are being sent and provide guidance for vision models
    const hasImages = messagesToProcess.some(m => m.images && m.images.length > 0);
    if (hasImages) {
      // Check if the model name suggests it supports vision
      const modelName = settings.model.toLowerCase();
      const isVisionModel = modelName.includes('llava') || 
                           modelName.includes('vision') || 
                           modelName.includes('bakllava') ||
                           modelName.includes('minicpm') ||
                           modelName.includes('moondream');
      
      if (!isVisionModel) {
        throw new Error(`Model "${settings.model}" does not support image input. Please use a vision-capable model like "llava", "llama3.2-vision", or "bakllava" for image analysis.`);
      }
    }
    
    // Format messages for Ollama API according to official docs with image support
    const formattedMessages: any[] = [];
    
    // Add conversation messages in the format Ollama expects
    messagesToProcess.forEach(msg => {
      // Handle messages with images for Ollama vision models (like llava, llama3.2-vision, etc.)
      if (msg.images && msg.images.length > 0) {
        // For Ollama vision models, we need to format images properly
        const images: string[] = [];
        
        msg.images.forEach(image => {
          // Extract base64 data from data URL if needed
          let base64Data = image;
          if (image.startsWith('data:')) {
            const base64Match = image.match(/base64,(.+)$/);
            if (base64Match && base64Match[1]) {
              base64Data = base64Match[1];
            }
          }
          images.push(base64Data);
        });
        
        // Format message for Ollama with separate images array
        formattedMessages.push({
          role: msg.role,
          content: msg.content || "Analyze these images.",
          images: images
        });
      } else if (msg.content && msg.content.trim()) {
        // Regular text-only message
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });

    // Use Ollama's official chat API endpoint
    const requestData = {
      model: settings.model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: -1
      }
    };

    // Add system prompt if provided - Ollama handles this by prepending as first message
    if (settings.systemPrompt && settings.systemPrompt.trim()) {
      requestData.messages.unshift({
        role: 'system',
        content: settings.systemPrompt.trim()
      });
    }

    // Add generation options
    requestData.options = {
      temperature: 0.7,
      num_predict: 4000
    };

    const response = await this.makeHttpRequest(`${settings.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      
      // Provide helpful error messages for common issues
      if (errorMessage.includes('failed to process inputs') && errorMessage.includes('image input')) {
        errorMessage = `Model "${settings.model}" does not support image input. Please use a vision-capable model like "llava", "llama3.2-vision", or "bakllava" for image analysis.`;
      } else if (errorMessage.includes('model not found')) {
        errorMessage = `Model "${settings.model}" is not available. Please check that the model is installed in Ollama using: ollama pull ${settings.model}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle Ollama response format according to official docs
    if (!data.message?.content) {
      throw new Error('No response received from Ollama');
    }

    return {
      content: data.message.content,
      model: data.model || settings.model,
      provider: 'Local LLM (ollama)',
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  }

  // Simplified backend methods that don't do HTTP requests
  async healthCheck(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  async getProviders(): Promise<string[]> {
    return ['openai', 'anthropic', 'google', 'deepseek', 'local'];
  }

  async getProviderModels(provider: string, apiKey?: string): Promise<string[]> {
    if (!provider) {
      return [];
    }
    
    if (!apiKey) {
      return [];
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.getOpenAIModels(apiKey);
        case 'anthropic':
          return await this.getAnthropicModels();
        case 'google':
          return await this.getGoogleModels();
        case 'deepseek':
          return await this.getDeepSeekModels();
        case 'local':
          // For local provider, apiKey parameter is actually the baseUrl
          return await this.getLocalModels(apiKey);
        default:
          return [];
      }
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      return [];
    }
  }

  private async getOpenAIModels(apiKey: string): Promise<string[]> {
    try {
      const response = await this.makeHttpRequest('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.data
        ?.filter((model: any) => model.id.includes('gpt'))
        ?.map((model: any) => model.id)
        ?.sort() || [];
      
      // Return common models if API call fails or returns empty
      return models.length > 0 ? models : ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    } catch (error) {
      console.error('[API] Failed to fetch OpenAI models:', error);
      // Return fallback models
      return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    }
  }

  private async getAnthropicModels(): Promise<string[]> {
    // Anthropic doesn't have a public models endpoint, return known models
    // Based on official documentation: https://docs.anthropic.com/en/api/overview
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }

  private async getGoogleModels(): Promise<string[]> {
    // Google models - only currently supported models
    // Based on: https://ai.google.dev/gemini-api/docs/models/gemini
    return [
      // Gemini 2.5 Series (Latest & Best)
      'gemini-2.5-pro-preview-05-06',
      'gemini-2.5-flash-preview-05-20',
      
      // Gemini 2.0 Series (Stable)
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      
      // Gemini 1.5 Series (Stable)
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash-latest', 
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];
  }

  private async getDeepSeekModels(): Promise<string[]> {
    // DeepSeek models are known, return available ones
    // Based on official documentation: https://api-docs.deepseek.com/
    return [
      'deepseek-chat',
      'deepseek-reasoner'
    ];
  }

  private async getLocalModels(baseUrl: string): Promise<string[]> {
    try {
      // Use Ollama's official endpoint for listing models
      const response = await this.makeHttpRequest(`${baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const models = data.models || [];
      
      // Extract model names from Ollama response format (according to official docs)
      const modelNames = models.map((model: any) => {
        // Ollama models have 'name' field in the format "model:tag"
        return model.name || model.model || 'unknown-model';
      });
      
      return modelNames.length > 0 ? modelNames : ['no-models-found'];
    } catch (error) {
      console.error('[API] Failed to fetch Ollama models:', error);
      return ['connection-failed'];
    }
  }
} 