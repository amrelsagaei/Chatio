import type { ChatMessage, ChatSettings, ProviderResponse, TestConnectionRequest, ApiResponse } from '../types';
import { getSystemPrompt } from './prompts';
import { 
  OpenAIProvider, 
  AnthropicProvider, 
  GoogleProvider, 
  DeepSeekProvider, 
  LocalProvider,
  BaseProvider 
} from './providers';

export class ChatService {
  private providers: Map<string, BaseProvider> = new Map();

  constructor() {
    // Initialize providers map
  }

  private createProvider(settings: ChatSettings): BaseProvider {
    const { provider, apiKey, baseUrl, model } = settings;

    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(apiKey, baseUrl, model);
      
      case 'anthropic':
        return new AnthropicProvider(apiKey, baseUrl, model);
      
      case 'google':
        return new GoogleProvider(apiKey, baseUrl, model);
      
      case 'deepseek':
        return new DeepSeekProvider(apiKey, baseUrl, model);
      
      case 'local':
        return new LocalProvider(apiKey, baseUrl, model);
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async testConnection(request: TestConnectionRequest): Promise<ApiResponse> {
    try {
      const settings: ChatSettings = {
        provider: request.provider,
        apiKey: request.apiKey,
        baseUrl: request.baseUrl,
        model: request.model || 'default'
      };

      const provider = this.createProvider(settings);
      const isConnected = await provider.testConnection();

      return {
        success: isConnected,
        message: isConnected 
          ? `${provider.getName()} connection successful!`
          : `${provider.getName()} connection failed. Please check your configuration.`,
        data: { provider: provider.getName(), connected: isConnected }
      };
    } catch (error) {
      console.error('Connection test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Connection test failed'
      };
    }
  }

  async sendMessage(messages: ChatMessage[], settings: ChatSettings): Promise<ProviderResponse> {
    try {
      const provider = this.createProvider(settings);
      const systemPrompt = getSystemPrompt(settings.systemPrompt);
      
      // Add provider name to the response for UI display
      const response = await provider.sendMessage(messages, systemPrompt);
      
      // Ensure provider name is set
      if (!response.provider) {
        response.provider = provider.getName();
      }

      return response;
    } catch (error) {
      console.error('Send message error:', error);
      return {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        provider: settings.provider
      };
    }
  }

  getAvailableProviders(): string[] {
    return ['openai', 'anthropic', 'google', 'deepseek', 'local'];
  }

  getProviderModels(provider: string): string[] {
    switch (provider.toLowerCase()) {
      case 'openai':
        return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
      
      case 'anthropic':
        return [
          'claude-3-5-sonnet-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307'
        ];
      
      case 'google':
        return ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'];
      
      case 'deepseek':
        return ['deepseek-chat', 'deepseek-reasoner'];
      
      case 'local':
        return ['local-model', 'llama-2', 'mistral', 'codellama'];
      
      default:
        return [];
    }
  }
} 