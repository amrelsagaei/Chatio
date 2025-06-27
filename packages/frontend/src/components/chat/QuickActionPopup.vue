<template>
  <Dialog 
    v-model:visible="isVisible"
    :modal="true"
    :closable="false"
    :draggable="false"
    class="quick-action-dialog"
    position="center"
  >
    <template #header>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <i class="fas fa-robot text-red-400"></i>
          <span class="font-semibold text-sm">Chatio Quick Action</span>
        </div>
        <div class="text-xs text-gray-400 bg-red-900/30 px-2 py-1 rounded max-w-xs truncate border border-red-700/50">
          {{ contextSummary }}
        </div>
      </div>
    </template>

    <div class="quick-action-content">
      <!-- AI Model and Command Input Row -->
      <div class="mb-4">
        <div class="flex items-center gap-3 mb-3">
          <label class="text-xs font-medium text-gray-300 whitespace-nowrap">
            AI Model:
          </label>
          <Dropdown
            v-model="selectedModel"
            :options="availableModels"
            option-label="displayName"
            option-value="key"
            placeholder="Select Model"
            class="flex-1 model-dropdown-compact"
            :disabled="isLoading"
          />
        </div>
        
        <label class="block text-xs font-medium text-gray-300 mb-2">
          Natural Language Command
        </label>
        <Textarea
          ref="commandInput"
          v-model="command"
          placeholder="Examples:
• replace GET with POST in current request
• create scope for example.com domain
• create wordlist file with usernames: admin,root,user
• search for login endpoints in HTTP History"
          class="w-full command-input-large"
          :rows="8"
          :disabled="isLoading"
          @keydown="handleKeyDown"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          <kbd class="px-1.5 py-0.5 bg-red-900/30 rounded text-xs border border-red-700/50">Ctrl+Enter</kbd> execute • 
          <kbd class="px-1.5 py-0.5 bg-red-900/30 rounded text-xs border border-red-700/50">Esc</kbd> close
        </div>
        <div class="flex gap-4">
          <Button
            label="Cancel"
            severity="secondary"
            outlined
            size="small"
            @click="onClose"
            :disabled="isLoading"
            class="cancel-btn-small"
          />
          <Button
            label="Execute"
            icon="fas fa-play"
            size="small"
            :loading="isLoading"
            :disabled="!command.trim() || !selectedModel || isLoading"
            @click="executeCommand"
            class="execute-btn-small"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import { useSDK } from '../../plugins/sdk'

interface Props {
  visible: boolean
  initialContext?: string
  onExecute: (command: string, provider: string, model: string) => Promise<void>
  onClose: () => void
}

const props = defineProps<Props>()
const sdk = useSDK()

const isVisible = ref(props.visible)
const command = ref('')
const isLoading = ref(false)

const selectedModel = ref('')
const availableModels = ref<Array<{key: string, displayName: string, provider: string, model: string}>>([])

// Input field reference
const commandInput = ref<typeof Textarea>()

// Available models structure (same as ChatWindow)
const staticModels = {
  openai: [
    { model: 'gpt-4o', displayName: 'GPT-4o' },
    { model: 'gpt-4o-mini', displayName: 'GPT-4o Mini' },
    { model: 'gpt-4-turbo', displayName: 'GPT-4 Turbo' },
    { model: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo' }
  ],
  anthropic: [
    { model: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet' },
    { model: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
    { model: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
    { model: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
    { model: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' }
  ],
  google: [
    { model: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
    { model: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
    { model: 'gemini-pro', displayName: 'Gemini Pro' }
  ],
  deepseek: [
    { model: 'deepseek-chat', displayName: 'DeepSeek Chat' },
    { model: 'deepseek-reasoner', displayName: 'DeepSeek Reasoner' }
  ]
}

// Load available models from storage with smart defaults and last used memory
const loadAvailableModels = async () => {
  try {
    const storageData = await sdk.storage.get() as any
    const models: Array<{key: string, displayName: string, provider: string, model: string}> = []
    
    if (storageData?.globalSettings?.providers) {
      for (const [providerName, config] of Object.entries(storageData.globalSettings.providers)) {
        const typedConfig = config as any
        
        if (providerName === 'local') {
          // Handle local models
          const hasUrl = typedConfig?.url && typedConfig.url.trim() !== ''
          if (hasUrl) {
            const modelsString = typedConfig?.models || ''
            if (modelsString.trim()) {
              const modelNames = modelsString.split(',').map((m: string) => m.trim()).filter((m: string) => m)
              modelNames.forEach((model: string) => {
                const displayName = model.charAt(0).toUpperCase() + model.slice(1).replace(/-/g, ' ') + ' (ollama)'
                models.push({
                  key: `${providerName}-${model}`,
                  displayName,
                  provider: providerName,
                  model
                })
              })
            }
          }
        } else if (typedConfig?.apiKey) {
          // Handle API-based providers
          const providerModels = staticModels[providerName as keyof typeof staticModels]
          if (providerModels) {
            providerModels.forEach((modelInfo) => {
              models.push({
                key: `${providerName}-${modelInfo.model}`,
                displayName: modelInfo.displayName,
                provider: providerName,
                model: modelInfo.model
              })
            })
          }
        }
      }
    }
    
    availableModels.value = models
    
    // Smart model selection logic
    if (models.length > 0) {
      // First, check for last used model in storage
      const lastUsedModel = storageData?.quickActionSettings?.lastUsedModel
      if (lastUsedModel && models.find(m => m.key === lastUsedModel)) {
        selectedModel.value = lastUsedModel
        return
      }
      
      // If no last used model, apply smart defaults based on provider priority
      const defaultModels = {
        'openai': 'gpt-4o',
        'anthropic': 'claude-3-5-sonnet-20241022', 
        'google': 'gemini-1.5-flash',
        'deepseek': 'deepseek-reasoner'
      }
      
      // Find the first available model from preferred defaults
      for (const [provider, preferredModel] of Object.entries(defaultModels)) {
        const modelKey = `${provider}-${preferredModel}`
        if (models.find(m => m.key === modelKey)) {
          selectedModel.value = modelKey
          return
        }
      }
      
      // Fallback to first available model
      selectedModel.value = models[0].key
    }
  } catch (error) {
    console.error('Error loading models:', error)
  }
}

// Handle keyboard shortcuts
const handleKeyDown = async (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    props.onClose()
    return
  }
  
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault()
    await executeCommand()
    return
  }
}

// Execute the command
const executeCommand = async () => {
  if (!command.value.trim() || !selectedModel.value || isLoading.value) return
  
  isLoading.value = true
  
  try {
    // Save the selected model as last used
    await saveLastUsedModel(selectedModel.value)
    
    // Close popup immediately when starting execution
    props.onClose()
    
    // Find the selected model info
    const selectedModelInfo = availableModels.value.find(m => m.key === selectedModel.value)
    if (!selectedModelInfo) {
      throw new Error('Selected model not found')
    }
    
    // Execute the command with provider and model
    await props.onExecute(command.value.trim(), selectedModelInfo.provider, selectedModelInfo.model)
  } catch (error) {
    // Error handling is done in the parent component via toast
    console.error('Command execution failed:', error)
  } finally {
    isLoading.value = false
  }
}

// Save last used model to storage
const saveLastUsedModel = async (modelKey: string) => {
  try {
    const storageData = await sdk.storage.get() as any
    const updatedStorage = {
      ...storageData,
      quickActionSettings: {
        ...storageData?.quickActionSettings,
        lastUsedModel: modelKey
      }
    }
    await sdk.storage.set(updatedStorage)
  } catch (error) {
    console.error('Error saving last used model:', error)
  }
}

onMounted(async () => {
  // Load models first
  await loadAvailableModels()
  
  // Focus the input when popup opens
  nextTick(() => {
    commandInput.value?.$el?.focus()
  })
  
  // Add global keyboard listener
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Context summary for display
const contextSummary = computed(() => {
  if (!props.initialContext) return 'No request found'
  
  const lines = props.initialContext.split('\n')
  const firstLine = lines[0] || ''
  
  // Extract method and path
  const parts = firstLine.split(' ')
  if (parts.length >= 2) {
    const method = parts[0]
    const path = parts[1]
    
    // Truncate path if too long
    const maxPathLength = 20
    const truncatedPath = path.length > maxPathLength ? 
      path.substring(0, maxPathLength) + '...' : path
    
    return `${method} ${truncatedPath}`
  }
  
  return firstLine.length > 30 ? firstLine.substring(0, 30) + '...' : firstLine
})
</script>

<style scoped>
.quick-action-dialog {
  width: 1500px !important;
  max-width: 98vw !important;
}

.quick-action-content {
  width: 100%;
  min-height: 420px;
}

/* Dark theme dialog styling with red accents */
:deep(.p-dialog) {
  background: #1f2937 !important;
  border: 1px solid #374151 !important;
  border-radius: 8px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
}

:deep(.p-dialog-content) {
  padding: 2rem !important;
  background: #1f2937 !important;
  color: #f9fafb !important;
}

:deep(.p-dialog-header) {
  padding: 1.25rem 2rem !important;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
  color: #f9fafb !important;
  border-bottom: 1px solid #374151 !important;
  border-radius: 8px 8px 0 0 !important;
}

/* Even smaller model dropdown styling */
:deep(.model-dropdown-compact .p-dropdown) {
  background: #374151 !important;
  border: 1px solid #4b5563 !important;
  color: #f9fafb !important;
  border-radius: 5px !important;
  padding: 0.3rem 0.5rem !important;
  font-size: 0.75rem !important;
  min-height: auto !important;
}

:deep(.model-dropdown-compact .p-dropdown:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
}

:deep(.model-dropdown-compact .p-dropdown-label) {
  color: #f9fafb !important;
  font-size: 0.75rem !important;
  padding: 0 !important;
}

:deep(.model-dropdown-compact .p-dropdown-trigger) {
  color: #9ca3af !important;
  width: 1.125rem !important;
}

/* Large command input styling */
:deep(.command-input-large .p-textarea) {
  background: #374151 !important;
  border: 1px solid #4b5563 !important;
  color: #f9fafb !important;
  border-radius: 5px !important;
  padding: 1rem !important;
  font-size: 0.85rem !important;
  line-height: 1.5 !important;
  font-family: 'Segoe UI', system-ui, sans-serif !important;
  min-height: 260px !important;
  resize: vertical !important;
}

:deep(.command-input-large .p-textarea:focus) {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.1) !important;
}

:deep(.command-input-large .p-textarea::placeholder) {
  color: #9ca3af !important;
  line-height: 1.5 !important;
  font-style: italic !important;
  font-size: 0.8rem !important;
}

/* Small button styling with red theme */
:deep(.execute-btn-small .p-button) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  border: none !important;
  color: white !important;
  padding: 0.5rem 1.25rem !important;
  border-radius: 5px !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
}

:deep(.execute-btn-small .p-button:hover) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
  transform: translateY(-1px) !important;
}

:deep(.cancel-btn-small .p-button) {
  background: transparent !important;
  border: 1px solid #4b5563 !important;
  color: #9ca3af !important;
  padding: 0.5rem 1.25rem !important;
  border-radius: 5px !important;
  font-size: 0.85rem !important;
}

:deep(.cancel-btn-small .p-button:hover) {
  background: #374151 !important;
  border-color: #6b7280 !important;
  color: #f9fafb !important;
}

/* Dropdown panel styling with smaller text */
:deep(.p-dropdown-panel) {
  background: #374151 !important;
  border: 1px solid #4b5563 !important;
  border-radius: 5px !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
}

:deep(.p-dropdown-item) {
  color: #f9fafb !important;
  padding: 0.3rem 0.5rem !important;
  font-size: 0.75rem !important;
}

:deep(.p-dropdown-item:hover) {
  background: #4b5563 !important;
}

:deep(.p-dropdown-item.p-focus) {
  background: #ef4444 !important;
}

/* Keyboard shortcuts styling with red theme */
kbd {
  font-family: monospace !important;
  font-size: 0.65rem !important;
}
</style> 