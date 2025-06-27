<template>
  <Layout
    :defaultTab="activeTab"
    :connectionStatus="connectionStatus"
    :messageCount="messageCount"
    :lastSync="lastSync"
    :activeProvider="activeProvider"
    :currentProject="currentProject"
    @tabChanged="handleTabChange"
    @exportRequested="handleExport"
    @historyRequested="handleHistory"
  >
    <!-- Debug Connection Test Panel - Only show in development mode -->
    <template #debug v-if="showDebugPanel">
      <div class="chatio-debug-panel">
        <div class="chatio-debug-header">
          <h4>Backend Connection Test</h4>
          <button 
            class="chatio-btn primary" 
            @click="testBackendConnection"
            :disabled="connectionTestStatus.testing"
          >
            <i v-if="connectionTestStatus.testing" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-plug"></i>
            {{ connectionTestStatus.testing ? 'Testing...' : 'Test Connection' }}
          </button>
        </div>
        
        <div v-if="connectionTestStatus.result" class="chatio-debug-result success">
          <div class="chatio-debug-status">
            <i class="fas fa-check-circle"></i>
            <strong>{{ connectionTestStatus.result.status }}</strong>
          </div>
          <div class="chatio-debug-details">
            <small>
              Timestamp: {{ connectionTestStatus.result.timestamp }}
              | Backend Active: {{ connectionTestStatus.result.backendActive ? 'Yes' : 'No' }}
              <span v-if="connectionTestStatus.lastTest"> 
                | Last tested: {{ connectionTestStatus.lastTest.toLocaleTimeString() }}
              </span>
            </small>
          </div>
        </div>
        
        <div v-if="connectionTestStatus.error" class="chatio-debug-result error">
          <div class="chatio-debug-status">
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Connection Failed</strong>
          </div>
          <div class="chatio-debug-details">
            <small>Error: {{ connectionTestStatus.error }}</small>
            <span v-if="connectionTestStatus.lastTest"> 
              | Last tested: {{ connectionTestStatus.lastTest.toLocaleTimeString() }}
            </span>
          </div>
        </div>
        
        <div v-if="!connectionTestStatus.result && !connectionTestStatus.error && !connectionTestStatus.testing" class="chatio-debug-result">
          <div class="chatio-debug-status">
            <i class="fas fa-info-circle"></i>
            <strong>Ready to test backend connection</strong>
          </div>
          <div class="chatio-debug-details">
            <small>Click "Test Connection" to verify backend is working</small>
          </div>
        </div>
      </div>
    </template>

    <template #default="{ activeTab }">
      <!-- Chat View with Enhanced Integration -->
      <ChatWindow
        v-if="activeTab === 'chat'"
        @messageCountChanged="updateMessageCount"
        @switchTab="handleTabSwitch"
      />
      
      <!-- Settings View with Better Status Updates -->
      <SettingsPanel
        v-else-if="activeTab === 'settings'"
        @settingsChanged="handleSettingsChange"
      />
      
      <!-- Help View -->
      <HelpPanel
        v-else-if="activeTab === 'help'"
        @promptSelected="handlePromptSelected"
      />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { useSDK } from '@/plugins/sdk';
import { CaidoStorageService } from '@/services/storage';

// Import our premium components
import Layout from '@/components/common/Layout.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import SettingsPanel from '@/components/settings/SettingsPanel.vue';
import HelpPanel from '@/components/common/HelpPanel.vue';

// SDK instance
const sdk = useSDK();
const storageService = new CaidoStorageService(sdk);

// Enhanced Application State
const activeTab = ref('chat');
const messageCount = ref(0);
const lastSync = ref<Date | null>(null);
const activeProvider = ref<string | null>(null);

// Project-based state
const currentProject = ref<{
  id: string | null;
  name: string;
}>({
  id: null,
  name: 'Global'
});

// Debug panel configuration - disabled by default for production
const showDebugPanel = ref(false);

// Enhanced connection status with more states
const connectionStatus = ref<{
  type: 'connected' | 'connecting' | 'disconnected';
  text: string;
}>({
  type: 'disconnected',
  text: 'Not configured'
});

// Add debug connection test functionality
const connectionTestStatus = ref<{
  testing: boolean;
  lastTest: Date | null;
  result: any | null;
  error: string | null;
}>({
  testing: false,
  lastTest: null,
  result: null,
  error: null
});

// Initialize project state
const initializeProject = async () => {
  try {
    const project = await sdk.backend.getCurrentProject();
    currentProject.value = {
      id: project.id,
      name: project.name
    };
  } catch (error) {
    console.error('Failed to get current project:', error);
    currentProject.value = { id: null, name: 'Global' };
  }
};

// COMPLETE PROJECT CHANGE HANDLER - Refreshes ALL components
const handleProjectChange = async (projectId: string | null) => {
  try {
    // 1. Update current project state immediately
    await initializeProject();
    
    // 2. Reset message count (will be updated when chat history loads)
    messageCount.value = 0;
    
    // 3. Update last sync time
    lastSync.value = new Date();
    
    // 4. Emit project change event to all child components
    window.dispatchEvent(new CustomEvent('chatio-project-changed', {
      detail: { projectId: currentProject.value.id }
    }));
    
    // 5. Update connection status (might depend on project)
    await updateConnectionStatus();
    
  } catch (error) {
    console.error('Failed to handle project change:', error);
  }
};

// Function to check if any API keys are configured
const checkApiKeyStatus = async () => {
  try {
    const settings = await storageService.getSettings();
    if (!settings) {
      return { hasKeys: false, count: 0 };
    }
    
    const providers = settings.providers || {};
    
    let hasValidKeys = false;
    let configuredCount = 0;
    
    // Check each provider for valid API keys
    for (const [providerName, config] of Object.entries(providers)) {
      const providerConfig = config as any;
      if (providerConfig?.apiKey && providerConfig.apiKey.trim()) {
        hasValidKeys = true;
        configuredCount++;
      }
    }
    
    return { hasKeys: hasValidKeys, count: configuredCount };
  } catch (error) {
    console.error('Error checking API key status:', error);
    return { hasKeys: false, count: 0 };
  }
};

// Function to update connection status based on API key availability
const updateConnectionStatus = async () => {
  const { hasKeys, count } = await checkApiKeyStatus();
  
  if (hasKeys) {
    connectionStatus.value = {
      type: 'connected',
      text: count === 1 ? 'Connected' : `Connected (${count} providers)`
    };
  } else {
    connectionStatus.value = {
      type: 'disconnected',
      text: 'Not configured'
    };
  }
};

// Enhanced Event Handlers
const handleTabChange = (tabId: string) => {
  activeTab.value = tabId;
  
  // Update last activity
  lastSync.value = new Date();
  
  // Log analytics
  sdk.console?.log(`Chatio: Switched to ${tabId} tab`);
};

const handleTabSwitch = (tabId: string) => {
  // Handle tab switching from child components - ACTUALLY SWITCH THE TAB
  
  activeTab.value = tabId;
  lastSync.value = new Date();
  
  // Emit the tab change to the Layout component
  nextTick(() => {
    // Trigger the layout tab change as well
    const layoutComponent = document.querySelector('.chatio-app');
    if (layoutComponent) {
      // Force a re-render of the tab system
      layoutComponent.dispatchEvent(new CustomEvent('tab-switch', { 
        detail: { tab: tabId },
        bubbles: true 
      }));
    }
  });
  
  // Log the switch
  sdk.console?.log(`Chatio: Tab switched to ${tabId} from child component`);
};

const updateMessageCount = (count: number) => {
  messageCount.value = count;
  lastSync.value = new Date();
  
  // Update connection status based on activity
  if (count > 0 && connectionStatus.value.type === 'connected') {
    connectionStatus.value = {
      type: 'connected',
      text: `Active - ${count} messages`
    };
  }
};

const handleSettingsChange = async (settings: any) => {
  try {
    // Save settings to SDK storage (now global)
    await storageService.setSettings(settings);
    
    // Update active provider
    activeProvider.value = settings.provider;
    
    // Update connection status based on overall API key configuration
    await updateConnectionStatus();
    
    // Update last sync
    lastSync.value = new Date();
    
    // Emit settings update event for other components
    window.dispatchEvent(new CustomEvent('chatio-settings-updated'));
    
    // Log configuration change
    sdk.console?.log('Chatio: Settings updated', {
      provider: settings.provider,
      hasApiKey: !!settings.apiKey,
      model: settings.model
    });
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

const handleExport = async () => {
  try {
    // Enhanced export with metadata
    const chatHistory = await storageService.getChatHistory() || [];
    const settings = await storageService.getSettings() || {};
    
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        exportType: 'full',
        messageCount: messageCount.value,
        activeProvider: activeProvider.value
      },
      chatHistory: chatHistory,
      settings: settings,
      statistics: {
        totalMessages: messageCount.value,
        lastActivity: lastSync.value?.toISOString(),
        connectionStatus: connectionStatus.value
      }
    };
    
    // Create enhanced export file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatio-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update status
    connectionStatus.value = {
      type: connectionStatus.value.type,
      text: 'Exported successfully'
    };
    
    sdk.console?.log('Chatio: Data exported successfully');
  } catch (error) {
    sdk.console?.error('Chatio: Export failed', error);
    connectionStatus.value = {
      type: 'disconnected',
      text: 'Export failed'
    };
  }
};

const handleHistory = () => {
  // Enhanced history handling
  activeTab.value = 'chat';
  
  // Could implement a dedicated history modal in the future
  sdk.console?.log('Chatio: History requested - navigating to chat');
};

const handlePromptSelected = (prompt: string) => {
  // TODO: Handle prompt selection
  
};

// Debug connection test function
const testBackendConnection = async () => {
  try {
    connectionTestStatus.value.testing = true;
    connectionTestStatus.value.error = null;
    

    
    // Test the debug connection endpoint
    const result = await sdk.backend.debugConnection();
    
    connectionTestStatus.value.result = result;
    connectionTestStatus.value.lastTest = new Date();
    connectionTestStatus.value.testing = false;
    
    
    
    // Update connection status
    if (result.backendActive) {
      connectionStatus.value = {
        type: 'connected',
        text: 'Backend connected'
      };
    }
    
  } catch (error) {
          console.error('Backend connection failed:', error);
    connectionTestStatus.value.error = error instanceof Error ? error.message : 'Unknown error';
    connectionTestStatus.value.testing = false;
    connectionTestStatus.value.lastTest = new Date();
    
    connectionStatus.value = {
      type: 'disconnected',
      text: 'Backend disconnected'
    };
  }
};

// Enhanced initialization
const initializeApp = async () => {
  // Load and apply saved settings and update status
  try {
    const savedSettings = await storageService.getSettings();
    if (savedSettings) {
      // Update connection status based on global settings
      await updateConnectionStatus();
    } else {
      // No settings, update status to show not configured
      await updateConnectionStatus();
    }
  } catch (error) {
    sdk.console?.error('Chatio: Failed to load settings', error);
    await updateConnectionStatus();
  }
  
  // Load message count from history
  try {
    const chatHistory = await storageService.getChatHistory();
    if (chatHistory && chatHistory.length > 0) {
      updateMessageCount(chatHistory.length);
    }
  } catch (error) {
    sdk.console?.error('Chatio: Failed to load chat history', error);
  }
  
  // Set initial last sync
  lastSync.value = new Date();
  
  // Add window event listener for custom tab switching
  window.addEventListener('chatio-switch-tab', handleCustomTabSwitch);
  
  // Listen for settings changes from other components
  window.addEventListener('chatio-settings-updated', handleSettingsUpdated);
  
  sdk.console?.log('Chatio: Application initialized');
};

// Single onMounted lifecycle handler
onMounted(async () => {
  // Initialize app first
  await initializeApp();
  
  // Initialize project state
  await initializeProject();
  
  // LISTEN FOR PROJECT CHANGES FROM CAIDO - Enhanced handler
  const projectChangeHandler = async () => {
    const newProjectId = await sdk.backend.getCurrentProjectId();
    
    // Only handle if project actually changed
    if (newProjectId !== currentProject.value.id) {
      await handleProjectChange(newProjectId);
    }
  };
  
  // Listen for project changes - use multiple methods for reliability
  if (sdk.projects?.onProjectChange) {
    sdk.projects.onProjectChange(projectChangeHandler);
  }
  
  // Also listen for manual project changes via events
  window.addEventListener('caido-project-changed', (event: any) => {
    const projectId = event.detail?.projectId;
    if (projectId !== currentProject.value.id) {
      handleProjectChange(projectId);
    }
  });
  
  // Test backend connection after a brief delay
  setTimeout(() => {
    testBackendConnection();
  }, 1000);
  
  // PERIODIC PROJECT CHECK - Ensures we catch project changes
  setInterval(async () => {
    try {
      const newProjectId = await sdk.backend.getCurrentProjectId();
      if (newProjectId !== currentProject.value.id) {
        await handleProjectChange(newProjectId);
      }
    } catch (error) {
      // Silent error - don't spam console
    }
  }, 2000); // Check every 2 seconds
});

// Cleanup event listeners to prevent memory leaks
onUnmounted(() => {
  // Remove custom event listeners
  window.removeEventListener('chatio-switch-tab', handleCustomTabSwitch);
  window.removeEventListener('chatio-settings-updated', handleSettingsUpdated);
  window.removeEventListener('chatio-prompt-selected', handlePromptSelection);
  window.removeEventListener('caido-project-changed', handleProjectChange);
  
  sdk.console?.log('Chatio: Application cleanup completed');
});

// Enhanced watchers for better state management
watch(activeProvider, (newProvider) => {
  if (newProvider) {
    sdk.console?.log(`Chatio: Active provider changed to ${newProvider}`);
  }
});

watch(connectionStatus, (newStatus) => {
  sdk.console?.log(`Chatio: Connection status: ${newStatus.type} - ${newStatus.text}`);
}, { deep: true });

// Cleanup selected prompt after a delay to prevent memory leaks
watch(activeTab, (newTab) => {
  if (newTab === 'chat') {
    setTimeout(() => {
      localStorage.removeItem('chatio-selected-prompt');
    }, 1000);
  }
});

// Define event handlers as separate functions for proper cleanup
const handleCustomTabSwitch = (event: any) => {
  const tabId = event.detail?.tab;
  if (tabId) {

    activeTab.value = tabId;
  }
};

const handleSettingsUpdated = () => {
  
  updateConnectionStatus();
};

const handlePromptSelection = (event: any) => {
  const prompt = event.detail?.prompt;
  if (prompt) {
    activeTab.value = 'chat';
    // Handle prompt selection logic here
  }
};
</script>

<style scoped>
/* App-level styles for enhanced UX */
.app-container {
  @apply h-full w-full;
}

/* Ensure smooth transitions between tabs */
:deep(.chatio-content) {
  transition: opacity 0.2s ease-in-out;
}

/* Loading states for better UX */
.app-loading {
  @apply flex items-center justify-center h-full;
}

.loading-spinner {
  @apply animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full;
}
</style>