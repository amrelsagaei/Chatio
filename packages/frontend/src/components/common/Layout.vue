<template>
  <div class="chatio-app" :data-mode="currentMode">
    <header class="chatio-header">
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

    <main class="chatio-content">
      <div v-if="$slots.debug" class="chatio-debug-container">
        <slot name="debug" />
      </div>
      
      <slot :activeTab="activeTab" />
    </main>

    <div class="chatio-status-bar">
      <div class="chatio-status-indicator">
        <div :class="[
          'w-2 h-2 rounded-full',
          connectionStatus?.type === 'connected' ? 'bg-green-500' : 
          connectionStatus?.type === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
          'bg-red-500'
        ]"></div>
        <span>Chatio</span>
        <span v-if="currentProject">• Project: {{ currentProject.name }}</span>
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

interface Props {
  defaultTab?: string;
  connectionStatus?: {
    type: 'connected' | 'connecting' | 'disconnected';
    text: string;
  } | null;
  messageCount?: number | null;
  lastSync?: Date | null;
  activeProvider?: string | null;
  currentProject?: {
    id: string | null;
    name: string;
  } | null;
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'chat',
  connectionStatus: null,
  messageCount: null,
  lastSync: null,
  activeProvider: null,
  currentProject: null
});

const emit = defineEmits<{
  tabChanged: [tabId: string];
  themeChanged: [mode: 'light' | 'dark'];
}>();

const activeTab = ref(props.defaultTab);
const currentMode = ref<'light' | 'dark'>('dark');

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

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;
  emit('tabChanged', tabId);
};

const toggleTheme = () => {
  currentMode.value = currentMode.value === 'dark' ? 'light' : 'dark';
  emit('themeChanged', currentMode.value);
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const loadTheme = () => {
};

onMounted(() => {
  loadTheme();
});

defineExpose({
  activeTab
});
</script>

<style scoped>
</style> 