<template>
  <Layout
    :defaultTab="activeTab"
    :connectionStatus="connectionStatus"
    :messageCount="messageCount"
    :lastSync="lastSync"
    :activeProvider="activeProvider"
    @tabChanged="handleTabChange"
    @exportRequested="handleExport"
    @historyRequested="handleHistory"
  >
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

// Import our premium components
import Layout from '@/components/common/Layout.vue';
import ChatWindow from '@/components/chat/ChatWindow.vue';
import SettingsPanel from '@/components/settings/SettingsPanel.vue';
import HelpPanel from '@/components/common/HelpPanel.vue';

// SDK instance
const sdk = useSDK();

// Enhanced Application State
const activeTab = ref('chat');
const messageCount = ref(0);
const lastSync = ref<Date | null>(null);
const activeProvider = ref<string | null>(null);

// Enhanced connection status with more states
const connectionStatus = ref<{
  type: 'connected' | 'connecting' | 'disconnected';
  text: string;
}>({
  type: 'disconnected',
  text: 'Not configured'
});

// Function to check if any API keys are configured
const checkApiKeyStatus = () => {
  try {
    const savedSettings = localStorage.getItem('chatio-settings');
    if (!savedSettings) {
      return { hasKeys: false, count: 0 };
    }
    
    const settings = JSON.parse(savedSettings);
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
const updateConnectionStatus = () => {
  const { hasKeys, count } = checkApiKeyStatus();
  
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
  console.log('Switching tab to:', tabId); // Debug log
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

const handleSettingsChange = (settings: any) => {
  // Update active provider
  activeProvider.value = settings.provider;
  
  // Update connection status based on overall API key configuration
  updateConnectionStatus();
  
  // Log configuration change
  sdk.console?.log('Chatio: Settings updated', {
    provider: settings.provider,
    hasApiKey: !!settings.apiKey,
    model: settings.model
  });
};

const handleExport = () => {
  try {
    // Enhanced export with metadata
    const chatHistory = localStorage.getItem('chatio-chat-history') || '[]';
    const settings = localStorage.getItem('chatio-settings') || '{}';
    
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        exportType: 'full',
        messageCount: messageCount.value,
        activeProvider: activeProvider.value
      },
      chatHistory: JSON.parse(chatHistory),
      settings: JSON.parse(settings),
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
  // Enhanced prompt selection with state management
  activeTab.value = 'chat';
  
  // Use a more sophisticated method to pass data to chat
  // For now, use localStorage as a bridge
  localStorage.setItem('chatio-selected-prompt', prompt);
  
  // Dispatch custom event for better component communication
  window.dispatchEvent(new CustomEvent('chatio-prompt-selected', {
    detail: { prompt }
  }));
  
  sdk.console?.log('Chatio: Prompt selected', prompt);
};

// Enhanced initialization
const initializeApp = () => {
  // Load and apply saved settings and update status
  try {
    const savedSettings = localStorage.getItem('chatio-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      handleSettingsChange(settings);
    } else {
      // No settings, update status to show not configured
      updateConnectionStatus();
    }
  } catch (error) {
    sdk.console?.error('Chatio: Failed to load settings', error);
    updateConnectionStatus();
  }
  
  // Load message count from history
  try {
    const chatHistory = localStorage.getItem('chatio-chat-history');
    if (chatHistory) {
      const messages = JSON.parse(chatHistory);
      updateMessageCount(messages.length);
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

// Lifecycle management
onMounted(() => {
  initializeApp();
});

// Cleanup event listeners to prevent memory leaks
onUnmounted(() => {
  // Remove custom event listeners
  window.removeEventListener('chatio-switch-tab', handleCustomTabSwitch);
  window.removeEventListener('chatio-settings-updated', handleSettingsUpdated);
  window.removeEventListener('chatio-prompt-selected', handlePromptSelection);
  
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
    console.log('Custom tab switch event received:', tabId);
    activeTab.value = tabId;
  }
};

const handleSettingsUpdated = () => {
  console.log('Settings updated event received');
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