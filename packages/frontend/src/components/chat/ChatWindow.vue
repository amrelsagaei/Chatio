<template>
  <div class="chatio-chat">
    <!-- Chat Main Container -->
    <div class="chatio-chat-main">
      <!-- Chat History Sidebar -->
      <div v-if="showHistory" class="chatio-history-sidebar">
        <div class="chatio-history-header">
          <div class="flex items-center justify-between w-full">
            <h3>Chat History</h3>
            <button class="chatio-btn" @click="exportAllChats" style="font-size: 12px; padding: 6px 12px;">
              <i class="fas fa-download"></i>
              Export All
            </button>
          </div>
        </div>
        <div class="chatio-history-list chatio-scroll">
          <div 
            v-for="chat in chatHistory" 
            :key="chat.id"
            :class="[
              'chatio-history-item',
              { 'active': currentChatId === chat.id }
            ]"
            @click="loadChat(chat.id)"
          >
            <div v-if="editingChatId === chat.id" class="flex items-center gap-2 w-full">
              <input
                ref="editInput"
                v-model="editingTitle"
                @blur="saveTitle(chat.id)"
                @keydown.enter="saveTitle(chat.id)"
                @keydown.escape="cancelEdit"
                class="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                @click.stop
                placeholder="Enter chat title..."
                :key="'edit-' + chat.id"
              />
              <button 
                class="chatio-history-action chatio-history-save" 
                @click.stop="saveTitle(chat.id)"
                title="Save"
              >
                <i class="fas fa-save"></i>
              </button>
              <button 
                class="chatio-history-action" 
                @click.stop="cancelEdit"
                title="Cancel"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div v-else>
              <div class="font-medium text-sm truncate pr-8">
                {{ chat.title }}
              </div>
              <div class="text-xs opacity-75 mt-1">
                {{ formatDate(chat.timestamp) }} • {{ chat.messageCount }} messages
              </div>
              <div class="chatio-history-item-actions">
                <button 
                  class="chatio-history-action" 
                  @click.stop="startEdit(chat.id, chat.title)"
                  title="Rename"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  class="chatio-history-action" 
                  @click.stop="deleteChat(chat.id)"
                  title="Delete"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          
          <div v-if="chatHistory.length === 0" class="p-4 text-center text-surface-500 dark:text-surface-400 text-sm">
            No chat history yet
          </div>
        </div>
      </div>

      <!-- Main Chat Content Area -->
      <div class="chatio-chat-content">
        <!-- Chat Header -->
        <div class="chatio-chat-header">
          <div class="chatio-chat-title">{{ getCurrentChatTitle() }}</div>
          <div class="chatio-chat-actions">
            <!-- Auto-save status indicator -->
            <div class="chatio-autosave-status" :class="{ 'warning': !isAutoSaveEnabled() }" :title="isAutoSaveEnabled() ? 'Auto-save: Enabled' : 'Auto-save: Disabled - Chat history will not be automatically saved'">
              <i v-if="isAutoSaveEnabled()" class="fas fa-save" style="color: #10b981;"></i>
              <i v-else class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
              <span class="text-xs ml-1">{{ isAutoSaveEnabled() ? 'Auto-save is enabled' : 'Auto-save disabled' }}</span>
            </div>
            
            <button class="chatio-chat-btn" @click="toggleHistory" :title="showHistory ? 'Hide History' : 'Show History'">
              <i :class="showHistory ? 'fas fa-times' : 'fas fa-history'"></i>
              {{ showHistory ? 'Hide History' : 'Show History' }}
            </button>
            <button class="chatio-chat-btn primary" @click="newChat" title="New Chat">
              <i class="fas fa-plus"></i>
              New Chat
            </button>
            <button class="chatio-chat-btn" @click="exportCurrentChat" title="Export Current Chat">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="chatio-messages chatio-scroll" ref="messagesContainer" :class="{ 'resized': isInputResized }">
          <!-- Welcome State -->
          <div v-if="currentMessages.length === 0" class="flex items-center justify-center h-full">
            <div class="text-center max-w-md">
              <div class="chatio-welcome-icon">
                <i class="fas fa-robot"></i>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2" style="color: var(--chatio-text-primary);">
                Welcome to Chatio
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6" style="color: var(--chatio-text-secondary);">
                Your AI-powered security testing companion. Ask questions about vulnerabilities, code analysis, or penetration testing.
              </p>
              <div class="space-y-2">
                <button 
                  v-for="prompt in quickPrompts" 
                  :key="prompt"
                  class="block w-full chatio-welcome-card text-left text-sm"
                  @click="selectPrompt(prompt)"
                >
                  {{ prompt }}
                </button>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div v-else class="space-y-6">
            <div
              v-for="(message, index) in currentMessages"
              :key="message.id"
              :class="[
                'chatio-message',
                message.role === 'user' ? 'user' : ''
              ]"
            >
              <div class="chatio-avatar">
                <i v-if="message.role === 'user'" class="fas fa-user"></i>
                <i v-else-if="message.provider === 'openai'" class="chatio-openai-icon"></i>
                <i v-else :class="getProviderIcon(message.provider || 'assistant')"></i>
              </div>
              <div class="chatio-message-content">
                <!-- Bot Name/Provider Header for Assistant Messages -->
                <div v-if="message.role === 'assistant'" class="chatio-bot-header">
                  <div class="chatio-bot-name">
                    {{ getBotDisplayName(message.provider, message.model) }}
                  </div>
                  <div v-if="message.status" class="chatio-bot-status">
                    {{ message.status }}
                  </div>
                </div>
                
                <div class="chatio-message-bubble">
                  <div v-if="editingMessageId === message.id && message.role === 'user'" class="message-edit-mode">
                    <!-- Edit mode file preview with improved small thumbnails -->
                    <div v-if="editingFiles && editingFiles.length > 0" class="chatio-edit-file-preview">
                      <div v-for="(file, fileIndex) in editingFiles" :key="fileIndex" class="chatio-edit-file-item">
                        <div class="chatio-edit-file-content">
                          <img v-if="file.type.startsWith('image/')" :src="file.content" class="chatio-edit-image-thumbnail" />
                          <div v-else class="chatio-edit-file-icon">
                            <i class="fas fa-file"></i>
                          </div>
                          <span class="chatio-edit-file-name">{{ file.name }}</span>
                        </div>
                        <button @click="removeEditingFile(fileIndex)" class="chatio-edit-file-remove" title="Remove file">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                    
                    <textarea
                      v-model="editingMessageContent"
                      @keydown.ctrl.enter="saveMessageEdit(message.id, index)"
                      @keydown.escape="cancelMessageEdit"
                      class="w-full p-4 border-2 rounded-lg resize-none chatio-edit-textarea"
                      style="min-height: 120px; border-color: var(--chatio-primary); background-color: var(--surface-0); color: var(--text-color); font-family: inherit; font-size: 14px; line-height: 1.5; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
                      placeholder="Edit your message... (Ctrl+Enter to save, Esc to cancel)"
                    ></textarea>
                    <div class="chatio-edit-actions">
                      <button 
                        @click="saveMessageEdit(message.id, index)"
                        style="background: var(--chatio-primary); color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer; margin-right: 8px;"
                        title="Save changes and resend message"
                      >
                        <i class="fas fa-save"></i>
                        Save & Resend
                      </button>
                      <button 
                        @click="cancelMessageEdit"
                        style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; cursor: pointer;"
                        title="Cancel editing and discard changes"
                      >
                        <i class="fas fa-times"></i>
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div v-else>
                    <!-- File/Image Display - 3 IMAGES PER ROW, FILES AS FILES -->
                    <div v-if="message.files && message.files.length > 0" class="mb-4">
                      <!-- Image Gallery - 6 per row, with overlay on 6th if more exist -->
                      <div 
                        v-if="getImageFiles(message.files).length > 0"
                        :class="[
                          'chatio-image-gallery',
                          getImageGalleryClass(Math.min(getImageFiles(message.files).length, 6))
                        ]"
                      >
                        <!-- Show exactly 6 images, with blurred overlay on 6th if more than 6 total -->
                        <div 
                          v-for="(imageFile, index) in getFirstSixImages(message.files)" 
                          :key="imageFile.name" 
                          class="chatio-image-item"
                          @click="openImageGallery(message.files, index)"
                        >
                          <img :src="imageFile.content" :alt="imageFile.name" class="chatio-gallery-image" />
                          
                          <!-- Blurred overlay on 6th image if more than 6 total -->
                          <div 
                            v-if="index === 5 && getImageFiles(message.files).length > 6" 
                            class="chatio-image-more-overlay"
                            @click.stop="openImageGallery(message.files, 0)"
                          >
                            <!-- Background blurred version of the same image -->
                            <img 
                              :src="imageFile.content" 
                              class="chatio-overlay-background-image"
                              :alt="imageFile.name"
                            />
                            <!-- Overlay content -->
                            <div class="chatio-overlay-content">
                              <div class="chatio-overlay-count">+{{ getImageFiles(message.files).length - 6 }}</div>
                              <div class="chatio-overlay-text">more images</div>
                            </div>
                          </div>
                          
                          <div class="chatio-image-name">{{ imageFile.name }}</div>
                        </div>
                      </div>

                      <!-- Non-image Files as ACTUAL FILE ITEMS (not code blocks) -->
                      <div v-for="file in getNonImageFiles(message.files)" :key="file.name" class="chatio-file-item">
                        <div class="chatio-file-icon">
                          <i :class="getFileIcon(file.name)"></i>
                        </div>
                        <div class="chatio-file-info">
                          <div class="chatio-file-name">{{ file.name }}</div>
                          <div class="chatio-file-size">{{ formatFileSize(file.content.length) }}</div>
                          <div class="text-xs opacity-60">{{ file.type }}</div>
                        </div>
                        <button @click="downloadFile(file)" class="chatio-file-download">
                          Download
                        </button>
                        <!-- Preview functionality removed for now -->
                      </div>
                    </div>
                    
                    <!-- Message Content with MINIMAL Code Block Detection -->
                    <div v-html="formatMessageSafely(message.content, message.role === 'user')"></div>
                  </div>
                </div>
                <div class="chatio-message-time">
                  {{ formatTime(message.timestamp) }}
                  <button 
                    class="ml-2 text-xs hover:text-primary-600 dark:hover:text-primary-400"
                    @click="copyMessage(message.content)"
                    title="Copy"
                  >
                    <i class="fas fa-copy"></i>
                  </button>
                  <button 
                    v-if="message.role === 'user'"
                    class="ml-2 text-xs hover:text-primary-600 dark:hover:text-primary-400"
                    @click="startMessageEdit(message.id, message.content)"
                    title="Edit"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Typing Indicator -->
            <div v-if="isTyping && currentChatId === loadingChatId" class="chatio-message">
              <div class="chatio-avatar">
                <i v-if="selectedProvider === 'openai'" class="chatio-openai-icon"></i>
                <i v-else :class="getProviderIcon(selectedProvider || 'assistant')"></i>
              </div>
              <div class="chatio-message-content">
                <!-- Bot Name/Provider Header for Typing -->
                <div class="chatio-bot-header">
                  <div class="chatio-bot-name">
                    {{ getBotDisplayName(selectedProvider, selectedModel) }}
                  </div>
                  <div class="chatio-bot-status">
                    {{ currentStatus }}
                  </div>
                </div>
                
                <div class="chatio-message-bubble">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-surface-400 dark:bg-surface-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Simple Input Area - FIXED RESIZE -->
        <div class="chatio-input-area" ref="inputArea">
          <!-- Drag and drop overlay -->
          <div v-if="isDragOver" class="chatio-drop-overlay">
            <div class="text-center">
              <i class="fas fa-cloud-upload-alt text-2xl mb-2"></i>
              <p>Drop files here to attach</p>
            </div>
          </div>

          <!-- Simple Input Container -->
          <div class="chatio-input-main">
            <!-- File Preview Area -->
            <div v-if="attachedFiles.length > 0" class="chatio-file-preview">
              <div v-for="(file, index) in attachedFiles" :key="index" class="chatio-file-item">
                <img v-if="file.type.startsWith('image/')" :src="file.preview" class="chatio-image-preview" />
                <div v-else class="flex items-center gap-2">
                  <i class="fas fa-file"></i>
                  <span class="text-sm">{{ file.name }}</span>
                </div>
                <button @click="removeFile(index)" class="chatio-file-remove" title="Remove">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Textarea that takes remaining space -->
            <textarea
              ref="messageInput"
              v-model="currentMessage"
              placeholder="Ask about security testing, vulnerability analysis, or code review..."
              class="chatio-input"
              @keydown="handleKeyDown"
              @paste="handlePaste"
              @drop="handleDrop"
              @dragover="handleDragOver"
              @dragleave="handleDragLeave"
              :disabled="isLoading"
            ></textarea>

            <!-- Bottom toolbar: Left buttons - Right send -->
            <div class="chatio-input-toolbar">
              <div class="chatio-toolbar-left">
                <button 
                  class="chatio-input-tool-btn" 
                  @click="triggerFileInput"
                  title="Attach Files"
                >
                  <i class="fas fa-paperclip"></i>
                  Files
                </button>
                <button 
                  class="chatio-input-tool-btn" 
                  @click="insertCodeBlock"
                  title="Insert Code Block"
                >
                  <i class="fas fa-code"></i>
                  Code
                </button>
                <button 
                  class="chatio-input-tool-btn" 
                  @click="insertHttpRequest"
                  title="Insert HTTP Request"
                >
                  <i class="fas fa-globe"></i>
                  HTTP
                </button>
                <button 
                  class="chatio-input-tool-btn" 
                  @click="pasteFromClipboard"
                  title="Paste Screenshot (Ctrl+V)"
                >
                  <i class="fas fa-paste"></i>
                  Paste
                </button>
              </div>
              
              <div class="chatio-toolbar-right">
                <!-- Module Selector - DYNAMIC LOGO VERSION -->
                <div class="chatio-module-selector" @click="openModuleModal">
                  <i :class="getSelectedProviderIcon()"></i>
                  <span>{{ selectedModule || 'Select Model' }}</span>
                  <i class="fas fa-chevron-down"></i>
                </div>
                
                <!-- Send button -->
                <button
                  class="chatio-send-btn"
                  @click="sendMessage"
                  :disabled="!canSendMessage || isLoading"
                  title="Send Message"
                >
                  <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-paper-plane"></i>
                  Send
                </button>
              </div>
            </div>

            <input 
              ref="fileInput"
              type="file" 
              @change="handleFileUpload"
              accept="image/*,.txt,.json,.xml,.html,.js,.py,.php,.java,.cpp,.c,.sql,.md,.csv"
              style="display: none;"
              multiple
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Image Modal with Fixed Layout -->
    <div v-if="imageModal.show" class="chatio-image-modal-overlay" @click="closeImageModal">
      <div class="chatio-image-modal-container" @click.stop>
        <!-- Left Control Area (20%) -->
        <div class="chatio-image-modal-left-controls">
          <button 
            v-if="imageModal.currentIndex > 0"
            @click="prevImage" 
            class="chatio-image-modal-nav chatio-image-modal-prev"
            title="Previous image"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
        </div>
        
        <!-- Center Image Area (60%) -->
        <div class="chatio-image-modal-center">
          <div class="chatio-image-modal-image-container">
            <img 
              v-if="getCurrentImage()"
              :src="getCurrentImage()?.content" 
              :alt="getCurrentImage()?.name" 
              class="chatio-image-modal-image" 
            />
            <!-- Image Info Overlay -->
            <div class="chatio-image-modal-info">
              <span class="chatio-image-modal-counter">
                {{ imageModal.currentIndex + 1 }} / {{ imageModal.images.length }}
              </span>
              <span class="chatio-image-modal-filename">
                {{ getCurrentImage()?.name }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Right Control Area (20%) -->
        <div class="chatio-image-modal-right-controls">
          <button 
            v-if="imageModal.currentIndex < imageModal.images.length - 1"
            @click="nextImage" 
            class="chatio-image-modal-nav chatio-image-modal-next"
            title="Next image"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <!-- Close Button in Top Right -->
          <button 
            @click="closeImageModal" 
            class="chatio-image-modal-close"
            title="Close"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Module Selection Modal -->
    <div v-if="showModuleModal" class="chatio-module-modal-overlay" @click="closeModuleModal">
      <div class="chatio-module-modal" @click.stop>
        <div class="chatio-module-modal-header">
          <h3 class="chatio-module-modal-title">
            <i class="fas fa-brain"></i>
            Select AI Model
          </h3>
          <button class="chatio-module-modal-close" @click="closeModuleModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="chatio-module-modal-body">
          <!-- OpenAI Section -->
          <div class="chatio-provider-section">
            <div class="chatio-provider-section-header">
              <div class="chatio-provider-icon">
                <i class="chatio-openai-icon"></i>
              </div>
              <div class="chatio-provider-name">OpenAI</div>
            </div>
            <div v-if="getProviderModels('openai').length > 0" class="chatio-provider-models">
              <div 
                v-for="model in getProviderModels('openai')" 
                :key="`openai-${model.model}`"
                class="chatio-model-option"
                :class="{ selected: selectedModule === model.displayName }"
                @click="selectModule({ ...model, provider: 'openai' })"
              >
                <div class="chatio-model-name">{{ model.displayName }}</div>
                <div class="chatio-model-badge">GPT</div>
              </div>
            </div>
            <div v-else class="chatio-provider-empty">
              <div class="chatio-provider-empty-text">No OpenAI API key configured</div>
              <button class="chatio-provider-empty-action" @click="goToSettings">
                <i class="fas fa-cog"></i>
                Configure API Key
              </button>
            </div>
          </div>

          <!-- Anthropic Section -->
          <div class="chatio-provider-section">
            <div class="chatio-provider-section-header">
              <div class="chatio-provider-icon">
                <i class="chatio-anthropic-icon"></i>
              </div>
              <div class="chatio-provider-name">Anthropic</div>
            </div>
            <div v-if="getProviderModels('anthropic').length > 0" class="chatio-provider-models">
              <div 
                v-for="model in getProviderModels('anthropic')" 
                :key="`anthropic-${model.model}`"
                class="chatio-model-option"
                :class="{ selected: selectedModule === model.displayName }"
                @click="selectModule({ ...model, provider: 'anthropic' })"
              >
                <div class="chatio-model-name">{{ model.displayName }}</div>
                <div class="chatio-model-badge">Claude</div>
              </div>
            </div>
            <div v-else class="chatio-provider-empty">
              <div class="chatio-provider-empty-text">No Anthropic API key configured</div>
              <button class="chatio-provider-empty-action" @click="goToSettings">
                <i class="fas fa-cog"></i>
                Configure API Key
              </button>
            </div>
          </div>

          <!-- Google Section -->
          <div class="chatio-provider-section">
            <div class="chatio-provider-section-header">
              <div class="chatio-provider-icon">
                <i class="chatio-google-icon"></i>
              </div>
              <div class="chatio-provider-name">Google</div>
            </div>
            <div v-if="getProviderModels('google').length > 0" class="chatio-provider-models">
              <div 
                v-for="model in getProviderModels('google')" 
                :key="`google-${model.model}`"
                class="chatio-model-option"
                :class="{ selected: selectedModule === model.displayName }"
                @click="selectModule({ ...model, provider: 'google' })"
              >
                <div class="chatio-model-name">{{ model.displayName }}</div>
                <div class="chatio-model-badge">Gemini</div>
              </div>
            </div>
            <div v-else class="chatio-provider-empty">
              <div class="chatio-provider-empty-text">No Google API key configured</div>
              <button class="chatio-provider-empty-action" @click="goToSettings">
                <i class="fas fa-cog"></i>
                Configure API Key
              </button>
            </div>
          </div>

          <!-- DeepSeek Section -->
          <div class="chatio-provider-section">
            <div class="chatio-provider-section-header">
              <div class="chatio-provider-icon">
                <i class="chatio-deepseek-icon"></i>
              </div>
              <div class="chatio-provider-name">DeepSeek</div>
            </div>
            <div v-if="getProviderModels('deepseek').length > 0" class="chatio-provider-models">
              <div 
                v-for="model in getProviderModels('deepseek')" 
                :key="`deepseek-${model.model}`"
                class="chatio-model-option"
                :class="{ selected: selectedModule === model.displayName }"
                @click="selectModule({ ...model, provider: 'deepseek' })"
              >
                <div class="chatio-model-name">{{ model.displayName }}</div>
                <div class="chatio-model-badge">Chat</div>
              </div>
            </div>
            <div v-else class="chatio-provider-empty">
              <div class="chatio-provider-empty-text">No DeepSeek API key configured</div>
              <button class="chatio-provider-empty-action" @click="goToSettings">
                <i class="fas fa-cog"></i>
                Configure API Key
              </button>
            </div>
          </div>

          <!-- Local LLM (ollama) Section -->
          <div class="chatio-provider-section">
            <div class="chatio-provider-section-header">
              <div class="chatio-provider-icon">
                <i class="fas fa-server"></i>
              </div>
              <div class="chatio-provider-name">Local LLM (ollama)</div>
            </div>
            <div v-if="getProviderModels('local').length > 0" class="chatio-provider-models">
              <div 
                v-for="model in getProviderModels('local')" 
                :key="`local-${model.model}`"
                class="chatio-model-option"
                :class="{ selected: selectedModule === model.displayName }"
                @click="selectModule({ ...model, provider: 'local' })"
              >
                <div class="chatio-model-name">{{ model.displayName }}</div>
                <div class="chatio-model-badge">ollama</div>
              </div>
            </div>
            <div v-else class="chatio-provider-empty">
              <div class="chatio-provider-empty-text">No ollama models configured</div>
              <button class="chatio-provider-empty-action" @click="goToSettings">
                <i class="fas fa-cog"></i>
                Configure Ollama
              </button>
            </div>
          </div>
        </div>
      </div>
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
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, onMounted, watch, onUnmounted, computed } from 'vue';
import { useSDK } from '@/plugins/sdk';
import { ApiService } from '@/services/api';
import type { ChatMessage, ChatSettings, SendMessageRequest } from '@/services/api';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
// Markdown rendering libraries
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// SDK and API service
const sdk = useSDK();
const apiService = new ApiService(sdk);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: { name: string; content: string; type: string }[];
  provider?: string;
  model?: string;
  status?: string;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
  messageCount: number;
}

interface AttachedFile {
  name: string;
  type: string;
  content: string;
  preview?: string;
}

// Component state
const currentMessages = reactive<Message[]>([]);
const currentMessage = ref('');
const isLoading = ref(false);
const isTyping = ref(false);
const currentStatus = ref('Ready'); // Add status tracking
const loadingChatId = ref<string | null>(null); // Track which chat is loading
const messagesContainer = ref<HTMLElement>();
const messageInput = ref<HTMLTextAreaElement>();
const editInput = ref<HTMLInputElement>();
const showHistory = ref(true);
const currentChatId = ref<string>('default');

// File handling state
const attachedFiles = reactive<AttachedFile[]>([]);
const fileInput = ref<HTMLInputElement>();
const isDragOver = ref(false);

// Image modal state
const imageModal = reactive({
  show: false,
  images: [] as { name: string; content: string; type: string }[],
  currentIndex: 0
});

// Resize state
const isInputResized = ref(false);
const inputArea = ref<HTMLElement>();

// Chat history management
const chatHistory = reactive<ChatSession[]>([]);

// Edit state
const editingChatId = ref<string | null>(null);
const editingTitle = ref('');

// Message editing state
const editingMessageId = ref<string | null>(null);
const editingMessageContent = ref('');
const editingFiles = ref<AttachedFile[]>([]);

// Confirm Modal state
const confirmModal = reactive({
  show: false,
  title: '',
  message: '',
  details: [] as string[],
  type: 'confirm' as 'confirm' | 'alert' | 'warning' | 'error',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: true,
  onConfirm: () => {}
});

// Close Confirm Modal
const closeConfirmModal = () => {
  confirmModal.show = false;
};

// Module selector state - MODAL VERSION
const showModuleModal = ref(false);
const selectedModule = ref<string>('');
const selectedProvider = ref<string>('');
const selectedModel = ref<string>('');

// Module/Provider types
interface Module {
  provider: string;
  model: string;
  displayName: string;
  icon: string;
}

// Available modules based on configured providers
const availableModels = {
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
  ],
  local: [] // Will be populated dynamically from settings
};

const providerIcons = {
  openai: 'fab fa-openai',
  anthropic: 'fas fa-robot',
  google: 'fab fa-google',
  deepseek: 'chatio-deepseek-icon',
  local: 'fas fa-server'
};

// Computed properties
const canSendMessage = computed(() => {
  return (currentMessage.value.trim() || attachedFiles.length > 0) && !isLoading.value;
});

// Quick start prompts
const quickPrompts = [
  "Analyze this SQL injection vulnerability",
  "Review this code for security issues", 
  "What are common XSS attack vectors?",
  "Help me understand CSRF protection"
];

// Caido SDK for toasts
const showToast = (message: string, variant: 'success' | 'error' = 'success') => {
  try {
    // Try multiple ways to access the toast functionality
    
    // Method 1: Using the injected SDK
    const sdkToast = sdk?.window?.showToast;
    if (sdkToast && typeof sdkToast === 'function') {
      sdkToast(message, {
        variant,
        duration: 3000
      });
      return;
    }
    
    // Method 2: Using window.caidoSDK
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast(message, {
        variant,
        duration: 3000
      });
      return;
    }
    
    // Method 3: Try alternative paths
    if ((window as any).caido?.notifications) {
      const notify = (window as any).caido.notifications[variant];
      if (notify && typeof notify === 'function') {
        notify(message);
        return;
      }
    }
    
    // Fallback: Log to console with clear formatting
    console.log(`%c[TOAST ${variant.toUpperCase()}] ${message}`, 
      `color: ${variant === 'success' ? 'green' : 'red'}; font-weight: bold;`);
    
    // XSS vulnerability removed - no alert fallback
    
  } catch (error) {
    console.error('Toast error:', error);
    console.log(`FALLBACK TOAST [${variant.toUpperCase()}]: ${message}`);
  }
};

// Persist state in localStorage with better handling
const saveAppState = () => {
  try {
    const state = {
      showHistory: showHistory.value,
      currentChatId: currentChatId.value,
      currentMessages: [...currentMessages],
      currentMessage: currentMessage.value,
      lastUpdated: Date.now()
    };
    localStorage.setItem('chatio-app-state', JSON.stringify(state));
    console.log('App state saved:', { chatId: currentChatId.value, messageCount: currentMessages.length });
  } catch (error) {
    console.error('Failed to save app state:', error);
  }
};

const loadAppState = () => {
  try {
    const saved = localStorage.getItem('chatio-app-state');
    if (saved) {
      const state = JSON.parse(saved);
      
      // Only load if it's recent (within last hour)
      const isRecent = state.lastUpdated && (Date.now() - state.lastUpdated < 3600000);
      
      if (isRecent) {
        showHistory.value = state.showHistory || true;
        currentChatId.value = state.currentChatId || 'default';
        currentMessage.value = state.currentMessage || '';
        
        if (state.currentMessages && state.currentMessages.length > 0) {
          // Ensure proper date parsing for messages
          const parsedMessages = state.currentMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          currentMessages.splice(0, currentMessages.length, ...parsedMessages);
        }
        
        console.log('App state loaded:', { chatId: currentChatId.value, messageCount: currentMessages.length });
      } else {
        console.log('App state too old, starting fresh');
      }
    }
  } catch (error) {
    console.error('Failed to load app state:', error);
  }
};

// Force save state when leaving component
const forceStateSync = () => {
  // Always save app state (UI state like current message, etc.)
  saveAppState();
  
  // Only save chat session if auto-save is enabled or if there are unsaved changes
  if (currentMessages.length > 0) {
    try {
      const savedSettings = localStorage.getItem('chatio-settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        const autoSaveEnabled = settings.chatSettings?.autoSave ?? true;
        
        if (autoSaveEnabled) {
          saveChatSession();
          console.log('Force sync: Chat session saved (auto-save enabled)');
        } else {
          console.log('Force sync: Chat session NOT saved (auto-save disabled)');
        }
      } else {
        // No settings found, default to saving for safety
        saveChatSession();
        console.log('Force sync: Chat session saved (no settings found, defaulting to save)');
      }
    } catch (error) {
      console.error('Error during force sync:', error);
      // Fail-safe: save anyway if we can't read settings
      saveChatSession();
    }
  }
};

// Methods
const sendMessage = async () => {
  const trimmedMessage = currentMessage.value.trim();
  if (!trimmedMessage && attachedFiles.length === 0) return;

  // Check if a provider is selected first
  if (!selectedProvider.value || !selectedModel.value) {
    showToast('Please select an AI model first', 'error');
    showModuleModal.value = true;
    return;
  }

  // Check if images are being sent to a local model that doesn't support vision
  const hasImages = attachedFiles.some(file => file.type.startsWith('image/'));
  if (hasImages && selectedProvider.value === 'local') {
    const modelName = selectedModel.value.toLowerCase();
    const isVisionModel = modelName.includes('llava') || 
                         modelName.includes('vision') || 
                         modelName.includes('bakllava') ||
                         modelName.includes('minicpm') ||
                         modelName.includes('moondream');
    
    if (!isVisionModel) {
      showToast(`Model "${selectedModel.value}" does not support images. Please select a vision model like "llava" or "llama3.2-vision" for image analysis.`, 'error');
      return;
    }
  }

  // CRITICAL FIX: Capture the target chat ID before processing
  const targetChatId = currentChatId.value;
  const targetMessages = currentMessages; // Reference to current messages array

  // If no text content but files are attached, provide a default message
  let messageContent = trimmedMessage;
  if (!messageContent && attachedFiles.length > 0) {
    const imageCount = attachedFiles.filter(f => f.type.startsWith('image/')).length;
    const fileCount = attachedFiles.length - imageCount;
    
    if (imageCount > 0 && fileCount > 0) {
      messageContent = `Please analyze these ${imageCount} image(s) and ${fileCount} file(s).`;
    } else if (imageCount > 0) {
      messageContent = `Please analyze ${imageCount === 1 ? 'this image' : `these ${imageCount} images`}.`;
    } else {
      messageContent = `Please analyze ${fileCount === 1 ? 'this file' : `these ${fileCount} files`}.`;
    }
  }

  // Create user message
  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: messageContent,
    timestamp: new Date(),
    files: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    // Removed provider and model - user messages shouldn't have these
  };

  targetMessages.push(userMessage);
  currentMessage.value = '';
  attachedFiles.splice(0);

  // Save to current chat session
  await saveChatSession();
  saveAppState();

  // CRITICAL FIX: Also update the target chat in history immediately
  // This ensures the user message is preserved even if user switches chats
  const targetChatIndex = chatHistory.findIndex(c => c.id === targetChatId);
  if (targetChatIndex >= 0) {
    const targetChat = chatHistory[targetChatIndex];
    if (targetChat) {
      targetChat.messages = [...targetMessages];
      targetChat.messageCount = targetMessages.length;
      localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
    }
  }

  isLoading.value = true;
  isTyping.value = true;
  loadingChatId.value = targetChatId; // Set which chat is loading
  currentStatus.value = 'Connecting...'; // Add status updates

  try {
    // Get current settings from localStorage
    const savedSettings = localStorage.getItem('chatio-settings');
    if (!savedSettings) {
      throw new Error('No AI provider configured. Please go to Settings and configure at least one provider.');
    }

    const settings = JSON.parse(savedSettings);
    
    // Use the selected module
    let activeProvider: any = null;
    let providerName = '';
    let modelName = '';
    
    // Use the explicitly selected provider/model
    const selectedProviderConfig = settings.providers?.[selectedProvider.value];
    if (selectedProviderConfig?.apiKey?.trim()) {
      activeProvider = selectedProviderConfig;
      providerName = selectedProvider.value;
      modelName = selectedModel.value;
      currentStatus.value = `Connecting to ${selectedModule.value}...`;
    } else {
      throw new Error(`Selected provider ${selectedProvider.value} is not configured with a valid API key. Please go to Settings and add your API key.`);
    }

    // Validate the model name is set
    if (!modelName || modelName === 'default') {
      // Set a default model based on provider
      switch (providerName) {
        case 'openai':
          modelName = 'gpt-4o-mini';
          break;
        case 'anthropic':
          modelName = 'claude-3-5-sonnet-20241022';
          break;
        case 'google':
          modelName = 'gemini-1.5-flash';
          break;
        case 'deepseek':
          modelName = 'deepseek-chat';
          break;
        case 'local':
          modelName = 'local-model';
          break;
        default:
          modelName = 'default';
      }
    }

    // Prepare chat settings with proper model
    const chatSettings: ChatSettings = {
      provider: providerName,
      model: modelName,
      apiKey: activeProvider.apiKey,
      baseUrl: activeProvider.baseUrl || activeProvider.endpoint || activeProvider.url,
      systemPrompt: settings.chatSettings?.systemPrompt,
      maxMessages: settings.chatSettings?.maxMessages || 20 // Add context message limit
    };

    console.log('Sending message with settings:', {
      provider: chatSettings.provider,
      model: chatSettings.model,
      hasApiKey: !!chatSettings.apiKey,
      baseUrl: chatSettings.baseUrl,
      targetChatId: targetChatId
    });

    // Convert messages to backend format
    const backendMessages: ChatMessage[] = targetMessages.map(msg => {
      // Extract images from files for vision support
      const images: string[] = [];
      let messageContent = msg.content;
      
      if (msg.files) {
        msg.files.forEach(file => {
          if (file.type.startsWith('image/')) {
            // Ensure the image content is in the correct format
            let imageContent = file.content;
            
            // If it's already a data URL, use it as is
            if (imageContent.startsWith('data:')) {
              images.push(imageContent);
            } else {
              // If it's just base64, add the data URL prefix
              images.push(`data:${file.type};base64,${imageContent}`);
            }
          } else {
            // For non-image files, include their content in the message text
            let fileContent = file.content;
            
            // If it's a data URL, extract the content
            if (fileContent.startsWith('data:')) {
              const matches = fileContent.match(/^data:([^;]+);base64,(.+)$/);
              if (matches && matches[2]) {
                try {
                  fileContent = atob(matches[2]); // Decode base64
                } catch (error) {
                  console.error('Failed to decode base64 file content:', error);
                  fileContent = fileContent; // Keep original if decode fails
                }
              }
            }
            
            // Append file content to message
            messageContent += `\n\n--- File: ${file.name} (${file.type}) ---\n${fileContent}\n--- End of ${file.name} ---`;
          }
        });
      }
      
      // Debug logging for file processing
      if (msg.files && msg.files.length > 0) {
        console.log(`Processing message with ${msg.files.length} files:`, {
          messageId: msg.id,
          fileTypes: msg.files.map(f => f.type),
          imageCount: images.length,
          hasContent: !!msg.content,
          finalContentLength: messageContent.length
        });
      }
      
      return {
        id: msg.id,
        role: msg.role,
        content: messageContent,
        timestamp: msg.timestamp,
        files: msg.files?.map(f => ({
          name: f.name,
          type: f.type,
          content: f.content
        })),
        images: images.length > 0 ? images : undefined
      };
    });

    // Enhanced debug logging after backendMessages is created
    console.log('Backend messages prepared:', {
      messageCount: backendMessages.length,
      hasImages: backendMessages.some(m => m.images && m.images.length > 0),
      hasFiles: backendMessages.some(m => m.files && m.files.length > 0),
      lastMessagePreview: backendMessages.length > 0 ? {
        role: backendMessages[backendMessages.length - 1]?.role || 'unknown',
        contentLength: backendMessages[backendMessages.length - 1]?.content?.length || 0,
        hasImages: !!(backendMessages[backendMessages.length - 1]?.images?.length),
        hasFiles: !!(backendMessages[backendMessages.length - 1]?.files?.length),
        imageCount: backendMessages[backendMessages.length - 1]?.images?.length || 0,
        fileCount: backendMessages[backendMessages.length - 1]?.files?.length || 0
      } : null
    });

    // Send message to backend
    const request: SendMessageRequest = {
      messages: backendMessages,
      settings: chatSettings
    };

    currentStatus.value = `Processing with ${selectedModule.value}...`;
    const response = await apiService.sendMessage(request);
    
    isTyping.value = false;
    currentStatus.value = 'Completed';

    // Check if response contains an error and handle it properly
    if (response.content.startsWith('Error:')) {
      const errorMessage = response.content.replace('Error: ', '');
      // Show error toast instead of adding error to chat
      showToast(`Error: ${errorMessage}`, 'error');
      return; // Don't add error message to chat
    }

    // CRITICAL FIX: Only add response to the ORIGINAL chat, not current chat
    // Check if we're still in the same chat, if not, find the target chat
    if (currentChatId.value === targetChatId) {
      // Still in same chat, add to current messages
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: providerName,
        model: modelName,
        status: 'Completed'
      };
      
      currentMessages.push(aiResponse);
      await manualSaveChatSession(); // Use manual save for explicit user actions
      saveAppState();
      scrollToBottom();
    } else {
      // User switched to different chat, add response to target chat in history
      const targetChat = chatHistory.find(c => c.id === targetChatId);
      if (targetChat) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          provider: providerName,
          model: modelName,
          status: 'Completed'
        };
        
        targetChat.messages.push(aiResponse);
        targetChat.messageCount = targetChat.messages.length;
        
        // Update chat history in localStorage
        localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
        
        showToast(`Response added to "${targetChat.title}" (previous chat)`, 'success');
      } else {
        console.error('Target chat not found in history:', targetChatId);
        showToast('Error: Could not deliver response to original chat', 'error');
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
    isTyping.value = false;
    currentStatus.value = 'Error';
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
    
    // Show error toast instead of adding to chat
    showToast(`Error: ${errorMessage}`, 'error');
  } finally {
    isLoading.value = false;
    loadingChatId.value = null; // Clear loading chat ID
    currentStatus.value = 'Ready';
  }
};

const newChat = () => {
  const newChatId = `chat_${Date.now()}`;
  currentChatId.value = newChatId;
  currentMessages.splice(0);
  currentMessage.value = '';
  attachedFiles.splice(0);
  
  // Create new chat entry in history immediately
  const newChatSession: ChatSession = {
    id: newChatId,
    title: 'New Chat',
    timestamp: new Date(),
    messages: [],
    messageCount: 0
  };
  
  // Add to beginning of history
  chatHistory.unshift(newChatSession);
  localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
  
  saveAppState();
  scrollToBottom();
  
  showToast('New chat created', 'success');
};

const resetToNewChat = () => {
  // Reset current chat state without creating new history entry
  const newChatId = `chat_${Date.now()}`;
  currentChatId.value = newChatId;
  currentMessages.splice(0);
  currentMessage.value = '';
  attachedFiles.splice(0);
  
  // Clear any editing states
  editingMessageId.value = null;
  editingMessageContent.value = '';
  editingFiles.value = [];
  
  // Reset loading states
  isLoading.value = false;
  isTyping.value = false;
  loadingChatId.value = null;
  currentStatus.value = 'Ready';
  
  saveAppState();
  scrollToBottom();
};

const toggleHistory = () => {
  showHistory.value = !showHistory.value;
  saveAppState();
};

const loadChat = (chatId: string) => {
  const chat = chatHistory.find(c => c.id === chatId);
  if (chat) {
    currentChatId.value = chatId;
    currentMessages.splice(0, currentMessages.length, ...chat.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp) // Ensure dates are properly parsed
    })));
    saveAppState();
    scrollToBottom();
  }
};

const deleteChat = (chatId: string) => {
  const chat = chatHistory.find(c => c.id === chatId);
  const chatTitle = chat ? chat.title : 'Unknown Chat';
  
  confirmModal.title = 'Delete Chat';
  confirmModal.message = `Are you sure you want to delete "${chatTitle}"?`;
  confirmModal.details = ['This action cannot be undone.'];
  confirmModal.type = 'warning';
  confirmModal.confirmText = 'Delete';
  confirmModal.cancelText = 'Cancel';
  confirmModal.showCancel = true;
  confirmModal.onConfirm = () => {
    const index = chatHistory.findIndex(c => c.id === chatId);
    if (index >= 0) {
      chatHistory.splice(index, 1);
      localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
      
      // If deleting current chat, start new one
      if (chatId === currentChatId.value) {
        newChat();
      }
      
      showToast(`Deleted chat: ${chatTitle}`, 'success');
    }
    closeConfirmModal();
  };
  confirmModal.show = true;
};

const startEdit = (chatId: string, title: string) => {
  console.log('Starting edit for chat:', chatId, title);
  editingChatId.value = chatId;
  editingTitle.value = title;
  
  // Force focus after DOM update
  nextTick(() => {
    const editInputs = document.querySelectorAll(`input[key="edit-${chatId}"]`);
    const input = editInputs[0] as HTMLInputElement;
    if (input) {
      input.focus();
      input.select();
      console.log('Edit input focused');
    } else {
      console.error('Edit input not found');
    }
  });
};

const saveTitle = (chatId: string) => {
  console.log('Saving title for chat:', chatId, editingTitle.value);
  
  const trimmedTitle = editingTitle.value.trim();
  
  if (!trimmedTitle) {
    showToast('Title cannot be empty', 'error');
    return;
  }
  
  const chat = chatHistory.find(c => c.id === chatId);
  if (chat) {
    chat.title = trimmedTitle;
    localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
    showToast('Chat renamed successfully', 'success');
    console.log('Chat title saved:', chat.title);
    
    // Cancel edit after successful save
    cancelEdit();
  } else {
    showToast('Chat not found', 'error');
    console.error('Chat not found for ID:', chatId);
    cancelEdit();
  }
};

const cancelEdit = () => {
  console.log('Cancelling edit');
  editingChatId.value = null;
  editingTitle.value = '';
};

const saveChatSession = async () => {
  if (currentMessages.length === 0) return; // Don't save empty chats
  
  // Check if auto-save is enabled in settings
  try {
    const savedSettings = localStorage.getItem('chatio-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const autoSaveEnabled = settings.chatSettings?.autoSave ?? true; // Default to true for backward compatibility
      
      if (!autoSaveEnabled) {
        console.log('Auto-save disabled - skipping chat session save');
        return; // Don't save if auto-save is disabled
      }
    }
  } catch (error) {
    console.error('Failed to check auto-save setting:', error);
    // If we can't read settings, default to saving (fail-safe)
  }
  
  const existingChatIndex = chatHistory.findIndex(c => c.id === currentChatId.value);
  const firstMessage = currentMessages[0];
  const chatSession: ChatSession = {
    id: currentChatId.value,
    title: firstMessage 
      ? firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
      : 'New Chat',
    timestamp: new Date(),
    messages: [...currentMessages],
    messageCount: currentMessages.length
  };

  if (existingChatIndex >= 0) {
    chatHistory[existingChatIndex] = chatSession;
  } else {
    chatHistory.unshift(chatSession);
  }

  // Save to localStorage
  localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
  console.log('Chat session saved (auto-save enabled)');
};

const loadChatHistory = () => {
  try {
    const saved = localStorage.getItem('chatio-chat-history');
    if (saved) {
      const sessions = JSON.parse(saved);
      // Ensure proper date parsing
      const parsedSessions = sessions.map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      chatHistory.splice(0, chatHistory.length, ...parsedSessions);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
};

const selectPrompt = (prompt: string) => {
  currentMessage.value = prompt;
  nextTick(() => {
    messageInput.value?.focus();
  });
};

const exportCurrentChat = () => {
  const chatData = {
    timestamp: new Date().toISOString(),
    chatId: currentChatId.value,
    messages: currentMessages
  };
  
  downloadJson(chatData, `chatio-chat-${new Date().toISOString().split('T')[0]}.json`);
  showToast('Chat exported', 'success');
};

const exportAllChats = () => {
  const allData = {
    timestamp: new Date().toISOString(),
    chats: chatHistory
  };
  
  downloadJson(allData, `chatio-all-chats-${new Date().toISOString().split('T')[0]}.json`);
  showToast('All chats exported', 'success');
};

const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    showToast('Message copied', 'success');
  } catch (error) {
    console.error('Failed to copy message:', error);
    showToast('Failed to copy message', 'error');
  }
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      
      // Add a small delay to ensure content is fully rendered
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      }, 100);
    }
  });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// Auto-save state on changes and add visibility handling
watch([showHistory, currentChatId, currentMessage], () => {
  saveAppState();
});

// Handle visibility change and page unload
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // Save state immediately when tab becomes hidden
    forceStateSync();
    console.log('Tab hidden - state saved');
  } else if (document.visibilityState === 'visible') {
    // Restore state when tab becomes visible again
    console.log('Tab visible - restoring state');
    
    // Small delay to ensure UI is ready
    setTimeout(() => {
      // Reload chat history in case it was updated elsewhere
      loadChatHistory();
      
      // Check if all chats were deleted while away
      if (chatHistory.length === 0 && currentMessages.length > 0) {
        console.log('Detected all chats were deleted, resetting to new chat');
        resetToNewChat();
        return;
      }
      
      // Restore app state
      loadAppState();
      
      // Ensure we scroll to bottom if there are messages
      if (currentMessages.length > 0) {
        scrollToBottom();
      }
    }, 100);
  }
};

const handleBeforeUnload = () => {
  forceStateSync();
};

// Save state before component unmounts
onUnmounted(() => {
  forceStateSync();
  window.removeEventListener('beforeunload', handleBeforeUnload);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// Lifecycle
onMounted(() => {
  loadChatHistory();
  loadAppState();
  
  // Load selected module from localStorage
  try {
    const savedModule = localStorage.getItem('chatio-selected-module');
    if (savedModule) {
      const module = JSON.parse(savedModule);
      // Check if this module is still available by checking provider settings
      const hasApiKey = getProviderModels(module.provider).length > 0;
      if (hasApiKey) {
        selectedModule.value = module.displayName;
        selectedProvider.value = module.provider;
        selectedModel.value = module.model;
      } else {
        // Clear saved module if no longer available
        clearSelectedModule();
      }
    }
  } catch (error) {
    console.error('Failed to load selected module:', error);
  }
  
  // Listen for settings updates to refresh available models
  const handleSettingsUpdate = () => {
    console.log('Settings updated, refreshing available models...');
    
    // Check if current selected model is still valid
    if (selectedProvider.value) {
      const currentModels = getProviderModels(selectedProvider.value);
      const isCurrentModelStillValid = currentModels.some((m: any) => m.model === selectedModel.value);
      
      if (!isCurrentModelStillValid) {
        // Current model is no longer valid, clear selection
        clearSelectedModule();
        showToast('Previously selected model is no longer available', 'error');
      }
    }
  };
  
  // Listen for chat clearing events from settings
  const handleChatsClear = () => {
    console.log('Received chats clear event, resetting to new chat');
    // Clear local chat history
    chatHistory.splice(0);
    // Reset to new chat state
    resetToNewChat();
    showToast('All chats cleared', 'success');
  };
  
  // Listen for settings updates
  window.addEventListener('chatio-settings-updated', handleSettingsUpdate);
  window.addEventListener('chatio-chats-cleared', handleChatsClear);
  
  // Cleanup listener on unmount
  onUnmounted(() => {
    window.removeEventListener('chatio-settings-updated', handleSettingsUpdate);
    window.removeEventListener('chatio-chats-cleared', handleChatsClear);
  });
  
  // SIMPLIFIED AND ROBUST copy function for HTML buttons
  (window as any).copyCodeBlock = async (button: HTMLElement) => {
    try {
      // Method 1: Try to find code by data-attribute
      const codeId = button.getAttribute('data-code-target');
      let codeElement = null;
      let codeText = '';
      
      if (codeId) {
        codeElement = document.querySelector(`[data-code-content="${codeId}"]`);
        console.log('Method 1 - Found by data attr:', !!codeElement);
      }
      
      // Method 2: Find code element by traversing DOM structure
      if (!codeElement) {
        const codeBlock = button.closest('.chatio-code-block');
        if (codeBlock) {
          codeElement = codeBlock.querySelector('code');
          console.log('Method 2 - Found by DOM traversal:', !!codeElement);
        }
      }
      
      // Method 3: Find the nearest code element
      if (!codeElement) {
        const parent = button.parentElement?.parentElement;
        if (parent) {
          codeElement = parent.querySelector('code');
          console.log('Method 3 - Found by parent traversal:', !!codeElement);
        }
      }
      
      // Method 4: Search all code elements and find the closest one
      if (!codeElement) {
        const allCodes = Array.from(document.querySelectorAll('.chatio-code-block code'));
        for (const code of allCodes) {
          const copyBtn = code.closest('.chatio-code-block')?.querySelector('.chatio-code-copy');
          if (copyBtn === button) {
            codeElement = code;
            console.log('Method 4 - Found by reverse lookup:', !!codeElement);
            break;
          }
        }
      }
      
      if (!codeElement) {
        console.error('No code element found with any method');
        showToast('Could not find code to copy', 'error');
        return;
      }
      
      // Extract text content
      codeText = codeElement.textContent || (codeElement as HTMLElement).innerText || '';
      
      // Clean up the text (remove extra whitespace)
      codeText = codeText.trim();
      
      console.log('Code text extracted:', {
        length: codeText.length,
        preview: codeText.substring(0, 50) + (codeText.length > 50 ? '...' : ''),
        element: codeElement.tagName,
        className: codeElement.className
      });
      
      if (!codeText) {
        console.error('No code content found');
        showToast('No code content to copy', 'error');
        return;
      }
      
      // Copy to clipboard
      await navigator.clipboard.writeText(codeText);
      
      // Visual feedback
      const originalHTML = button.innerHTML;
      const originalStyle = button.style.cssText;
      
      button.innerHTML = '<i class="fas fa-check"></i> Copied!';
      button.style.background = '#10b981';
      button.style.color = 'white';
      button.style.padding = '6px 12px';
      button.style.borderRadius = '4px';
      
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.style.cssText = originalStyle;
      }, 2000);
      
      showToast('Code copied to clipboard!', 'success');
      console.log('=== COPY SUCCESS ===', codeText.length, 'characters');
      
    } catch (error) {
      console.error('Copy failed:', error);
      showToast('Failed to copy code', 'error');
      
      // Fallback method
      try {
        // Try to get code text again for fallback
        const codeBlock = button.closest('.chatio-code-block');
        const codeElement = codeBlock?.querySelector('code');
        const codeText = codeElement?.textContent || '';
        
        if (codeText.trim()) {
          const textArea = document.createElement('textarea');
          textArea.value = codeText.trim();
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '-9999px';
          document.body.appendChild(textArea);
          textArea.select();
          textArea.setSelectionRange(0, 99999); // For mobile
          
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          
          if (success) {
            showToast('Code copied (fallback method)', 'success');
            console.log('Fallback copy successful');
            
            // Visual feedback for fallback too
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            button.style.color = 'white';
            
            setTimeout(() => {
              button.innerHTML = originalHTML;
            }, 2000);
          } else {
            throw new Error('execCommand failed');
          }
        } else {
          throw new Error('No text to copy');
        }
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        showToast('Copy failed - please select and copy manually', 'error');
      }
    }
  };
  
  console.log('✅ Enhanced copyCodeBlock function attached to window');
  
  // GLOBAL click handler using event delegation (works without rebuild)
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if clicked element is a copy button or contains a copy button
    let copyButton = null;
    
    if (target.classList.contains('chatio-code-copy')) {
      copyButton = target;
    } else if (target.closest('.chatio-code-copy')) {
      copyButton = target.closest('.chatio-code-copy');
    }
    
    if (copyButton) {
      event.preventDefault();
      event.stopPropagation();
      (window as any).copyCodeBlock(copyButton);
    }
  });
  
  console.log('✅ Global click event listener attached to document');
  
  // Add event listeners for better state persistence
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Auto-save periodically - but only if auto-save is enabled
  const autoSaveInterval = setInterval(() => {
    if (currentMessages.length > 0) {
      // Check if auto-save is enabled before saving
      try {
        const savedSettings = localStorage.getItem('chatio-settings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const autoSaveEnabled = settings.chatSettings?.autoSave ?? true;
          
          if (autoSaveEnabled) {
            saveChatSession();
            saveAppState();
            console.log('Periodic auto-save completed');
          } else {
            console.log('Periodic auto-save skipped (disabled in settings)');
          }
        } else {
          // No settings found, default to saving
          saveChatSession();
          saveAppState();
        }
      } catch (error) {
        console.error('Error during periodic auto-save:', error);
        // Fail-safe: save anyway if we can't read settings
        saveChatSession();
        saveAppState();
      }
    }
  }, 30000); // Save every 30 seconds
  
  // Clear interval on unmount
  onUnmounted(() => {
    clearInterval(autoSaveInterval);
  });
});

// Watchers
watch(() => currentMessages.length, () => {
  scrollToBottom();
});

// Watch for when all chats are deleted and reset to new chat
watch(() => chatHistory.length, (newLength) => {
  if (newLength === 0 && currentMessages.length > 0) {
    // All chats were deleted, reset to new chat state
    resetToNewChat();
  }
});

// Emits
const emit = defineEmits<{
  messageCountChanged: [count: number];
  switchTab: [tab: string];
}>();

watch(() => currentMessages.length, (count) => {
  emit('messageCountChanged', count);
});

// New methods
const getCurrentChatTitle = () => {
  if (currentMessages.length > 0) {
    // Find the current chat in history
    const currentChat = chatHistory.find(c => c.id === currentChatId.value);
    if (currentChat) {
      return currentChat.title;
    }
    // Fallback to first message preview
    const firstMessage = currentMessages[0];
    return firstMessage ? firstMessage.content.substring(0, 30) + '...' : 'New Chat';
  }
  return 'New Chat';
};

// Message editing functions
const startMessageEdit = (messageId: string, content: string) => {
  editingMessageId.value = messageId;
  editingMessageContent.value = content;
  
  // Copy files to editing state
  const message = currentMessages.find(m => m.id === messageId);
  if (message && message.files) {
    editingFiles.value = [...message.files];
  } else {
    editingFiles.value = [];
  }
};

const cancelMessageEdit = () => {
  editingMessageId.value = null;
  editingMessageContent.value = '';
  editingFiles.value = [];
};

const removeEditingFile = (index: number) => {
  editingFiles.value.splice(index, 1);
  showToast('File removed', 'success');
};

const saveMessageEdit = async (messageId: string, messageIndex: number) => {
  if (!editingMessageContent.value.trim() && editingFiles.value.length === 0) {
    showToast('Message cannot be empty', 'error');
    return;
  }

  // Check if a provider is selected
  if (!selectedProvider.value || !selectedModel.value) {
    showToast('Please select an AI model first', 'error');
    showModuleModal.value = true;
    return;
  }

  // Update the message
  const messageToEdit = currentMessages.find(m => m.id === messageId);
  if (messageToEdit) {
    messageToEdit.content = editingMessageContent.value.trim();
    messageToEdit.files = editingFiles.value.length > 0 ? [...editingFiles.value] : undefined;
    messageToEdit.provider = selectedProvider.value; // Update provider
    messageToEdit.model = selectedModel.value; // Update model
    
    // Remove all subsequent messages (AI responses after this message)
    currentMessages.splice(messageIndex + 1);
    
    // Save updated chat
    await manualSaveChatSession(); // Use manual save for explicit user actions
    saveAppState();
    
    // Cancel edit mode
    cancelMessageEdit();
    
    showToast('Message updated, resending...', 'success');
    
    // Actually resend the message using the current sendMessage logic
    await resendLastMessage();
  }
};

// Helper function to resend the last user message
const resendLastMessage = async () => {
  const lastUserMessage = currentMessages.findLast(msg => msg.role === 'user');
  if (!lastUserMessage) {
    showToast('No user message to resend', 'error');
    return;
  }

  // Temporarily set current message to the last user message content
  const originalMessage = currentMessage.value;
  const originalFiles = [...attachedFiles];
  
  currentMessage.value = lastUserMessage.content;
  attachedFiles.splice(0);
  if (lastUserMessage.files) {
    attachedFiles.push(...lastUserMessage.files);
  }
  
  // Remove the last user message before resending
  const lastUserIndex = currentMessages.findLastIndex(msg => msg.role === 'user');
  if (lastUserIndex >= 0) {
    currentMessages.splice(lastUserIndex);
  }
  
  // Send the message
  await sendMessage();
  
  // Restore original state
  currentMessage.value = originalMessage;
  attachedFiles.splice(0, attachedFiles.length, ...originalFiles);
};

// File handling methods
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      console.log('Processing file upload:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        console.log('File read successfully:', {
          name: file.name,
          type: file.type,
          contentLength: content?.length || 0,
          isDataURL: content?.startsWith('data:') || false
        });
        
        const attachedFile: AttachedFile = {
          name: file.name,
          type: file.type,
          content,
          preview: file.type.startsWith('image/') ? content : undefined
        };
        attachedFiles.push(attachedFile);
        console.log('Added to attachedFiles, total files:', attachedFiles.length);
      };
      
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        showToast(`Failed to read file: ${file.name}`, 'error');
      };
      
      // For images, read as data URL; for text files, read as text
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.xml') || file.name.endsWith('.html')) {
        reader.readAsText(file);
      } else {
        // For other files, read as data URL for now
        reader.readAsDataURL(file);
      }
    });
    
    showToast(`${files.length} file(s) attached`, 'success');
  }
  
  // Reset file input
  if (target) {
    target.value = '';
  }
};

const removeFile = (index: number) => {
  attachedFiles.splice(index, 1);
  showToast('File removed', 'success');
};

// Clipboard paste support
const handlePaste = async (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    if (!item) continue; // Skip if item is undefined
    
    // Handle images
    if (item.type.startsWith('image/')) {
      event.preventDefault();
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const attachedFile: AttachedFile = {
            name: `screenshot-${Date.now()}.png`,
            type: 'image/png',
            content,
            preview: content
          };
          attachedFiles.push(attachedFile);
          showToast('Screenshot pasted', 'success');
        };
        reader.readAsDataURL(file);
      }
    }
    
    // Handle text (URLs, code, etc.)
    if (item.type === 'text/plain') {
      item.getAsString((text) => {
        // Check if it's a URL
        if (text.startsWith('http://') || text.startsWith('https://')) {
          currentMessage.value += `\n\n[URL: ${text}]\n`;
        } else if (text.length > 100) {
          // Long text, treat as code or content
          currentMessage.value += `\n\n\`\`\`\n${text}\n\`\`\`\n`;
        } else {
          // Short text, just append
          currentMessage.value += text;
        }
      });
    }
  }
};

const pasteFromClipboard = async () => {
  try {
    const clipboardItems = await navigator.clipboard.read();
    
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          const blob = await clipboardItem.getType(type);
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            const attachedFile: AttachedFile = {
              name: `clipboard-image-${Date.now()}.png`,
              type: 'image/png',
              content,
              preview: content
            };
            attachedFiles.push(attachedFile);
            showToast('Image pasted from clipboard', 'success');
          };
          reader.readAsDataURL(blob);
        } else if (type === 'text/plain') {
          const text = await clipboardItem.getType(type);
          const textContent = await text.text();
          
          if (textContent.startsWith('http://') || textContent.startsWith('https://')) {
            currentMessage.value += `\n\n[URL: ${textContent}]\n`;
          } else {
            currentMessage.value += textContent;
          }
          showToast('Text pasted from clipboard', 'success');
        }
      }
    }
  } catch (error) {
    console.error('Failed to read clipboard:', error);
    showToast('Failed to access clipboard', 'error');
  }
};

// Drag and drop support
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const attachedFile: AttachedFile = {
          name: file.name,
          type: file.type,
          content,
          preview: file.type.startsWith('image/') ? content : undefined
        };
        attachedFiles.push(attachedFile);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    
    showToast(`${files.length} file(s) dropped and attached`, 'success');
  }
};

const insertCodeBlock = () => {
  const codeTemplate = '```\n\n```';
  currentMessage.value += codeTemplate;
  
  // Focus and position cursor inside code block
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus();
      const position = currentMessage.value.length - 3; // Position before closing ```
      messageInput.value.setSelectionRange(position, position);
    }
  });
};

const insertHttpRequest = () => {
  const httpTemplate = '```http\n\n```';
  
  currentMessage.value += httpTemplate;
  
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.focus();
      const position = currentMessage.value.length - 3; // Position before closing ```
      messageInput.value.setSelectionRange(position, position);
    }
  });
};

// New methods
const openImageGallery = (files: { name: string; content: string; type: string }[], startIndex: number = 0) => {
  const imageFiles = getImageFiles(files);
  imageModal.show = true;
  imageModal.images = imageFiles;
  imageModal.currentIndex = startIndex;
  
  // Add escape key listener
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeImageModal();
      document.removeEventListener('keydown', handleEscape);
    }
    if (e.key === 'ArrowLeft') {
      prevImage();
    }
    if (e.key === 'ArrowRight') {
      nextImage();
    }
  };
  document.addEventListener('keydown', handleEscape);
};

const prevImage = () => {
  if (imageModal.currentIndex > 0) {
    imageModal.currentIndex--;
  }
};

const nextImage = () => {
  if (imageModal.currentIndex < imageModal.images.length - 1) {
    imageModal.currentIndex++;
  }
};

const closeImageModal = () => {
  imageModal.show = false;
  imageModal.images = [];
  imageModal.currentIndex = 0;
};

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    showToast('Content copied to clipboard', 'success');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    showToast('Failed to copy to clipboard', 'error');
  }
};

// ENHANCED MARKDOWN PROCESSING WITH PROPER LIBRARY AND CODE BLOCK SUPPORT
const formatMessageSafely = (content: string, isUserMessage: boolean = false) => {
  // For USER messages: ESCAPE HTML to show as plain text (no XSS execution)
  if (isUserMessage) {
    let userContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\n/g, '<br>');
    return `<div class="chatio-markdown">${userContent}</div>`;
  }

  // For AI responses: Use markdown parsing but keep code examples safe
  try {
    // Configure marked to be as permissive as possible
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Parse markdown to HTML
    let html = marked(content) as string;
    
    // SECURITY FIX: Only decode entities WITHIN code blocks, not in regular content
    html = enhanceCodeBlocksSecurely(html);
    
    // Apply DOMPurify for additional security (allow basic formatting but no scripts)
    html = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
      ALLOWED_ATTR: ['class', 'onclick', 'title', 'href', 'target', 'style'],
      ALLOW_DATA_ATTR: false
    });
    
    return `<div class="chatio-markdown">${html}</div>`;
  } catch (error) {
    console.error('Markdown processing error:', error);
    // Fallback: safe content with line breaks only
    let fallbackContent = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    return `<div class="chatio-markdown">${fallbackContent}</div>`;
  }
};

// SECURE function to enhance code blocks - NO COPY BUTTONS
const enhanceCodeBlocksSecurely = (html: string): string => {
  const codeBlockRegex = /<pre><code class="language-([^"]*)">([\s\S]*?)<\/code><\/pre>/g;
  const plainCodeBlockRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/g;
  
  // Replace code blocks with language - decode entities ONLY in code content
  html = html.replace(codeBlockRegex, (match, language, code) => {
    const displayLanguage = getLanguageDisplayName(language || 'text');
    // Decode HTML entities ONLY for code content to show proper code examples
    const decodedCode = decodeCodeEntities(code);
    const highlightedCode = applyHighlighting(decodedCode, language);
    
    return `
      <div class="chatio-code-block">
        <div class="chatio-code-header">
          <span class="chatio-code-lang">${displayLanguage}</span>
        </div>
        <code class="hljs language-${language || 'text'}" style="display: block; padding: 2rem; margin: 0; background: transparent; border: none; border-radius: 0; white-space: pre; overflow-x: auto; line-height: 1.5; font-family: 'Consolas', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px;">${highlightedCode}</code>
      </div>
    `;
  });
  
  // Replace plain code blocks - decode entities ONLY in code content
  html = html.replace(plainCodeBlockRegex, (match, code) => {
    // Decode HTML entities ONLY for code content
    const decodedCode = decodeCodeEntities(code);
    const highlightedCode = applyHighlighting(decodedCode, null);
    
    return `
      <div class="chatio-code-block">
        <div class="chatio-code-header">
          <span class="chatio-code-lang">Plain Text</span>
        </div>
        <code class="hljs" style="display: block; padding: 2rem; margin: 0; background: transparent; border: none; border-radius: 0; white-space: pre; overflow-x: auto; line-height: 1.5; font-family: 'Consolas', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px;">${highlightedCode}</code>
      </div>
    `;
  });
  
  // Enhance inline code - keep entities encoded for security
  html = html.replace(/<code>([^<]+)<\/code>/g, (match, code) => {
    return `<code class="chatio-inline-code">${code}</code>`;
  });
  
  return html;
};

// Function to decode HTML entities ONLY for code content (more secure)
const decodeCodeEntities = (code: string): string => {
  return code
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&'); // This should be last to avoid double-decoding
};

// Function to decode ALL HTML entities back to original characters
const decodeAllHtmlEntities = (html: string): string => {
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&'); // This should be last to avoid double-decoding
};

// Function to apply syntax highlighting - NO ENCODING
const applyHighlighting = (code: string, language: string | null): string => {
  if (typeof hljs !== 'undefined') {
    try {
      let highlighted;
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(code, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(code).value;
      }
      return highlighted;
    } catch (e) {
      console.warn('Highlight.js error:', e);
      return code;
    }
  }
  return code;
};

// Helper function - COMPLETELY DISABLED  
const escapeHtml = (text: string): string => {
  return text;
};

// Helper function to get display name for programming languages
const getLanguageDisplayName = (language: string): string => {
  const languageMap: { [key: string]: string } = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'python': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'sql': 'SQL',
    'bash': 'Bash',
    'shell': 'Shell',
    'powershell': 'PowerShell',
    'dockerfile': 'Dockerfile',
    'nginx': 'Nginx',
    'apache': 'Apache',
    'http': 'HTTP',
    'markdown': 'Markdown',
    'text': 'Plain Text',
    'plaintext': 'Plain Text'
  };
  
  return languageMap[language.toLowerCase()] || language.charAt(0).toUpperCase() + language.slice(1);
};

// Provider icons with SVG implementations
const getProviderIcon = (provider: string) => {
  const icons = {
    'openai': 'chatio-openai-icon', // Custom SVG class
    'anthropic': 'chatio-anthropic-icon', // Custom SVG class
    'google': 'chatio-google-icon', // Custom SVG class  
    'deepseek': 'chatio-deepseek-icon',
    'local': 'fas fa-server',
    'assistant': 'fas fa-robot'
  };
  return icons[provider as keyof typeof icons] || 'fas fa-robot';
};

// Utility functions for file handling
const getImageFiles = (files: { name: string; content: string; type: string }[]) => {
  return files.filter(file => file.type.startsWith('image/'));
};

const getFirstSixImages = (files: { name: string; content: string; type: string }[]) => {
  const imageFiles = getImageFiles(files);
  return imageFiles.slice(0, 6); // Show first 6 images only
};

const getImageGalleryClass = (count: number) => {
  if (count === 1) return 'single';
  if (count === 2) return 'double';
  if (count === 3) return 'triple';
  if (count === 4) return 'four';
  if (count === 5) return 'five';
  return 'six-plus';
};

const getNonImageFiles = (files: { name: string; content: string; type: string }[]) => {
  return files.filter(file => !file.type.startsWith('image/'));
};

const getFileExtension = (filename: string) => {
  const ext = filename.split('.').pop()?.toUpperCase();
  return ext || 'FILE';
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'fas fa-file-pdf';
    case 'doc':
    case 'docx': return 'fas fa-file-word';
    case 'xls':
    case 'xlsx': return 'fas fa-file-excel';
    case 'ppt':
    case 'pptx': return 'fas fa-file-powerpoint';
    case 'zip':
    case 'rar':
    case '7z': return 'fas fa-file-archive';
    case 'txt': return 'fas fa-file-alt';
    case 'json': return 'fas fa-file-code';
    case 'xml': return 'fas fa-file-code';
    case 'html': return 'fas fa-file-code';
    case 'css': return 'fas fa-file-code';
    case 'js': return 'fas fa-file-code';
    case 'py': return 'fas fa-file-code';
    case 'java': return 'fas fa-file-code';
    case 'cpp': return 'fas fa-file-code';
    case 'sql': return 'fas fa-database';
    default: return 'fas fa-file';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return Math.round(bytes / (1024 * 1024)) + ' MB';
};

const downloadFile = (file: { name: string; content: string; type: string }) => {
  try {
    let content = file.content;
    let mimeType = 'application/octet-stream';
    
    // If it's a base64 data URL, extract the content and set proper mime type
    if (content.startsWith('data:')) {
      const matches = content.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches[1] && matches[2]) {
        mimeType = matches[1];
        content = matches[2];
        // Convert base64 to blob
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    }
    
    // For text files, create blob directly
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloaded ${file.name}`, 'success');
  } catch (error) {
    console.error('Failed to download file:', error);
    showToast('Failed to download file', 'error');
  }
};

// Module selector methods
const openModuleModal = () => {
  showModuleModal.value = true;
};

const closeModuleModal = () => {
  showModuleModal.value = false;
};

// Get models for a specific provider
const getProviderModels = (provider: string) => {
  try {
    const settings = localStorage.getItem('chatio-settings');
    if (!settings) return [];
    
    const parsedSettings = JSON.parse(settings);
    const providers = parsedSettings.providers || {};
    
    const providerConfig = providers[provider];
    
    // For local provider, handle models differently
    if (provider === 'local') {
      const hasUrl = providerConfig?.url && providerConfig.url.trim() !== '';
      if (!hasUrl) return [];
      
      // Get models from comma-separated list in settings
      const modelsString = providerConfig?.models || '';
      if (modelsString.trim()) {
        const modelNames = modelsString.split(',').map((m: string) => m.trim()).filter((m: string) => m);
        return modelNames.map((model: string) => ({
          model: model,
          displayName: model.charAt(0).toUpperCase() + model.slice(1).replace(/-/g, ' ')
        }));
      } else {
        // Return placeholder if no models configured
        return [{ model: 'configure-models', displayName: 'Configure models in settings' }];
      }
    }
    
    // For other providers, check API key and return static models
    const hasApiKey = providerConfig?.apiKey && providerConfig.apiKey.trim() !== '';
    
    if (hasApiKey && availableModels[provider as keyof typeof availableModels]) {
      return availableModels[provider as keyof typeof availableModels];
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting models for ${provider}:`, error);
    return [];
  }
};

// Updated selectModule function
const selectModule = (module: any) => {
  // Handle special case for configure-models placeholder
  if (module.model === 'configure-models') {
    showModuleModal.value = false;
    goToSettings();
    return;
  }
  
  selectedModule.value = module.displayName;
  selectedProvider.value = module.provider;
  selectedModel.value = module.model;
  showModuleModal.value = false;
  
  // Save selected module to localStorage for persistence
  try {
    localStorage.setItem('chatio-selected-module', JSON.stringify({
      provider: module.provider,
      model: module.model,
      displayName: module.displayName
    }));
    showToast(`Selected ${module.displayName}`, 'success');
  } catch (error) {
    console.error('Failed to save selected module:', error);
  }
};

// Updated goToSettings function with better navigation
const goToSettings = () => {
  showModuleModal.value = false;
  
  // Emit the tab switch event
  emit('switchTab', 'settings');
  
  // Force the parent component to handle the tab switch
  nextTick(() => {
    // Try multiple methods to ensure tab switching works
    
    // Method 1: Direct DOM manipulation
    const settingsTab = document.querySelector('[data-tab="settings"]') as HTMLElement;
    if (settingsTab) {
      settingsTab.click();
    }
    
    // Method 2: Dispatch custom event
    window.dispatchEvent(new CustomEvent('chatio-switch-tab', {
      detail: { tab: 'settings' }
    }));
    
    // Method 3: Try to find and click settings tab by text content
    const allTabs = document.querySelectorAll('.chatio-tab');
    allTabs.forEach(tab => {
      if (tab.textContent?.toLowerCase().includes('settings')) {
        (tab as HTMLElement).click();
      }
    });
  });
};

// Add safety check for image modal
const getCurrentImage = () => {
  if (imageModal.images && imageModal.images.length > 0 && imageModal.currentIndex >= 0 && imageModal.currentIndex < imageModal.images.length) {
    return imageModal.images[imageModal.currentIndex];
  }
  return null;
};

const clearSelectedModule = () => {
  selectedModule.value = '';
  selectedProvider.value = '';
  selectedModel.value = '';
  showModuleModal.value = false;
  
  // Remove from localStorage
  try {
    localStorage.removeItem('chatio-selected-module');
  } catch (error) {
    console.error('Failed to clear selected module:', error);
  }
};

const getBotDisplayName = (provider?: string, model?: string) => {
  if (!model) return 'AI Assistant';
  
  // Handle special case for configure-models placeholder
  if (model === 'configure-models') {
    return 'Configure models in settings';
  }
  
  // FIXED: Just show model name, not provider prefix
  let modelName = model;
  if (model.includes('-')) {
    // Format model names nicely
    modelName = model.split('-').map(part => {
      if (part === 'gpt') return 'GPT';
      if (part === 'claude') return 'Claude';
      if (part === 'gemini') return 'Gemini';
      if (part === 'deepseek') return 'DeepSeek';
      if (part === 'llama') return 'LLaMA';
      if (part === 'mistral') return 'Mistral';
      if (part === 'codellama') return 'CodeLLaMA';
      if (part === 'gamma') return 'Gamma';
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  } else {
    modelName = model.charAt(0).toUpperCase() + model.slice(1);
  }
  
  // Clean up common patterns
  modelName = modelName
    .replace(/\d{8}/g, '') // Remove date stamps like 20241022
    .replace(/\s+/g, ' ') // Clean up multiple spaces
    .trim();
  
  // For local models, add (ollama) suffix
  if (provider === 'local' && model !== 'configure-models') {
    return `${modelName} (ollama)`;
  }
  
  return modelName;
};

const previewFile = (file: AttachedFile) => {
  const content = file.content.length > 500 ? file.content.substring(0, 500) + '...' : file.content;
  
  confirmModal.title = 'File Preview';
  confirmModal.message = `File: ${file.name}\nType: ${file.type}\nSize: ${file.content.length} chars`;
  confirmModal.details = [`Content preview:\n${content}`];
  confirmModal.type = 'alert';
  confirmModal.confirmText = 'Close';
  confirmModal.showCancel = false;
  confirmModal.onConfirm = () => {
    closeConfirmModal();
  };
  confirmModal.show = true;
};

// Get provider icon based on selected provider
const getSelectedProviderIcon = () => {
  if (!selectedProvider.value) {
    return 'fas fa-brain'; // Default brain icon when nothing selected
  }
  
  switch (selectedProvider.value) {
    case 'openai':
      return 'chatio-openai-icon';
    case 'anthropic':
      return 'chatio-anthropic-icon';
    case 'google':
      return 'chatio-google-icon';
    case 'deepseek':
      return 'chatio-deepseek-icon';
    case 'local':
      return 'fas fa-server';
    default:
      return 'fas fa-brain';
  }
};

// Manual save function that ignores auto-save setting (for explicit user actions)
const manualSaveChatSession = async () => {
  if (currentMessages.length === 0) return;
  
  const existingChatIndex = chatHistory.findIndex(c => c.id === currentChatId.value);
  const firstMessage = currentMessages[0];
  const chatSession: ChatSession = {
    id: currentChatId.value,
    title: firstMessage 
      ? firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
      : 'New Chat',
    timestamp: new Date(),
    messages: [...currentMessages],
    messageCount: currentMessages.length
  };

  if (existingChatIndex >= 0) {
    chatHistory[existingChatIndex] = chatSession;
  } else {
    chatHistory.unshift(chatSession);
  }

  localStorage.setItem('chatio-chat-history', JSON.stringify(chatHistory));
  console.log('Chat session manually saved');
};

// Function to check if auto-save is currently enabled
const isAutoSaveEnabled = (): boolean => {
  try {
    const savedSettings = localStorage.getItem('chatio-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.chatSettings?.autoSave ?? true;
    }
  } catch (error) {
    console.error('Failed to check auto-save setting:', error);
  }
  return true; // Default to enabled
};

const clearAllChats = () => {
  confirmModal.title = 'Clear All Chats';
  confirmModal.message = 'Are you sure you want to clear all chat history?';
  confirmModal.details = [
    'This will permanently delete all saved chats.',
    'This action cannot be undone.',
    'Your current conversation will be reset to a new chat.'
  ];
  confirmModal.type = 'warning';
  confirmModal.confirmText = 'Clear All';
  confirmModal.cancelText = 'Cancel';
  confirmModal.showCancel = true;
  confirmModal.onConfirm = () => {
    // Clear chat history
    chatHistory.splice(0);
    localStorage.removeItem('chatio-chat-history');
    
    // Reset current chat state
    currentMessages.splice(0);
    currentMessage.value = '';
    attachedFiles.splice(0);
    
    // Start a new chat
    const newChatId = `chat_${Date.now()}`;
    currentChatId.value = newChatId;
    
    // Clear app state
    localStorage.removeItem('chatio-app-state');
    
    // Save new state
    saveAppState();
    
    showToast('All chats cleared', 'success');
    closeConfirmModal();
  };
  confirmModal.show = true;
};

</script>

<style scoped>
/* Component styles are handled by design-system.css */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-8px);
  }
  70% {
    transform: translateY(-4px);
  }
  90% {
    transform: translateY(-2px);
  }
}
</style> 
