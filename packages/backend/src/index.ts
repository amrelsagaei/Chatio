import type { DefineAPI, SDK } from "caido:plugin";

// Define simplified API for frontend to register basic functions
type API = DefineAPI<{
  healthCheck: () => Promise<{ status: string }>;
  getProviders: () => Promise<string[]>;
  getProviderModels: (provider: string) => Promise<string[]>;
}>;

// Simple health check
const healthCheck = async (): Promise<{ status: string }> => {
  return { status: "healthy" };
};

// Get available providers
const getProviders = async (): Promise<string[]> => {
  return ['openai', 'anthropic', 'google', 'deepseek', 'local'];
};

// Get models for a specific provider
const getProviderModels = async (provider: string): Promise<string[]> => {
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
    google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-vision'],
    deepseek: ['deepseek-chat', 'deepseek-reasoner'],
    local: ['local-model', 'llama-2', 'mistral', 'codellama']
  };
  
  return models[provider as keyof typeof models] || [];
};

// Initialize the plugin
export function init(sdk: SDK<API>) {
  sdk.console.log("Chatio plugin initializing...");

  // Register simple API methods (no HTTP requests in backend)
  sdk.api.register("healthCheck", healthCheck);
  sdk.api.register("getProviders", getProviders);
  sdk.api.register("getProviderModels", getProviderModels);

  sdk.console.log("Chatio plugin initialized successfully!");
}
