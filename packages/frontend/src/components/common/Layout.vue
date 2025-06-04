<template>
  <div class="chatio-app" :data-mode="currentMode">
    <!-- Clean Header - JWT Analyzer Style -->
    <header class="chatio-header">
      <!-- Navigation Tabs -->
      <nav class="chatio-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'chatio-tab',
            { 'active': activeTab === tab.id }
          ]"
          @click="setActiveTab(tab.id)"
        >
          <i :class="tab.icon" class="mr-2"></i>
          {{ tab.label }}
        </button>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <button
          class="chatio-theme-toggle"
          @click="toggleTheme"
          :title="currentMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <i :class="currentMode === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
          {{ currentMode === 'dark' ? 'Light' : 'Dark' }}
        </button>
        <div class="w-px h-4 bg-surface-300 dark:bg-surface-600 mx-2"></div>
        <div class="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
          <div :class="[
            'w-2 h-2 rounded-full',
            connectionStatus?.type === 'connected' ? 'bg-green-500' : 
            connectionStatus?.type === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          ]"></div>
          <span>{{ connectionStatus?.text || 'Ready' }}</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="chatio-content">
      <slot :activeTab="activeTab" />
    </main>

    <!-- Status Bar -->
    <div class="chatio-status-bar">
      <div class="chatio-status-indicator">
        <div :class="[
          'w-2 h-2 rounded-full',
          connectionStatus?.type === 'connected' ? 'bg-green-500' : 
          connectionStatus?.type === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
          'bg-red-500'
        ]"></div>
        <span>Chatio</span>
        <span v-if="messageCount">• {{ messageCount }} messages</span>
        <span v-if="activeProvider">• {{ activeProvider }}</span>
      </div>
      <div class="text-xs">
        <span v-if="lastSync">Last sync: {{ formatTime(lastSync) }}</span>
        <span v-else>Ready</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Props
interface Props {
  defaultTab?: string;
  connectionStatus?: {
    type: 'connected' | 'connecting' | 'disconnected';
    text: string;
  } | null;
  messageCount?: number | null;
  lastSync?: Date | null;
  activeProvider?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'chat',
  connectionStatus: null,
  messageCount: null,
  lastSync: null,
  activeProvider: null
});

// Emits
const emit = defineEmits<{
  tabChanged: [tabId: string];
  themeChanged: [mode: 'light' | 'dark'];
}>();

// State
const activeTab = ref(props.defaultTab);
const currentMode = ref<'light' | 'dark'>('dark'); // Default to dark

// Clean Navigation tabs
const tabs = [
  {
    id: 'chat',
    label: 'Chat',
    icon: 'fas fa-comments'
  },
  {
    id: 'settings',
    label: 'Settings', 
    icon: 'fas fa-cog'
  },
  {
    id: 'help',
    label: 'Help & Docs',
    icon: 'fas fa-question-circle'
  }
];

// Methods
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
  emit('tabChanged', tabId);
};

const toggleTheme = () => {
  currentMode.value = currentMode.value === 'dark' ? 'light' : 'dark';
  emit('themeChanged', currentMode.value);
  localStorage.setItem('chatio-theme', currentMode.value);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Load saved theme
const loadTheme = () => {
  const saved = localStorage.getItem('chatio-theme');
  if (saved === 'light' || saved === 'dark') {
    currentMode.value = saved;
  }
};

// Lifecycle
onMounted(() => {
  loadTheme();
});

// Expose activeTab for parent components
defineExpose({
  activeTab
});
</script>

<style scoped>
/* Component styles are handled by design-system.css */
</style> 