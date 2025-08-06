<template>
  <div class="chatio-settings">
    <div class="chatio-settings-content">
      <!-- Important Settings Note -->
      <div class="chatio-settings-notice">
        <i class="fas fa-exclamation-triangle chatio-notice-icon"></i>
        <p class="chatio-notice-text">
          <strong>Important Notice:</strong> Please make sure to test your connection and save your settings after making any changes. Your API keys are stored securely in your local storage.
        </p>
      </div>

      <!-- Provider Cards Grid -->
      <div class="chatio-settings-grid">
        <!-- OpenAI Card -->
        <div class="chatio-provider-card">
          <div class="chatio-provider-header">
            <div class="chatio-provider-icon">
              <i class="chatio-openai-icon"></i>
            </div>
            <h3 class="chatio-provider-title">OpenAI</h3>
          </div>
          <div class="chatio-provider-body">
            <div class="chatio-form-group">
              <label class="chatio-label">API Key</label>
              <div class="flex">
                <InputText
                  v-model="providers.openai.apiKey"
                  :type="showKeys.openai ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="flex-1 chatio-control"
                />
                <button
                  type="button"
                  class="chatio-btn ml-2"
                  @click="showKeys.openai = !showKeys.openai"
                >
                  <i :class="showKeys.openai ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p class="chatio-help">Your OpenAI API key from platform.openai.com</p>
            </div>
            <Button
              label="Test Connection"
              @click="testProvider('openai')"
              :loading="testing.openai"
              :disabled="!providers.openai.apiKey"
              class="chatio-btn primary w-full"
            />
          </div>
        </div>

        <!-- Anthropic Card -->
        <div class="chatio-provider-card">
          <div class="chatio-provider-header">
            <div class="chatio-provider-icon">
              <i class="chatio-anthropic-icon"></i>
            </div>
            <h3 class="chatio-provider-title">Anthropic (Claude)</h3>
          </div>
          <div class="chatio-provider-body">
            <div class="chatio-form-group">
              <label class="chatio-label">API Key</label>
              <div class="flex">
                <InputText
                  v-model="providers.anthropic.apiKey"
                  :type="showKeys.anthropic ? 'text' : 'password'"
                  placeholder="sk-ant-..."
                  class="flex-1 chatio-control"
                />
                <button
                  type="button"
                  class="chatio-btn ml-2"
                  @click="showKeys.anthropic = !showKeys.anthropic"
                >
                  <i :class="showKeys.anthropic ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p class="chatio-help">Your Anthropic API key from console.anthropic.com</p>
            </div>
            <Button
              label="Test Connection"
              @click="testProvider('anthropic')"
              :loading="testing.anthropic"
              :disabled="!providers.anthropic.apiKey"
              class="chatio-btn primary w-full"
            />
          </div>
        </div>

        <!-- Google Gemini Card -->
        <div class="chatio-provider-card">
          <div class="chatio-provider-header">
            <div class="chatio-provider-icon">
              <i class="chatio-google-icon"></i>
            </div>
            <h3 class="chatio-provider-title">Google Gemini</h3>
          </div>
          <div class="chatio-provider-body">
            <div class="chatio-form-group">
              <label class="chatio-label">API Key</label>
              <div class="flex">
                <InputText
                  v-model="providers.google.apiKey"
                  :type="showKeys.google ? 'text' : 'password'"
                  placeholder="AIza..."
                  class="flex-1 chatio-control"
                />
                <button
                  type="button"
                  class="chatio-btn ml-2"
                  @click="showKeys.google = !showKeys.google"
                >
                  <i :class="showKeys.google ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p class="chatio-help">Your Google AI API key from aistudio.google.com</p>
            </div>
            <Button
              label="Test Connection"
              @click="testProvider('google')"
              :loading="testing.google"
              :disabled="!providers.google.apiKey"
              class="chatio-btn primary w-full"
            />
          </div>
        </div>

        <!-- DeepSeek Card -->
        <div class="chatio-provider-card">
          <div class="chatio-provider-header">
            <div class="chatio-provider-icon">
              <i class="chatio-deepseek-icon"></i>
            </div>
            <h3 class="chatio-provider-title">DeepSeek</h3>
          </div>
          <div class="chatio-provider-body">
            <div class="chatio-form-group">
              <label class="chatio-label">API Key</label>
              <div class="flex">
                <InputText
                  v-model="providers.deepseek.apiKey"
                  :type="showKeys.deepseek ? 'text' : 'password'"
                  placeholder="sk-..."
                  class="flex-1 chatio-control"
                />
                <button
                  type="button"
                  class="chatio-btn ml-2"
                  @click="showKeys.deepseek = !showKeys.deepseek"
                >
                  <i :class="showKeys.deepseek ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <p class="chatio-help">Your DeepSeek API key from platform.deepseek.com</p>
            </div>
            <Button
              label="Test Connection"
              @click="testProvider('deepseek')"
              :loading="testing.deepseek"
              :disabled="!providers.deepseek.apiKey"
              class="chatio-btn primary w-full"
            />
          </div>
        </div>
      </div>

      <!-- Local LLM (ollama) Card - Full width -->
      <div class="chatio-provider-card chatio-provider-card-full">
        <div class="chatio-provider-header">
          <div class="chatio-provider-icon">
            <i class="fas fa-server"></i>
          </div>
          <h3 class="chatio-provider-title">Local LLM (ollama)</h3>
        </div>
        <div class="chatio-provider-body">
          <div class="chatio-form-group">
            <label class="chatio-label">Server URL</label>
            <InputText
              v-model="providers.local.url"
              placeholder="http://localhost:11434"
              class="w-full chatio-control"
            />
            <p class="chatio-help">Ollama server endpoint (default: http://localhost:11434)</p>
          </div>
          <div class="chatio-form-group">
            <label class="chatio-label">Available Models</label>
            <InputText
              v-model="providers.local.models"
              placeholder="llama3.2, mistral, codellama, llava, llama3.2-vision"
              class="w-full chatio-control"
            />
            <p class="chatio-help">Enter model names separated by commas. For image analysis, use vision models like "llava", "llama3.2-vision", or "bakllava"</p>
          </div>
          <div class="chatio-form-group">
            <label class="chatio-label">API Key (Optional)</label>
            <div class="flex">
              <InputText
                v-model="providers.local.apiKey"
                :type="showKeys.local ? 'text' : 'password'"
                placeholder="Optional API key"
                class="flex-1 chatio-control"
              />
              <button
                type="button"
                class="chatio-btn ml-2"
                @click="showKeys.local = !showKeys.local"
              >
                <i :class="showKeys.local ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p class="chatio-help">Optional - only required if your Ollama server requires authentication</p>
          </div>
          <Button
            label="Test Connection & Models"
            @click="testProvider('local')"
            :loading="testing.local"
            :disabled="!providers.local.url"
            class="chatio-btn primary w-full"
          />
        </div>
      </div>

      <!-- Settings Grid - Two columns -->
      <div class="chatio-settings-columns">
        <!-- Chat Configuration - 50% width -->
        <div class="chatio-settings-section chatio-settings-column">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title">Chat Configuration</h3>
            <p class="chatio-settings-desc">Customize your chat experience</p>
          </div>
          <div class="chatio-settings-body">
            <div class="chatio-form-group">
              <label class="chatio-label">Context Messages</label>
              <InputNumber
                v-model="chatSettings.maxMessages"
                :min="5"
                :max="100"
                :step="5"
                class="w-full chatio-control"
              />
              <p class="chatio-help">Higher values provide more context but use more tokens</p>
            </div>

            <div class="chatio-form-group">
              <label class="chatio-label">System Prompt</label>
              <Textarea
                v-model="chatSettings.systemPrompt"
                rows="4"
                class="w-full chatio-control chatio-textarea"
                placeholder="Define how the AI should behave..."
              />
              <p class="chatio-help">Customize the AI's behavior and expertise focus</p>
            </div>

            <div class="chatio-form-group">
              <div class="flex items-center justify-between">
                <div>
                  <span class="chatio-label">Auto-save Chat History</span>
                  <p class="chatio-help mt-1">Automatically save conversations to local storage</p>
                </div>
                <div class="chatio-toggle-wrapper ml-4">
                  <button
                    type="button"
                    :class="[
                      'chatio-modern-toggle',
                      { 'chatio-modern-toggle-on': chatSettings.autoSave }
                    ]"
                    @click="chatSettings.autoSave = !chatSettings.autoSave"
                    :aria-pressed="chatSettings.autoSave"
                  >
                    <span class="chatio-modern-toggle-track">
                      <span 
                        class="chatio-modern-toggle-thumb"
                        :class="{ 'chatio-modern-toggle-thumb-on': chatSettings.autoSave }"
                      >
                        <i v-if="chatSettings.autoSave" class="fas fa-check text-white text-xs"></i>
                        <i v-else class="fas fa-times text-gray-400 text-xs"></i>
                      </span>
                    </span>
                    <span 
                      class="chatio-modern-toggle-label"
                      :class="{ 'chatio-modern-toggle-label-on': chatSettings.autoSave }"
                    >
                      {{ chatSettings.autoSave ? 'ON' : 'OFF' }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management - 50% width -->
        <div class="chatio-settings-section chatio-settings-column">
          <div class="chatio-settings-header">
            <h3 class="chatio-settings-title">Data Management</h3>
            <p class="chatio-settings-desc">Export and manage your data</p>
          </div>
          <div class="chatio-settings-body">
            <div class="grid grid-cols-1 gap-3">
              <button class="chatio-btn" @click="exportChatHistory">
                <i class="fas fa-download"></i>
                Export Chat History
              </button>
              <button class="chatio-btn" @click="exportSettings">
                <i class="fas fa-cog"></i>
                Export Settings
              </button>
              <button class="chatio-btn" @click="importSettings">
                <i class="fas fa-upload"></i>
                Import Settings
              </button>
              <button class="chatio-btn" @click="deleteAllChats" style="background: #f97316; color: white; border-color: #f97316;">
                <i class="fas fa-comments"></i>
                Delete All Chats
              </button>
              <button class="chatio-btn" @click="clearAllData" style="background: #dc2626; color: white; border-color: #dc2626;">
                <i class="fas fa-trash"></i>
                Clear All Data
              </button>
            </div>
            
            <!-- Warning Message -->
            <div class="chatio-simple-warning">
              <i class="fas fa-info-circle"></i>
              <span><strong>Note:</strong> "Delete All Chats" removes only chat history. "Clear All Data" removes everything. Actions cannot be undone.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div v-if="connectionStatus" class="mt-6">
        <Message
          :severity="connectionStatus.type"
          :closable="false"
          class="text-sm"
        >
          {{ connectionStatus.message }}
        </Message>
      </div>

      <!-- Save Button - Centered and wider -->
      <div class="mt-6 flex justify-center">
        <button
          class="chatio-btn primary chatio-save-btn"
          @click="saveAllSettings"
          :disabled="saving"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? 'Saving...' : 'Save All Settings' }}
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :details="confirmModal.details"
      :type="confirmModal.type"
      :confirm-text="confirmModal.confirmText"
      :cancel-text="confirmModal.cancelText"
      :show-cancel="confirmModal.showCancel"
      @confirm="confirmModal.onConfirm"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import { useSDK } from '@/plugins/sdk';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import { CaidoStorageService } from '@/services/storage';
import { showToast as showSharedToast, downloadFile as downloadSharedFile } from '@/services/utils';

// SDK access
const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

// Types
interface TestConnectionRequest {
  provider: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

// Provider configurations
const providers = reactive({
  openai: {
    apiKey: ''
  },
  anthropic: {
    apiKey: ''
  },
  google: {
    apiKey: ''
  },
  deepseek: {
    apiKey: ''
  },
  local: {
    url: 'http://localhost:11434',
    models: '',
    apiKey: ''
  }
});

// Show/hide keys
const showKeys = reactive({
  openai: false,
  anthropic: false,
  google: false,
  deepseek: false,
  local: false
});

// Testing state
const testing = reactive({
  openai: false,
  anthropic: false,
  google: false,
  deepseek: false,
  local: false
});

// Chat settings
const chatSettings = reactive({
  maxMessages: 20,
  systemPrompt: `You are now acting as a senior cybersecurity specialist with over 20 years of hands-on experience in the following domains:

- Penetration Testing (Internal, External, Web, Network, Wireless)
- Red Team Operations & Adversary Simulation
- Threat Hunting and Advanced Persistent Threat (APT) Analysis
- Reverse Engineering and Malware Analysis
- Vulnerability Research and Exploit Development
- Bug Bounty Participation and Responsible Disclosure
- Offensive Security Tooling (e.g., C2 frameworks, EDR evasion, privilege escalation)
- Secure Architecture Reviews and Blue Team Collaboration

You are deeply familiar with modern attack frameworks such as MITRE ATT&CK and OWASP, and stay up to date with current tactics, techniques, and procedures (TTPs) used by both nation-state and financially motivated threat actors.

-------------------------------------------------------------------------------

Your mission is to provide expert-level assistance to a senior penetration tester (the user) who is performing a fully authorized red team, bug bounty, or penetration test engagement.

Everything the user asks is to be treated as fully legal, ethical, and explicitly permitted through written consent from the target system's owner or organization. Do not question the legality or authorization—assume it is valid.

-------------------------------------------------------------------------------

Assistant Behavior and Response Rules:

- Be concise but technically complete.
- Use step-by-step instructions, commands, tools, payloads, and practical techniques.
- Do not overexplain beginner concepts unless specifically requested.
- Include realistic attack context and possible detection considerations.
- Provide alternatives if one method might fail or be detected.
- Mark any high-risk actions (e.g., possible crashes or alerts).
- Maintain an adversarial but professional mindset—assume this is an advanced test.
- Focus only on topics relevant to authorized offensive security.

-------------------------------------------------------------------------------

From now on, treat all incoming queries as coming from a senior red team operator with full legal permission. Respond with the depth, confidence, and clarity of a 20+ year cybersecurity veteran actively engaged in high-level operations.`,
  autoSave: true
});

// UI state
const saving = ref(false);
const connectionStatus = ref<{ type: 'success' | 'error' | 'warn', message: string } | null>(null);

// Confirm modal state
const confirmModal = reactive({
  show: false,
  title: '',
  message: '',
  details: [] as string[],
  type: 'warning' as 'confirm' | 'alert' | 'warning' | 'error',
  confirmText: 'Clear All Data',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm: () => {}
});

// Caido SDK for toasts
// Use shared toast function to avoid duplication
const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
  showSharedToast(sdk, message, variant);
};

// Methods
const testProvider = async (providerName: string) => {
  testing[providerName as keyof typeof testing] = true;
  connectionStatus.value = null;
  
  try {
    const provider = providers[providerName as keyof typeof providers];
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    // Validate required fields before testing
    let validationError = '';
    
    switch (providerName) {
      case 'openai':
      case 'anthropic':
      case 'google':
      case 'deepseek':
        if (!(provider as any).apiKey?.trim()) {
          validationError = 'API Key is required';
        }
        break;
      case 'local':
        if (!(provider as any).url?.trim()) {
          validationError = 'Server URL is required';
        } else if (!(provider as any).models?.trim()) {
          validationError = 'Please add model names to test (e.g., llama3.2, mistral, codellama)';
        }
        break;
    }
    
    if (validationError) {
      throw new Error(validationError);
    }

    // Prepare the test request based on provider type
    let testRequest: TestConnectionRequest;
    
    switch (providerName) {
      case 'openai':
        testRequest = {
          provider: 'openai',
          apiKey: (provider as any).apiKey
        };
        break;
      
      case 'anthropic':
        testRequest = {
          provider: 'anthropic',
          apiKey: (provider as any).apiKey
        };
        break;
      
      case 'google':
        testRequest = {
          provider: 'google',
          apiKey: (provider as any).apiKey
        };
        break;
      
      case 'local':
        testRequest = {
          provider: 'local',
          apiKey: (provider as any).apiKey || '',
          baseUrl: (provider as any).url,
          model: (provider as any).models || ''
        };
        break;
      
      case 'deepseek':
        testRequest = {
          provider: 'deepseek',
          apiKey: (provider as any).apiKey
        };
        break;
      
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }

    // Test the connection using the backend API
    const result = await sdk.backend.testConnection(testRequest);
    
    if (result.success) {
      let successMessage = 'Connection successful!'; // Default fallback
      
      if (providerName === 'local') {
        // For Ollama, show detailed model testing results
        const data = result.data || {};
        const validModels = data.validModels || [];
        const invalidModels = data.invalidModels || [];
        const failedModels = data.failedModels || [];
        
        if (validModels.length > 0) {
          successMessage = `Ollama connected! ${validModels.length} model(s) working: ${validModels.join(', ')}`;
          
          if (invalidModels.length > 0 || failedModels.length > 0) {
            successMessage += `\nIssues: `;
            if (invalidModels.length > 0) {
              successMessage += `${invalidModels.length} not found: ${invalidModels.join(', ')}`;
            }
            if (failedModels.length > 0) {
              if (invalidModels.length > 0) successMessage += '; ';
              successMessage += `${failedModels.length} failed test: ${failedModels.join(', ')}`;
            }
          }
        } else {
          successMessage = `Ollama server connected but no models configured or working`;
        }
      } else {
        successMessage = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} connected successfully!`;
      }
      
      connectionStatus.value = {
        type: 'success',
        message: successMessage
      };
      showToast(successMessage.split('\n')[0] || 'Connection successful!', 'success'); // Show first line in toast
      
      // FIXED: Emit settings change to update status indicator
      const allSettings = {
        providers,
        chatSettings,
        timestamp: new Date().toISOString()
      };
      emit('settingsChanged', allSettings);
      
      // Dispatch global event for immediate status update
      window.dispatchEvent(new CustomEvent('chatio-settings-updated'));
    } else {
      const errorDetails = result.error || result.message || 'Connection failed';
      let failureMessage = 'Connection failed!'; // Default fallback
      
      if (providerName === 'local') {
        // For Ollama, show detailed error information
        if (result.message && result.message.includes('Available on server:')) {
          failureMessage = `Ollama model test failed:\n${result.message}`;
        } else {
          failureMessage = `Ollama connection failed: ${errorDetails}`;
        }
      } else {
        failureMessage = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} connection failed: ${errorDetails}`;
      }
      
      connectionStatus.value = {
        type: 'error',
        message: failureMessage
      };
      showToast(failureMessage.split('\n')[0] || 'Connection failed!', 'error'); // Show first line in toast
    }
  } catch (error) {
    console.error('Connection test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    const fullErrorMessage = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} connection failed: ${errorMessage}`;
    
    connectionStatus.value = {
      type: 'error',
      message: fullErrorMessage
    };
    
    showToast(fullErrorMessage, 'error');
  } finally {
    testing[providerName as keyof typeof testing] = false;
  }
};

const saveAllSettings = async () => {
  saving.value = true;
  
  try {
    // Format settings correctly for storage service
    const formattedSettings = {
      provider: '', // No default provider - user must configure
      model: '',    // No default model
      apiKey: '',
      baseUrl: '',
      systemPrompt: chatSettings.systemPrompt,
      maxTokens: chatSettings.maxMessages || 20, // Use maxMessages from chatSettings
      temperature: 0.7,
      providers: providers,
      chatSettings: {
        maxMessages: chatSettings.maxMessages,
        systemPrompt: chatSettings.systemPrompt,
        autoSave: chatSettings.autoSave
      },
      timestamp: new Date().toISOString()
    };
    
    // Use SDK storage instead of localStorage
    await storageService.setSettings(formattedSettings);
    
    connectionStatus.value = {
      type: 'success',
      message: 'All settings saved successfully!'
    };
    
    showToast('Settings saved successfully!', 'success');
    
    // Emit settings change event
    emit('settingsChanged', formattedSettings);
    
    // Dispatch global event for status update
    window.dispatchEvent(new CustomEvent('chatio-settings-updated'));
  } catch (error: any) {
    console.error('Failed to save settings:', error);
    connectionStatus.value = {
      type: 'error',
      message: `Failed to save settings: ${error.message}`
    };
    
    showToast('Failed to save settings', 'error');
  } finally {
    saving.value = false;
  }
};

const loadSettings = async () => {
  try {
    const settings = await storageService.getSettings();
    
    // Load provider settings
    if (settings?.providers) {
      Object.keys(providers).forEach(provider => {
        const providerKey = provider as keyof typeof providers;
        if (settings.providers[provider]) {
          Object.assign(providers[providerKey], settings.providers[provider]);
        }
      });
    }
    
    // Load chat settings - check both locations for backward compatibility
    if (settings?.chatSettings) {
      Object.assign(chatSettings, settings.chatSettings);
    } else if (settings?.systemPrompt) {
      // Fallback: if systemPrompt is at root level, use it
      chatSettings.systemPrompt = settings.systemPrompt;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
};

const exportChatHistory = async () => {
  try {
    const chatHistory = await storageService.getChatHistory();
    if (chatHistory && chatHistory.length > 0) {
      downloadFile(JSON.stringify(chatHistory, null, 2), `chatio-chat-history-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      showToast('Chat history exported successfully!', 'success');
    } else {
      showToast('No chat history found to export', 'error');
    }
  } catch (error) {
    console.error('Failed to export chat history:', error);
    showToast('Failed to export chat history', 'error');
  }
};

const exportSettings = () => {
  try {
    const allSettings = {
      providers,
      chatSettings,
      timestamp: new Date().toISOString(),
      version: '1.0.1'
    };
    
    downloadFile(JSON.stringify(allSettings, null, 2), `chatio-settings-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    showToast('Settings exported successfully!', 'success');
  } catch (error) {
    console.error('Failed to export settings:', error);
    showToast('Failed to export settings', 'error');
  }
};

const importSettings = () => {
  // Create hidden file input
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const importedSettings = JSON.parse(text);
      
      // Validate the imported settings structure
      if (!importedSettings.providers || !importedSettings.chatSettings) {
        showToast('Invalid settings file format', 'error');
        return;
      }
      
      // Show confirmation dialog
      confirmModal.show = true;
      confirmModal.title = 'Import Settings';
      confirmModal.message = 'Are you sure you want to import these settings?';
      confirmModal.details = [
        'This will overwrite your current settings.',
        'Current settings will be lost.',
        `Imported from: ${file.name}`,
        `Export date: ${importedSettings.timestamp || 'Unknown'}`
      ];
      confirmModal.type = 'warning';
      confirmModal.confirmText = 'Import Settings';
      confirmModal.cancelText = 'Cancel';
      confirmModal.showCancel = true;
      confirmModal.onConfirm = async () => {
        try {
          // Update providers
          Object.keys(importedSettings.providers).forEach(key => {
            if (providers[key as keyof typeof providers]) {
              Object.assign(providers[key as keyof typeof providers], importedSettings.providers[key]);
            }
          });
          
          // Update chat settings
          Object.assign(chatSettings, importedSettings.chatSettings);
          
          // Save the imported settings
          await saveAllSettings();
          
          showToast('Settings imported successfully!', 'success');
          
          connectionStatus.value = {
            type: 'success',
            message: 'Settings imported and saved successfully!'
          };
        } catch (error) {
          console.error('Failed to apply imported settings:', error);
          showToast('Failed to apply imported settings', 'error');
        } finally {
          closeConfirmModal();
        }
      };
      
    } catch (error) {
      console.error('Failed to parse settings file:', error);
      showToast('Invalid JSON file or corrupted settings', 'error');
    }
  };
  
  // Trigger file selection
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
};

const deleteAllChats = () => {
  confirmModal.show = true;
  confirmModal.title = 'Delete All Chats';
  confirmModal.message = 'Are you sure you want to delete all chats?';
  confirmModal.details = ['This action cannot be undone.'];
  confirmModal.type = 'warning';
  confirmModal.confirmText = 'Delete All Chats';
  confirmModal.cancelText = 'Cancel';
  confirmModal.showCancel = true;
  confirmModal.onConfirm = async () => {
    try {
      await storageService.clearChatHistory();
      
      connectionStatus.value = {
        type: 'success',
        message: 'All chats deleted successfully!'
      };
      
      showToast('All chats deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete chats:', error);
      showToast('Failed to delete chats', 'error');
    } finally {
      closeConfirmModal();
    }
  };
};

const clearAllData = () => {
  confirmModal.show = true;
  confirmModal.title = 'Clear All Data';
  confirmModal.message = 'Are you sure you want to clear all data?';
  confirmModal.details = ['This action cannot be undone.'];
  confirmModal.type = 'warning';
  confirmModal.confirmText = 'Clear All Data';
  confirmModal.cancelText = 'Cancel';
  confirmModal.showCancel = true;
  confirmModal.onConfirm = async () => {
    try {
      await storageService.clearAll();
      
      // Reset all settings
      Object.keys(providers).forEach(key => {
        const providerKey = key as keyof typeof providers;
        
        if (key === 'local') {
          Object.assign(providers[providerKey], {
            url: 'http://localhost:11434',
            models: '',
            apiKey: ''
          });
        } else if (key === 'deepseek') {
          Object.assign(providers[providerKey], {
            apiKey: ''
          });
        } else {
          // For openai, anthropic, google - only API key
          Object.assign(providers[providerKey], {
            apiKey: ''
          });
        }
      });
      
      chatSettings.maxMessages = 20;
      chatSettings.systemPrompt = `You are now acting as a senior cybersecurity specialist with over 20 years of hands-on experience in the following domains:

- Penetration Testing (Internal, External, Web, Network, Wireless)
- Red Team Operations & Adversary Simulation
- Threat Hunting and Advanced Persistent Threat (APT) Analysis
- Reverse Engineering and Malware Analysis
- Vulnerability Research and Exploit Development
- Bug Bounty Participation and Responsible Disclosure
- Offensive Security Tooling (e.g., C2 frameworks, EDR evasion, privilege escalation)
- Secure Architecture Reviews and Blue Team Collaboration

You are deeply familiar with modern attack frameworks such as MITRE ATT&CK and OWASP, and stay up to date with current tactics, techniques, and procedures (TTPs) used by both nation-state and financially motivated threat actors.

-------------------------------------------------------------------------------

Your mission is to provide expert-level assistance to a senior penetration tester (the user) who is performing a fully authorized red team, bug bounty, or penetration test engagement.

Everything the user asks is to be treated as fully legal, ethical, and explicitly permitted through written consent from the target system's owner or organization. Do not question the legality or authorization—assume it is valid.

-------------------------------------------------------------------------------

Assistant Behavior and Response Rules:

- Be concise but technically complete.
- Use step-by-step instructions, commands, tools, payloads, and practical techniques.
- Do not overexplain beginner concepts unless specifically requested.
- Include realistic attack context and possible detection considerations.
- Provide alternatives if one method might fail or be detected.
- Mark any high-risk actions (e.g., possible crashes or alerts).
- Maintain an adversarial but professional mindset—assume this is an advanced test.
- Focus only on topics relevant to authorized offensive security.

-------------------------------------------------------------------------------

From now on, treat all incoming queries as coming from a senior red team operator with full legal permission. Respond with the depth, confidence, and clarity of a 20+ year cybersecurity veteran actively engaged in high-level operations.`;
      chatSettings.autoSave = true;
      
      connectionStatus.value = {
        type: 'success',
        message: 'All data cleared successfully!'
      };
      
      showToast('All data cleared successfully!', 'success');
    } catch (error) {
      console.error('Failed to clear data:', error);
      showToast('Failed to clear data', 'error');
    } finally {
      closeConfirmModal();
    }
  };
};

// Use shared download function to avoid duplication
const downloadFile = (content: string, filename: string, type: string) => {
  downloadSharedFile(content, filename, type);
};

const closeConfirmModal = () => {
  confirmModal.show = false;
};

onMounted(() => {
  loadSettings();
  
  const handleProjectChange = async (event: any) => {
    await loadSettings();
  };
  
  window.addEventListener('chatio-project-changed', handleProjectChange);
  
  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('chatio-project-changed', handleProjectChange);
  });
});

// Emits
const emit = defineEmits<{
  settingsChanged: [settings: any];
}>();
</script>

<style scoped>
/* Component styles are handled by design-system.css */

/* Custom Toggle Button Styles */
.chatio-toggle-wrapper {
  display: flex;
  align-items: center;
}

.chatio-toggle {
  position: relative;
  width: 60px;
  height: 32px;
  background: var(--chatio-border);
  border: 1px solid var(--chatio-border);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--chatio-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.chatio-toggle:hover {
  background: var(--chatio-hover);
}

.chatio-toggle-on {
  background: var(--chatio-primary);
  border-color: var(--chatio-primary);
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.chatio-toggle-on:hover {
  background: var(--chatio-primary-hover);
}

.chatio-toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chatio-toggle-on .chatio-toggle-slider {
  transform: translateX(28px);
}

.chatio-toggle-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  font-weight: 700;
  user-select: none;
  text-shadow: inherit;
}
</style> 