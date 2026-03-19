<template>
  <div>
    <!-- NAGŁÓWEK LOKACJI -->
    <div class="location-header">
      <div>
        <div class="bebas location-name">{{ locationName }}</div>
        <div class="chapter-label">{{ chapterLabel }}</div>
      </div>
      <img :src="logoDkg" class="location-logo" alt="DKG" />
    </div>

    <!-- KARTA POSTACI -->
    <p class="section-label">{{ t('hud.card_title') }}</p>
    <div class="card">
      <!-- Wiersz 1: Imię + LVL + Dzień -->
      <div class="card-row1">
        <div class="name-row">
          <span class="bebas player-name">{{ p.name.toUpperCase() }} [{{ p.characterClass }}]</span>
          <span class="lvl-badge">LVL {{ p.level }}</span>
        </div>
        <span v-if="day > 0" class="bebas day-label">{{ t('game.day') }} {{ day }}</span>
      </div>

      <!-- Federacja + Pas -->
      <div class="fed-row">
        {{ t('hud.federation_label') }}
        <span class="fed-name">{{ federationName }}</span>
        &nbsp;·&nbsp;
        {{ t('hud.belt_label') }}
        <span :style="{ color: hasBelt ? '#f39c12' : '#555' }">
          {{ hasBelt ? p.equipped.championship.name : t('hud.no_belt') }}
        </span>
      </div>

      <!-- Paski + statystyki -->
      <div class="stats-row">
        <!-- Paski -->
        <div class="bars-col">
          <StatBar :current="p.xp" :maximum="xpNeeded" color="#9b59b6" :label="t('hud.xp_label')" />
          <StatBar :current="p.currentHp" :maximum="p.maxHp" color="#e94560" :label="t('hud.hp_label')" />
          <StatBar :current="p.currentEnergy" :maximum="p.maxEnergy" color="#4ecdc4" :label="t('hud.energy_label')" />
        </div>
        <!-- Info -->
        <div class="info-col">
          <div class="info-wins">🏆 {{ t('hud.wins_label') }} {{ wins }}{{ winsMax }}</div>
          <div class="info-stat">💪 {{ p.effectiveStrength }}</div>
          <div class="info-stat">🏃 {{ p.effectiveDexterity }}</div>
        </div>
      </div>
    </div>

    <!-- RUCHY I UMIEJĘTNOŚCI -->
    <p class="section-label">{{ t('hud.skills_title') }}</p>
    <div class="moves-grid-3">
      <div v-for="move in p.moves" :key="move.id" class="move-cell">
        <div class="move-cell-name">{{ move.name }}</div>
        <div class="move-cell-cost">{{ move.energyCost }}⚡ ×{{ move.damageMultiplier }}</div>
      </div>
    </div>
    <div class="moves-grid-2">
      <div v-if="p.finisher" class="card card-gold move-fin">
        <div class="fin-name">{{ p.finisher.name }}</div>
        <div class="fin-cost">
          {{ p.finisher.energyCost }}💥×{{ p.finisher.damageMultiplier }}
          <span class="fin-tag">{{ t('hud.finisher_tag') }}</span>
        </div>
      </div>
      <div v-if="passive" class="card card-teal move-passive">
        <div class="passive-name">{{ passive.name }}</div>
        <div class="passive-desc">{{ t('hud.passive_label') }} · {{ passive.description.slice(0, 35) }}…</div>
      </div>
    </div>

    <!-- EKWIPUNEK -->
    <button class="btn btn-dark" @click="showEquip = !showEquip">
      {{ t('hud.equipment_btn') }}
    </button>
    <EquipPanel v-if="showEquip" :player="p" @equip="onEquip" @unequip="onUnequip" />

    <!-- OSTATNIE WYDARZENIE -->
    <div v-if="lastEvent" class="last-event">
      <span>📢</span>
      <span>{{ lastEvent }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { t } from '../i18n.js'
import { XP_THRESHOLDS } from '../game/Character.js'
import StatBar   from './StatBar.vue'
import EquipPanel from './EquipPanel.vue'
import logoDkg   from '../assets/logo_creator.png'

const props = defineProps({
  day: { type: Number, default: 0 },
})

const gs = inject('gameState')
const p  = computed(() => gs.player)
const showEquip = ref(false)

const chapter      = computed(() => gs.chapter)
const chapterLabel = computed(() => chapter.value === 1 ? t('hud.chapter1') : t('hud.chapter2'))
const locationName = computed(() => chapter.value === 1 ? t('hud.location1') : t('hud.location2'))
const federationName = computed(() => chapter.value === 1 ? t('hud.federation1') : t('hud.federation2'))
const wins    = computed(() => chapter.value === 1 ? gs.schoolWins : gs.federationWins)
const winsMax = computed(() => chapter.value === 1 ? '/5' : '')
const hasBelt = computed(() => !!p.value?.equipped?.championship)
const passive = computed(() => p.value?.passiveSkill)
const lastEvent = computed(() => gs.lastEvent)

const xpNeeded = computed(() => {
  if (!p.value) return 1
  return p.value.level < XP_THRESHOLDS.length ? XP_THRESHOLDS[p.value.level] : p.value.xp || 1
})

function onEquip(item) {
  const result = p.value.equip(item)
  if (result.ok) { gs.log(result.message); gs.save() }
  else alert(result.message)
}

function onUnequip(slot) {
  const msg = p.value.unequip(slot)
  gs.log(msg); gs.save()
}
</script>

<style scoped>
.location-name { font-size: 1.4rem; color: #fff; letter-spacing: 2px; }
.chapter-label { font-size: 0.62rem; color: #e94560; letter-spacing: 1px; text-transform: uppercase; }

.card-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}
.name-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.player-name { font-size: 1.05rem; color: #fff; }
.lvl-badge {
  background: #2a2a3e;
  border: 1px solid #e94560;
  border-radius: 5px;
  padding: 0 6px;
  font-size: 0.68rem;
  color: #e94560;
  font-weight: 700;
}
.day-label { font-size: 1.1rem; color: #fff; flex-shrink: 0; }

.fed-row { font-size: 0.65rem; color: #555; margin-bottom: 6px; }
.fed-name { color: #777; }

.stats-row { display: flex; gap: 8px; align-items: flex-start; }
.bars-col { flex: 1; min-width: 0; }
.info-col { flex-shrink: 0; text-align: right; font-size: 0.7rem; line-height: 1.8; }
.info-wins { color: #f39c12; }
.info-stat { color: #ddd; }

.move-fin, .move-passive { padding: 6px 8px; margin-bottom: 0; }
.fin-name  { font-size: 0.8rem; color: #f39c12; font-weight: 700; }
.fin-cost  { font-size: 0.63rem; color: #888; margin-top: 1px; }
.fin-tag   {
  background: #2a1800; color: #f39c12;
  padding: 0 4px; border-radius: 3px;
  font-size: 0.58rem; font-weight: 700;
  margin-left: 4px;
}
.passive-name { font-size: 0.8rem; color: #4ecdc4; font-weight: 700; }
.passive-desc { font-size: 0.63rem; color: #888; margin-top: 1px; }
</style>
