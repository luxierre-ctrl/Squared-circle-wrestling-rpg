<!-- StatBar.vue -->
<template>
  <div class="stat-bar-wrap">
    <span class="stat-bar-label">{{ label }}</span>
    <div class="stat-bar-bg">
      <div class="stat-bar-fg" :style="{ width: pct + '%', background: color }"></div>
    </div>
    <span class="stat-bar-value">{{ current }}/{{ maximum }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  current: Number, maximum: Number, color: String, label: String,
})
const pct = computed(() => props.maximum > 0 ? Math.round((props.current / props.maximum) * 100) : 0)
</script>
