<template>
  <div class="lang-screen fade-in">
    <p class="lang-label">{{ t('lang.select') }}</p>
    <button class="btn btn-dark lang-btn" @click="$emit('selected', 'pl')">
      {{ t('lang.pl') }}
    </button>
    <button class="btn btn-dark lang-btn" @click="$emit('selected', 'en')">
      {{ t('lang.en') }}
    </button>
  </div>
</template>

<script setup>
import { t } from '../i18n.js'
defineEmits(['selected'])
</script>

<style scoped>
.lang-screen {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
}
.lang-label {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-align: center;
}
.lang-btn { max-width: 260px; font-size: 1.1rem; padding: 14px; }
</style>
