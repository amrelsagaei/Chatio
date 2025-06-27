import type { SDK } from "caido:plugin";
import { Request as FetchRequest, fetch } from "caido:http";

export interface GoogleMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface GoogleRequest {
  contents: GoogleMessage[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
  systemInstruction?: {
    parts: {
      text: string;
    }[];
  };
}

export interface GoogleResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

// Import shared types
import type { 
  TestConnectionRequest, 
  SendMessageRequest, 
  ProviderResponse, 
  ApiResponse 
} from '../types';

// Available Google models - Updated with latest Gemini models
export const GOOGLE_MODELS = [
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash-8b',
  'gemini-pro-vision',
  'gemini-pro'
];

export const testGoogleConnection = async (sdk: SDK, request: TestConnectionRequest): Promise<ApiResponse> => {
  try {

    
    // Test with a simple model list request
    const url = `${request.baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models?key=${request.apiKey}`;
    
    const fetchRequest = new FetchRequest(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Caido-Chatio-Plugin/1.0'
      }
    });
    
    const response = await fetch(fetchRequest);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      sdk.console.error(`❌ [Google] Connection failed: HTTP ${response.status} - ${errorData.error?.message || errorText}`);
      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    const data = await response.json();
    const availableModels = data.models?.map((model: any) => model.name.replace('models/', '')) || [];
    

    
    return {
      success: true,
      message: 'Google Gemini connection successful!',
      data: {
        availableModels: availableModels.slice(0, 10), // Limit for display
        totalModels: availableModels.length
      }
    };
  } catch (error) {
    sdk.console.error(`❌ [Google] Connection test failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    };
  }
};

export const sendGoogleMessage = async (sdk: SDK, request: SendMessageRequest): Promise<ProviderResponse> => {
  try {

    
    const { messages, settings } = request;
    const { apiKey, baseUrl, model, maxTokens, temperature, systemPrompt } = settings;
    
    // Convert messages to Google format (user -> user, assistant -> model)
    const googleMessages: GoogleMessage[] = [];
    
    messages.forEach(msg => {
      if (msg.role === 'user' && msg.content?.trim()) {
        const parts: Array<any> = [];
        
        // Add text content
        if (msg.content.trim()) {
          parts.push({ text: msg.content.trim() });
        }
        
        // Add images if present
        if (msg.images && msg.images.length > 0) {
          msg.images.forEach((imageUrl: string) => {
            // Convert data URL to inline data format for Gemini
            if (imageUrl.startsWith('data:')) {
              const [mimeTypeWithPrefix, base64Data] = imageUrl.split(',');
              const mimeType = mimeTypeWithPrefix.replace('data:', '').replace(';base64', '');
              
              parts.push({
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              });
            }
          });
        }
        
        googleMessages.push({
          role: 'user',
          parts: parts
        });
      } else if (msg.role === 'assistant' && msg.content?.trim()) {
        googleMessages.push({
          role: 'model',
          parts: [{ text: msg.content.trim() }]
        });
      }
    });
    
    // Ensure we have at least one message
    if (googleMessages.length === 0) {
      throw new Error('No valid messages to send to Google Gemini');
    }
    
    // Build request body exactly as per Google Gemini API documentation
    const requestBody: GoogleRequest = {
      contents: googleMessages
    };
    
    // Add generation config if provided
    if (maxTokens || temperature !== undefined) {
      requestBody.generationConfig = {};
      if (maxTokens && maxTokens > 0) {
        requestBody.generationConfig.maxOutputTokens = maxTokens;
      }
      if (temperature !== undefined && temperature >= 0 && temperature <= 2) {
        requestBody.generationConfig.temperature = temperature;
      }
    }
    
    // Add system instruction if provided (Google's specific requirement)
    if (systemPrompt?.trim()) {
      requestBody.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }]
      };
    }
    
    const modelName = model || 'gemini-1.5-pro';

    
    const url = `${baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    
    const fetchRequest = new FetchRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Caido-Chatio-Plugin/1.0'
      },
      body: JSON.stringify(requestBody)
    });
    

    const response = await fetch(fetchRequest);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      sdk.console.error(`❌ [Google] Raw error response: ${errorText}`);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      
      const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      sdk.console.error(`❌ [Google] API Error: ${errorMessage}`);
      
      throw new Error(errorMessage);
    }
    
    const responseText = await response.text();

    
    const data: GoogleResponse = JSON.parse(responseText);
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response candidates returned from Google Gemini');
    }
    
    const content = data.candidates[0].content.parts[0].text;
    const usage = data.usageMetadata;
    

    
    return {
      content,
      usage: {
        promptTokens: usage.promptTokenCount,
        completionTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount
      },
      model: modelName,
      provider: 'google'
    };
    
  } catch (error) {
    sdk.console.error(`❌ [Google] Send message failed:`, error);
    throw error;
  }
}; 