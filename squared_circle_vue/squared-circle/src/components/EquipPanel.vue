<template>
  <div class="equip-panel card">
    <div v-for="[slot, { icon, label }] in slots" :key="slot" class="equip-row">
      <span class="equip-slot-label">{{ icon }} {{ label }}</span>
      <span :class="['equip-item', player.equipped[slot] ? 'equipped' : 'empty']">
        {{ player.equipped[slot]?.name ?? t('hud.slot_empty') }}
      </span>
      <button
        v-if="player.equipped[slot]"
        class="btn btn-sm btn-dark"
        @click="$emit('unequip', slot)"
      >{{ t('hud.unequip_btn') }}</button>
    </div>

    <!-- Torba -->
    <div v-if="player.inventory.length" class="inventory">
      <p class="section-label" style="margin-top:8px;">
        🎒 {{ t('hud.inventory_title') }} ({{ player.inventory.length }})
      </p>
      <div v-for="(item, idx) in player.inventory" :key="idx" class="inv-row">
        <div class="inv-info">
          <span class="inv-name">{{ item.name }}</span>
          <span class="inv-bonus">{{ item.bonuses.toString() }}</span>
        </div>
        <button class="btn btn-sm btn-teal" @click="$emit('equip', item)">
          {{ t('hud.equip_btn') }}
        </button>
      </div>
    </div>
    <p v-else class="empty-bag">{{ t('hud.inventory_empty') }}</p>
  </div>
</template>

<script setup>
import { t } from '../i18n.js'
defineProps({ player: Object })
defineEmits(['equip', 'unequip'])

const slots = Object.entries({
  outfit:       { icon: '👕', label: 'hud.slot_outfit' },
  gadget:       { icon: '🧤', label: 'hud.slot_gadget' },
  protector:    { icon: '🦺', label: 'hud.slot_protector' },
  championship: { icon: '🏆', label: 'hud.slot_championship' },
}).map(([slot, v]) => [slot, { icon: v.icon, label: t(v.label) }])
</script>

<style scoped>
.equip-panel { margin-top: 4px; }
.equip-row {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 0; border-bottom: 1px solid #1a1a2e;
  font-size: 0.75rem;
}
.equip-slot-label { color: #888; min-width: 80px; flex-shrink: 0; }
.equip-item { flex: 1; }
.equip-item.equipped { color: #ddd; }
.equip-item.empty    { color: #444; }

.inv-row {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 0; border-bottom: 1px solid #1a1a2e;
}
.inv-info { flex: 1; }
.inv-name  { font-size: 0.78rem; color: #ddd; display: block; }
.inv-bonus { font-size: 0.65rem; color: #4ecdc4; }
.empty-bag { color: #555; font-size: 0.75rem; margin-top: 6px; }
</style>
