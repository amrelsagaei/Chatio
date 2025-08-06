import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { Classic } from '@caido/primevue';
import { SDKPlugin } from '../plugins/sdk';
import QuickActionPopup from '../components/chat/QuickActionPopup.vue';
import { 
  isInEditableTab, 
  getCurrentRequestContent, 
  changeRequestMethod, 
  addOrUpdateHeader, 
  removeAllHeaders, 
  changeRequestBody,
  addUrlParameters,
  getCurrentSidebarTab
} from '../utils/caidoUtils';
import type { FrontendSDK } from '../types';
import { executeAction, getAction } from './actions';

interface QuickActionData {
  action: string;
  method?: string;
  header?: string;
  value?: string;
  body?: string;
  message?: string;
  actions?: QuickActionData[]; // For multiple_actions
  params?: { [key: string]: any }; // For URL parameters and other action params
  [key: string]: any; // Allow any additional properties for dynamic parameters
}

interface ActionResult {
  success: boolean;
  message?: string;
}

let quickActionApp: any = null;
let isActive = false;

/**
 * Show a toast notification with proper line breaking for long messages
 */
function showToast(type: 'success' | 'error' | 'info', message: string) {
  const toast = document.createElement('div');
  toast.className = `quick-action-toast toast-${type}`;
  
  // Break long messages into multiple lines
  const maxLineLength = 60;
  const words = message.split(' ');
  let lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxLineLength && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  toast.innerHTML = lines.join('<br>');
  
  // Style the toast
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: '10000',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideInRight 0.3s ease-out',
    maxWidth: '400px',
    lineHeight: '1.4',
    background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
  });
  
  // Add animation styles if not already added
  if (!document.getElementById('quick-action-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'quick-action-toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remove after 4 seconds for error messages, 3 seconds for others
  const duration = type === 'error' ? 4000 : 3000;
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

/**
 * Apply action to request editor or execute Caido action
 */
async function applyRequestAction(sdk: FrontendSDK, actionData: QuickActionData): Promise<boolean> {
  try {
    // Handle error actions from backend
    if (actionData.action === 'error') {
      throw new Error(actionData.message || 'AI processing error');
    }
    
    // Handle new comprehensive Caido actions
    if (actionData.action === 'caido_action') {
      const typedData = actionData as any;
      if (typedData.actionName && typedData.params !== undefined) {
        const result = await executeAction(sdk, typedData.actionName, typedData.params);
        return result.success;
      }
      return false;
    }
    
    // Handle direct action calls (when AI returns action name directly)
    if (actionData.action && actionData.params !== undefined) {
      // Check if this is a direct action from actions.ts
      const actionDef = getAction(actionData.action);
      if (actionDef) {
        const result = await executeAction(sdk, actionData.action, actionData.params);
        return result.success;
      }
    }
    
    // Check if it's a direct action without the params wrapper (legacy AI responses)
    const actionDef = getAction(actionData.action);
    if (actionDef) {
      const { action, message, ...params } = actionData;
      
      // Handle parameter name mismatches (AI returning different names)
      let mappedParams = { ...params };
      if (actionData.action === 'activeEditorReplaceSelection' && 'replacement' in params) {
        mappedParams = { text: params.replacement };
      }
      
      const result = await executeAction(sdk, actionData.action, mappedParams);
      return result.success;
    }
    
    // Handle legacy request modification actions
    switch (actionData.action) {
      case 'change_method':
        return actionData.method ? changeRequestMethod(actionData.method.toUpperCase()) : false;
        
      case 'add_header':
        return actionData.header && actionData.value ? 
          addOrUpdateHeader(actionData.header, actionData.value) : false;
        
      case 'remove_headers':
        return removeAllHeaders();
        
      case 'change_body':
        return actionData.body !== undefined ? changeRequestBody(actionData.body) : false;
        
      case 'remove_body':
        return changeRequestBody('');
        
      case 'add_param':
        if (actionData.params) {
          return addUrlParameters(actionData.params);
        }
        return false;
        
      case 'multiple_actions':
        if (actionData.actions && actionData.actions.length > 0) {
          let allSuccess = true;
          for (const action of actionData.actions) {
            const success = await applyRequestAction(sdk, action);
            if (!success) allSuccess = false;
          }
          return allSuccess;
        }
        return false;

        
      case 'navigateToSidebarTab':
        const navResult = await executeAction(sdk, 'navigateToSidebarTab', {
          tab: actionData.params?.tab || 'replay'
        });
        return navResult.success;
        
      default:
        return false;
    }
  } catch (error) {
    throw error; // Re-throw so the UI can show the error
  }
}

/**
 * Execute a quick action command using AI with specific model
 */
async function executeQuickActionWithModel(sdk: FrontendSDK, command: string, context: string, provider: string, model: string): Promise<ActionResult> {
  try {
    const storageData = await sdk.storage.get() as any;
    if (!storageData?.globalSettings?.providers?.[provider]) {
      return {
        success: false,
        message: `Provider ${provider} not configured. Please configure it in settings.`
      };
    }
    
    const providerConfig = storageData.globalSettings.providers[provider];
    
    // Validate provider configuration
    if (provider !== 'local' && !providerConfig?.apiKey) {
      return {
        success: false,
        message: `No API key configured for ${provider}. Please configure it in settings.`
      };
    }
    
    if (provider === 'local' && !providerConfig?.url) {
      return {
        success: false,
        message: 'No local LLM URL configured. Please configure it in settings.'
      };
    }
    
    // Process with AI directly in frontend
      const aiResponse = await processWithAIModel(provider, providerConfig, model, command, context);
      
      // Clean and parse the AI response
      const cleanedResponse = cleanAIResponse(aiResponse);
      const actionData: QuickActionData = JSON.parse(cleanedResponse);
      
      // Apply the action to the current editor (DO NOT SEND REQUEST)
      const success = await applyRequestAction(sdk, actionData);
      
      return {
        success,
        message: success ? (actionData.message || 'Request modified successfully') : 'Failed to apply modifications'
      };
    } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute action'
    };
  }
}

/**
 * Execute a quick action command using AI (legacy function)
 */
async function executeQuickAction(sdk: FrontendSDK, command: string, context: string, providerName?: string): Promise<ActionResult> {
  try {
    const storageData = await sdk.storage.get() as any;
    const hasProviders = storageData?.globalSettings?.providers && 
                        Object.keys(storageData.globalSettings.providers).length > 0;
    
    if (!hasProviders) {
      return {
        success: false,
        message: 'No AI providers configured. Please configure an AI provider in settings.'
      };
    }
    
    // Get provider configuration
    let selectedProvider = providerName;
    let selectedConfig = null;
    
    if (storageData?.globalSettings?.providers) {
      if (selectedProvider && storageData.globalSettings.providers[selectedProvider]) {
        selectedConfig = storageData.globalSettings.providers[selectedProvider];
      } else {
        // If no provider specified, use first available
        for (const [name, config] of Object.entries(storageData.globalSettings.providers)) {
          const typedConfig = config as any;
          if (typedConfig?.apiKey || name === 'local') {
            selectedProvider = name;
            selectedConfig = typedConfig;
            break;
          }
        }
      }
    }
    
    if (!selectedProvider || !selectedConfig) {
      return {
        success: false,
        message: 'No AI provider configured or selected provider not found. Please configure an AI provider in settings.'
      };
    }
    
    // Process with AI directly in frontend
      const aiResponse = await processWithAI(selectedProvider, selectedConfig, command, context);
      
      // Clean and parse the AI response
      const cleanedResponse = cleanAIResponse(aiResponse);
      const actionData: QuickActionData = JSON.parse(cleanedResponse);
      
      // Apply the action to the current editor (DO NOT SEND REQUEST)
      const success = await applyRequestAction(sdk, actionData);
      
      return {
        success,
        message: success ? (actionData.message || 'Request modified successfully') : 'Failed to apply modifications'
      };
    } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to execute action'
    };
  }
}

/**
 * Clean AI response to extract pure JSON
 */
function cleanAIResponse(response: string): string {
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Handle multiple JSON objects (common AI mistake)
  // Look for patterns like: {"action":"..."}\n{"action":"..."} or [{"action":"..."},{"action":"..."}]
  if (cleaned.includes('}\n{') || cleaned.includes('}\r\n{')) {
    // Multiple JSON objects on separate lines - take the first one
    const lines = cleaned.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        cleaned = trimmed;
        break;
      }
    }
  } else if (cleaned.trim().startsWith('[') && cleaned.trim().endsWith(']')) {
    // JSON array - extract first object
    try {
      const parsed = JSON.parse(cleaned.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleaned = JSON.stringify(parsed[0]);
      }
    } catch (e) {
      // If parsing fails, try to extract first object manually
      const firstBrace = cleaned.indexOf('{');
      const firstBraceEnd = cleaned.indexOf('}', firstBrace);
      if (firstBrace !== -1 && firstBraceEnd !== -1) {
        cleaned = cleaned.substring(firstBrace, firstBraceEnd + 1);
      }
    }
  }
  
  // Remove any text before the first {
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    cleaned = cleaned.substring(firstBrace);
  }
  
  // Remove any text after the last }
  const lastBrace = cleaned.lastIndexOf('}');
  if (lastBrace !== -1) {
    cleaned = cleaned.substring(0, lastBrace + 1);
  }
  
  // Handle truncated JSON (common with long responses)
  if (!cleaned.endsWith('}')) {
    // Try to find the last complete JSON structure
    let braceCount = 0;
    let lastValidEnd = -1;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      else if (cleaned[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastValidEnd = i;
        }
      }
    }
    if (lastValidEnd !== -1) {
      cleaned = cleaned.substring(0, lastValidEnd + 1);
    }
  }
  
  return cleaned.trim();
}

/**
 * Process command with AI using specific model
 */
async function processWithAIModel(provider: string, config: any, model: string, command: string, context: string): Promise<string> {
  // Get current SDK context for dynamic data
  const sdk = (window as any).caidoSDK as FrontendSDK;
  
  // Get current scopes and filters for context
  let currentScopesContext = '';
  let currentFiltersContext = '';
  
  try {
    if (sdk?.scopes?.getAll) {
      const scopes = await sdk.scopes.getAll();
      if (scopes && Array.isArray(scopes) && scopes.length > 0) {
        currentScopesContext = '\nCURRENT SCOPES:\n' + scopes.map((scope: any) => 
          `- "${scope.name}" (ID: ${scope.id}) | allowlist: [${scope.allowlist?.join(', ') || 'none'}] | denylist: [${scope.denylist?.join(', ') || 'none'}]`
        ).join('\n');
      }
    }
  } catch (error) {
    // Ignore scope retrieval errors
  }
  
  try {
    if (sdk?.filters?.getAll || sdk?.httpFilters?.getAll) {
      const filters = await (sdk.filters?.getAll?.() || sdk.httpFilters?.getAll?.());
      if (filters && Array.isArray(filters) && filters.length > 0) {
        currentFiltersContext = '\nCURRENT FILTERS:\n' + filters.map((filter: any) => 
          `- "${filter.name}" (ID: ${filter.id}) | alias: ${filter.alias} | query: ${filter.query}`
        ).join('\n');
      }
    }
  } catch (error) {
    // Ignore filter retrieval errors
  }



  const systemPrompt = `You are Chatio, an expert security testing assistant for HTTP requests and Caido operations.
Analyze the user's natural language command and return ONLY a single JSON response with the appropriate action.

CRITICAL: You MUST return only ONE JSON object. Never return multiple JSON objects or arrays.

PRIORITY ACTIONS ONLY - THESE ARE THE ONLY SUPPORTED ACTIONS:

EDITOR ACTIONS (modify current request/response):
- activeEditorReplaceSelection: Replace selected text | params: {text: string}
- activeEditorReplaceByString: Replace text by string match | params: {match: string, replace: string}
- activeEditorReplaceBody: Replace entire body content | params: {body: string}
- activeEditorAddHeader: Add or update headers | params: {header: string, replace?: boolean}

REPLAY ACTIONS (modify replay requests):
- replayRequestReplace: Replace entire replay request content | params: {text: string}
- renameReplayTab: Rename current replay tab | params: {newName: string}

SCOPE ACTIONS (manage testing scope):
- addScope: Create new scope with allowlist/denylist | params: {name: string, allowlist: string[], denylist?: string[]}
- deleteScope: Delete scope by name or ID | params: {name?: string, id?: string}
- updateScope: Update existing scope configuration | params: {name: string, allowList: string[], denyList: string[]}

SCOPE PATTERN RULES (CRITICAL):
- Use domain patterns WITHOUT protocol: "google.com" NOT "https://google.com"
- Use wildcards correctly: "*.google.com" NOT "https://*.google.com/*" 
- For subdomains: "*.example.com" or "api.example.com"
- For IP ranges: "192.168.1.*" or "10.0.0.1"
- For specific paths: Use HTTPQL filters, NOT scope patterns

FILTER ACTIONS (manage HTTP History filters):
- addFilter: Create SAVED HTTPQL filter | params: {name: string, query: string, alias: string}
- deleteFilter: Delete existing filter | params: {name?: string, id?: string}
- updateFilter: Update existing filter | params: {id: string, name: string, alias: string, query: string}
- searchHttpHistory: Navigate to HTTP History and search directly | params: {query: string}

TEXT REPLACEMENT ACTIONS (modify current request):
- replaceInCurrentRequest: Replace text in currently active request | params: {find: string, replace: string}

FILE ACTIONS (manage hosted files):
- createHostedFile: Create new hosted file | params: {name: string, content: string}
- removeHostedFile: Remove hosted file (supports wildcard *) | params: {id?: string, name?: string}

IMPORTANT: If user asks for actions NOT in this list (like sendReplayTab, createAutomateSession, runConvertWorkflow, displayTextToUser, addMatchAndReplace), respond with:
{"action":"error","message":"This action is not supported. Available actions: editor, replay, scope, filter, and file operations only."}

RESPONSE FORMATS:

For direct Caido action execution (preferred for priority actions):
{"action":"activeEditorReplaceSelection","params":{"text":"new_text"},"message":"Replaced selected text"}
{"action":"replaceInCurrentRequest","params":{"find":"GET","replace":"POST"},"message":"Replaced GET with POST in current request"}
{"action":"addScope","params":{"name":"TestScope","allowlist":["*.example.com"],"denylist":[]},"message":"Created new scope"}
{"action":"updateScope","params":{"name":"TestScope","allowList":["*.example.com","example.com"],"denyList":["malicious.com"]},"message":"Updated scope configuration"}
{"action":"deleteScope","params":{"name":"TestScope"},"message":"Deleted scope TestScope"}
{"action":"addFilter","params":{"name":"Error Filter","query":"resp.status.gte:400","alias":"errors"},"message":"Created filter for errors"}
{"action":"updateFilter","params":{"id":"filter123","name":"Updated Filter","query":"resp.status.eq:404","alias":"404"},"message":"Updated filter"}
{"action":"deleteFilter","params":{"name":"Error Filter"},"message":"Deleted filter Error Filter"}
{"action":"searchHttpHistory","params":{"query":"api"},"message":"Searching for API endpoints in HTTP History"}
{"action":"renameReplayTab","params":{"newName":"Login Request"},"message":"Renamed tab to Login Request"}

For legacy request modifications (fallback only):
{"action":"change_method","method":"POST","message":"Changed method to POST"}
{"action":"add_header","header":"Authorization","value":"Bearer token","message":"Added Authorization header"}  
{"action":"change_body","body":"complete_new_body_content","message":"Updated request body"}

CRITICAL DISTINCTIONS:
- "replace X with Y" → replaceInCurrentRequest (direct text replacement in current request)
- "search for X" or "find X" → searchHttpHistory (navigate to HTTP History and search directly)
- "filter for X" or "create filter for X" → addFilter (create a SAVED filter)
- "scope for domain.com" → addScope (sets testing scope)
- "rename tab" → renameReplayTab (renames current tab)
- "replace selected text" → activeEditorReplaceSelection (direct editor action)

SCOPE EXAMPLES:
- "scope for google.com" → {"action":"addScope","params":{"name":"Google Scope","allowlist":["*.google.com","google.com"]},"message":"Created scope for Google domain"}
- "create scope for API testing" → {"action":"addScope","params":{"name":"API Scope","allowlist":["api.example.com","*.api.example.com"]},"message":"Created API testing scope"}
- "remove scope named 'Netflix.com'" → {"action":"deleteScope","params":{"name":"Netflix.com"},"message":"Deleted scope Netflix.com"}
- "delete scope named 'test-scope'" → {"action":"deleteScope","params":{"name":"test-scope"},"message":"Deleted scope test-scope"}
- "update scope named 'TestScope' allowlist and denylist" → {"action":"updateScope","params":{"name":"TestScope","allowList":["example.com","*.example.com"],"denyList":["malicious.com"]},"message":"Updated TestScope configuration"}
- "add facebook.com to 'TestScope'" → {"action":"addToScope","params":{"scopeName":"TestScope","newDomains":["facebook.com","*.facebook.com"]},"message":"Added facebook.com to TestScope"}

CRITICAL PARAMETER NAMES (from Shift actionFunctions.txt):
- addScope: { name: string, allowlist: string[], denylist?: string[] }
- deleteScope: { name?: string, id?: string }  
- updateScope: { name: string, allowList: string[], denyList: string[] }
- addFilter: { name: string, query: string, alias: string }
- updateFilter: { id: string, name: string, alias: string, query: string }
- deleteFilter: { name?: string, id?: string }

SEARCH vs FILTER EXAMPLES:
- "search for google" → {"action":"searchHttpHistory","params":{"query":"google"},"message":"Searching for Google in HTTP History"}
- "find API endpoints" → {"action":"searchHttpHistory","params":{"query":"api"},"message":"Searching for API endpoints in HTTP History"}
- "search for 404 errors" → {"action":"searchHttpHistory","params":{"query":"404"},"message":"Searching for 404 errors in HTTP History"}
- "create filter for 404 errors" → {"action":"addFilter","params":{"name":"404 Errors","query":"resp.status.eq:404","alias":"404"},"message":"Created saved filter for 404 errors"}
- "save filter for POST requests" → {"action":"addFilter","params":{"name":"POST Requests","query":"req.method.eq:\"POST\"","alias":"post"},"message":"Created saved filter for POST requests"}

HTTPQL SYNTAX (namespace.field.operator:value):
- req.host.eq:"example.com" (exact host match)
- req.host.cont:"google" (host contains text)
- resp.status.gte:400 (status code >= 400)  
- resp.status.eq:404 (exact status code)
- req.method.eq:"POST" (HTTP method)
- req.path.cont:"/api" (path contains)
- resp.body.cont:"error" (response body contains)
- Complex: req.host.cont:"api" or req.path.cont:"/v1" (multiple conditions)

IMPORTANT RULES:
1. Return ONLY ONE JSON object
2. Never return multiple JSON objects or arrays  
3. Use DIRECT action names (preferred) instead of caido_action wrapper
4. Match parameter names EXACTLY as specified in Shift actionFunctions.txt
5. For scope actions: addScope uses "allowlist"/"denylist", updateScope uses "allowList"/"denyList" (camelCase)
6. For filter actions: all require "name", "query", and "alias" parameters  
7. For delete actions: can use either "name" or "id" parameter
8. For unsupported actions, return error with available actions list
9. For GraphQL requests, always provide complete modified JSON body using "change_body"
10. ALWAYS respond with valid JSON only. No explanations outside JSON.

QUOTED NAME EXTRACTION RULES:
- When user says 'remove scope named "Netflix.com"' → extract "Netflix.com" as the scope name
- When user says 'update scope named "test-scope"' → extract "test-scope" as the scope name  
- When user says 'delete filter named "API Filter"' → extract "API Filter" as the filter name
- ALWAYS extract exact text from quotes for name parameters
- Use exact scope/filter names from CURRENT SCOPES/FILTERS listed below

${currentScopesContext}

${currentFiltersContext}

SCOPE/FILTER MATCHING RULES:
- If quoted name matches existing scope/filter EXACTLY → use that exact name
- If quoted name is similar to existing scope/filter → use the existing one
- If no similar scope/filter exists → create new one with quoted name
- For scope updates: find existing scope first, then merge/update its allowlist

Current request context:
${context}

User command: ${command}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: command }
  ];

  if (provider === 'openai') {
    return await callOpenAI(config.apiKey, model, messages);
  } else if (provider === 'anthropic') {
    return await callAnthropic(config.apiKey, model, messages);
  } else if (provider === 'google') {
    return await callGoogle(config.apiKey, model, messages);
  } else if (provider === 'deepseek') {
    return await callDeepSeek(config.apiKey, model, messages);
  } else if (provider === 'local') {
    return await callLocal(config.url || 'http://localhost:11434', model, messages);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Process command with AI directly in frontend (legacy function)
 */
async function processWithAI(provider: string, config: any, command: string, context: string): Promise<string> {
  const systemPrompt = `You are Chatio, an expert security testing assistant for HTTP requests. 
Analyze the user's natural language command and return ONLY a JSON response with the appropriate action.

IMPORTANT: You ONLY modify the request, NEVER send it. The user will send it manually after your modifications.

Available actions:
- change_method: Change HTTP method (GET, POST, PUT, DELETE, etc.)
- add_header: Add/update a header
- remove_headers: Remove all headers except essential ones
- change_body: Modify request body
- remove_body: Remove request body completely
- add_param: Add URL parameters
- multiple_actions: For complex operations requiring multiple steps

For security tests, create appropriate headers/body modifications but do NOT send the request.

ALWAYS respond with valid JSON only. No explanations outside JSON.

Examples:
User: "change method to POST" → {"action":"change_method","method":"POST","message":"Changed method to POST"}
User: "add authorization header" → {"action":"add_header","header":"Authorization","value":"Bearer token_here","message":"Added Authorization header"}
User: "apply request smuggling" → {"action":"multiple_actions","actions":[{"action":"add_header","header":"Transfer-Encoding","value":"chunked"},{"action":"add_header","header":"Content-Length","value":"0"}],"message":"Applied request smuggling headers"}

Current request:
${context}

User command: ${command}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: command }
  ];

  if (provider === 'openai') {
    return await callOpenAI(config.apiKey, config.model || 'gpt-4o', messages);
  } else if (provider === 'anthropic') {
    return await callAnthropic(config.apiKey, config.model || 'claude-3-5-sonnet-20241022', messages);
  } else if (provider === 'google') {
    return await callGoogle(config.apiKey, config.model || 'gemini-1.5-pro', messages);
  } else if (provider === 'deepseek') {
    return await callDeepSeek(config.apiKey, config.model || 'deepseek-chat', messages);
  } else if (provider === 'local') {
    return await callLocal(config.url || 'http://localhost:11434', config.model || 'llama3.2', messages);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Call OpenAI API
 */
async function callOpenAI(apiKey: string, model: string, messages: any[]): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.1
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.choices[0]?.message?.content || '{"action":"error","message":"No response from AI"}';
}

/**
 * Call Anthropic API
 */
async function callAnthropic(apiKey: string, model: string, messages: any[]): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content || ''
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.content[0]?.text || '{"action":"error","message":"No response from AI"}';
}

/**
 * Call Google Gemini API
 */
async function callGoogle(apiKey: string, model: string, messages: any[]): Promise<string> {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Google API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.candidates[0]?.content?.parts[0]?.text || '{"action":"error","message":"No response from AI"}';
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(apiKey: string, model: string, messages: any[]): Promise<string> {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.1
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${data.error?.message || 'Unknown error'}`);
  }

  return data.choices[0]?.message?.content || '{"action":"error","message":"No response from AI"}';
}

/**
 * Call Local Ollama API
 */
async function callLocal(baseUrl: string, model: string, messages: any[]): Promise<string> {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 500
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Local API error: ${data.error || 'Unknown error'}`);
  }

  return data.response || '{"action":"error","message":"No response from AI"}';
}

/**
 * Show the Quick Action popup
 */
function showQuickActionPopup(sdk: FrontendSDK): void {
  if (isActive || quickActionApp) {
    return;
  }

  const editable = isInEditableTab();
  if (!editable) {
    const currentTab = getCurrentSidebarTab();
    const debugInfo = currentTab ? ` (Current tab: "${currentTab}")` : ' (No tab detected)';
    showToast('error', `Quick Action is available in Replay, Intercept, HTTP History, Scope, Files, and other editable tabs${debugInfo}`);
    
    // Additional debug information in console
    console.log('Chatio QuickActions Debug:', {
      currentTab,
      url: window.location.href,
      availableElements: {
        sidebar: !!document.querySelector('[role="menuitem"]'),
        replay: !!document.querySelector('[data-testid*="replay"]'),
        history: !!document.querySelector('[data-testid*="history"]'),
        intercept: !!document.querySelector('[data-testid*="intercept"]')
      }
    });
    return;
  }

  let context = getCurrentRequestContent();
  
  if (!context || context.trim() === '') {
    const sidebarTab = getCurrentSidebarTab();
    context = `Current tab: ${sidebarTab || 'Unknown'}. No specific request content available.`;
  }
  
  isActive = true;

  const popupContainer = document.createElement('div');
  popupContainer.id = 'quick-action-popup-container';
  document.body.appendChild(popupContainer);

  quickActionApp = createApp(QuickActionPopup, {
    visible: true,
    initialContext: context,
    onExecute: async (command: string, provider: string, model: string) => {
      showToast('info', `Processing with ${model}...`);
      
      const result = await executeQuickActionWithModel(sdk, command, context, provider, model);
      
      if (result.success) {
        showToast('success', result.message || 'Request modified successfully');
      } else {
        showToast('error', result.message || 'Failed to execute action');
      }
    },
    onClose: () => {
      closeQuickActionPopup();
    }
  });

  quickActionApp.use(PrimeVue, {
    unstyled: true,
    pt: Classic
  });

  quickActionApp.use(SDKPlugin, sdk);

  quickActionApp.mount(popupContainer);
}

/**
 * Close the Quick Action popup
 */
function closeQuickActionPopup(): void {
  if (quickActionApp) {
    quickActionApp.unmount();
    quickActionApp = null;
  }

  const container = document.getElementById('quick-action-popup-container');
  if (container) {
    container.remove();
  }

  isActive = false;
}

/**
 * Setup global keyboard listener for Quick Action
 */
function setupQuickActionShortcut(sdk: FrontendSDK): (() => void) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      
      showQuickActionPopup(sdk);
    }
    
    if (event.key === 'Escape' && isActive) {
      closeQuickActionPopup();
    }
  };

  document.addEventListener('keydown', handleKeyDown, true);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    closeQuickActionPopup();
  };
}

/**
 * Debug function to help troubleshoot QuickActions tab detection
 * Can be called from browser console: window.chatioDebugTabDetection()
 */
function debugTabDetection() {
  console.log('=== Chatio QuickActions Debug ===');
  
  const currentTab = getCurrentSidebarTab();
  const isEditable = isInEditableTab();
  
  console.log('Current tab detected:', currentTab);
  console.log('Is tab editable:', isEditable);
  console.log('Current URL:', window.location.href);
  
  // Test all selectors
  const selectors = [
    '.bg-surface-900[role="menuitem"]',
    '[aria-current="page"]', 
    '[data-is-selected="true"]',
    'nav [role="menuitem"].bg-surface-900',
    '.sidebar [role="menuitem"][aria-current="page"]',
    '.c-sidebar-item[data-is-active="true"] .c-sidebar__label',
    '.c-sidebar-item[data-is-active="true"]'
  ];
  
  console.log('Testing selectors:');
  selectors.forEach(selector => {
    const element = document.querySelector(selector);
    console.log(`  ${selector}:`, element ? element.textContent?.trim() : 'Not found');
  });
  
  // Check for page indicators
  const indicators = [
    '.replay-container, [data-testid*="replay"], .c-replay',
    '.history-container, [data-testid*="history"], .c-history', 
    '.intercept-container, [data-testid*="intercept"], .c-intercept',
    '.scope-container, [data-testid*="scope"], .c-scope'
  ];
  
  console.log('Testing page indicators:');
  indicators.forEach(selector => {
    const found = !!document.querySelector(selector);
    console.log(`  ${selector}:`, found ? 'Found' : 'Not found');
  });
  
  console.log('=== End Debug ===');
  
  return {
    currentTab,
    isEditable,
    url: window.location.href
  };
}

// Make debug function available globally
if (typeof window !== 'undefined') {
  (window as any).chatioDebugTabDetection = debugTabDetection;
}

export {
  setupQuickActionShortcut,
  showQuickActionPopup,
  closeQuickActionPopup,
  executeQuickAction,
  debugTabDetection
}; 