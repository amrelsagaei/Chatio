<template>
  <div v-if="show" class="chatio-modal-overlay" @click="handleBackdropClick">
    <div class="chatio-modal-content" @click.stop>
      <div class="chatio-modal-header">
        <div class="chatio-modal-icon" :class="iconClass">
          <i :class="iconName"></i>
        </div>
        <h3 class="chatio-modal-title">{{ title }}</h3>
        <button class="chatio-modal-close" @click="handleCancel">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="chatio-modal-body">
        <p class="chatio-modal-message">{{ message }}</p>
        <div v-if="details" class="chatio-modal-details">
          <ul>
            <li v-for="detail in details" :key="detail">{{ detail }}</li>
          </ul>
        </div>
      </div>
      
      <div class="chatio-modal-footer">
        <button v-if="showCancel" class="chatio-btn" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="chatio-btn primary" :class="confirmButtonClass" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  title: string;
  message: string;
  details?: string[];
  type?: 'confirm' | 'alert' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'confirm',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: true
});

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const iconClass = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'chatio-modal-icon-warning';
    case 'error':
      return 'chatio-modal-icon-error';
    case 'alert':
      return 'chatio-modal-icon-info';
    default:
      return 'chatio-modal-icon-question';
  }
});

const iconName = computed(() => {
  switch (props.type) {
    case 'warning':
      return 'fas fa-exclamation-triangle';
    case 'error':
      return 'fas fa-times-circle';
    case 'alert':
      return 'fas fa-info-circle';
    default:
      return 'fas fa-question-circle';
  }
});

const confirmButtonClass = computed(() => {
  switch (props.type) {
    case 'error':
    case 'warning':
      return 'danger';
    default:
      return '';
  }
});

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};

const handleBackdropClick = () => {
  if (props.showCancel) {
    handleCancel();
  }
};
</script>

<style scoped>
.chatio-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.chatio-modal-content {
  background: var(--chatio-surface);
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--chatio-border);
}

.chatio-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--chatio-border);
}

.chatio-modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.chatio-modal-icon-question {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.chatio-modal-icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.chatio-modal-icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.chatio-modal-icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.chatio-modal-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: var(--chatio-text-primary);
  margin: 0;
}

.chatio-modal-close {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--chatio-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.chatio-modal-close:hover {
  background: var(--chatio-hover);
  color: var(--chatio-text-primary);
}

.chatio-modal-body {
  padding: 20px 24px;
}

.chatio-modal-message {
  color: var(--chatio-text-primary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.chatio-modal-details {
  background: var(--chatio-bg-secondary);
  border: 1px solid var(--chatio-border);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 12px;
}

.chatio-modal-details ul {
  margin: 0;
  padding-left: 20px;
  color: var(--chatio-text-secondary);
}

.chatio-modal-details li {
  margin-bottom: 4px;
}

.chatio-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--chatio-border);
  background: var(--chatio-bg-secondary);
}

.chatio-btn.danger {
  background: rgb(239, 68, 68);
  border-color: rgb(239, 68, 68);
  color: white;
}

.chatio-btn.danger:hover {
  background: rgb(220, 38, 38);
  border-color: rgb(220, 38, 38);
}

@media (max-width: 768px) {
  .chatio-modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .chatio-modal-header,
  .chatio-modal-body,
  .chatio-modal-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .chatio-modal-footer {
    flex-direction: column-reverse;
  }
  
  .chatio-modal-footer .chatio-btn {
    width: 100%;
  }
}
</style> 