<template>
  <div class="game-container">
    <!-- Nagłówek walki -->
    <div class="location-header">
      <div>
        <div class="bebas battle-title" style="color:#e94560;">🥊 {{ t('battle.title') }}</div>
        <div class="chapter-label">{{ locationName }}</div>
      </div>
      <img :src="logoDkg" class="location-logo" alt="DKG" />
    </div>

    <!-- Walka o pas -->
    <div v-if="combat?.titleInfo?.isTitle" class="title-fight-banner">
      🏆 {{ t('game.title_fight_banner') }} {{ combat.titleInfo.titleName.toUpperCase() }}!
    </div>

    <!-- Status walki -->
    <p class="section-label">{{ t('battle.status_title') }}</p>
    <div class="battle-status">
      <div class="fighter-card card">
        <div class="fighter-name">🤼 {{ p.name }}</div>
        <StatBar :current="p.currentHp"     :maximum="p.maxHp"     color="#e94560" label="HP" />
        <StatBar :current="p.currentEnergy" :maximum="p.maxEnergy" color="#4ecdc4" label="En" />
      </div>
      <div class="fighter-card card" style="border-color:#f39c12;">
        <div class="fighter-name" style="color:#f39c12;">
          ⚔️ {{ npc.name }} Lvl{{ npc.level }}
        </div>
        <StatBar :current="npc.currentHp"     :maximum="npc.maxHp"     color="#f39c12" label="HP" />
        <StatBar :current="npc.currentEnergy" :maximum="npc.maxEnergy" color="#9b59b6" label="En" />
      </div>
    </div>

    <!-- Ostatnie wydarzenie -->
    <div v-if="gs.lastEvent" class="last-event">
      <span>📢</span><span>{{ gs.lastEvent }}</span>
    </div>

    <!-- Log walki -->
    <div class="journal battle-log">
      <div v-for="(line, i) in recentLog" :key="i">{{ line }}</div>
    </div>

    <!-- Koniec walki -->
    <div v-if="combat?.over">
      <div v-if="combat.playerWon" class="result-banner result-win">{{ t('battle.you_won') }}</div>
      <div v-else                  class="result-banner result-loss">{{ t('battle.you_lost') }}</div>
      <button class="btn btn-primary" @click="finishBattle">{{ t('battle.continue') }}</button>
    </div>

    <!-- Akcje gracza -->
    <div v-else>
      <p class="section-label">{{ t('battle.your_turn') }}</p>

      <!-- 3 ruchy -->
      <div class="moves-grid-3">
        <button
          v-for="move in p.moves"
          :key="move.id"
          :class="['btn', 'move-cell', p.currentEnergy < move.energyCost ? 'btn-dark' : 'btn-dark']"
          :disabled="p.currentEnergy < move.energyCost"
          @click="useMove(move)"
        >
          <div class="move-cell-name">{{ move.name }}</div>
          <div class="move-cell-cost">{{ move.energyCost }}⚡</div>
        </button>
      </div>

      <!-- Finisher + Adrenalina -->
      <div class="moves-grid-2">
        <button
          v-if="p.finisher"
          :class="['btn', finisherOk ? 'btn-gold' : 'btn-dark']"
          :disabled="!finisherOk"
          @click="useMove(p.finisher)"
        >
          <div>💥 {{ p.finisher.name }}</div>
          <div style="font-size:0.65rem;">
            {{ p.finisher.energyCost }}⚡
            {{ finisherOk ? t('battle.finisher_available') : t('battle.finisher_locked') }}
          </div>
        </button>

        <button class="btn btn-teal" @click="useAdrenaline">
          {{ t('battle.adrenaline') }}
        </button>
      </div>
    </div>

    <!-- Log wydarzeń -->
    <p class="section-label">{{ t('hud.log_title') }}</p>
    <div class="journal">
      <div v-for="(entry, i) in gs.journal.slice(0, 30)" :key="i" v-html="entry"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { t } from '../i18n.js'
import StatBar from './StatBar.vue'
import logoDkg from '../assets/logo_creator.png'

const emit = defineEmits(['done'])
const gs = inject('gameState')

const p       = computed(() => gs.player)
const npc     = computed(() => gs.currentNpc)
const combat  = computed(() => gs.combat)
const locationName = computed(() => gs.chapter === 1 ? t('hud.location1') : t('hud.location2'))
const recentLog    = computed(() => combat.value?.recentLog ?? [])
const finisherOk   = computed(() => combat.value?.finisherAvailable ?? false)

function useMove(move) {
  if (!combat.value) return
  const result = combat.value.playerUseSkill(move)
  handleResult(result)
}

function useAdrenaline() {
  if (!combat.value) return
  const result = combat.value.playerAdrenaline()
  handleResult(result)
}

function handleResult(result) {
  result.logs?.forEach(l => gs.log(l))

  if (result.combatOver) {
    gs.resolveBattle({
      won:      result.won,
      isTitle:  result.isTitle ?? false,
      xpReward: result.xpReward ?? 0,
    })
    gs.save()
  }
}

function finishBattle() {
  gs.phase = 'game'
  gs.save()
  emit('done')
}
</script>

<style scoped>
.battle-status { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 4px; }
.fighter-card  { padding: 8px 10px; }
.fighter-name  { font-size: 0.78rem; font-weight: 700; color: #fff; margin-bottom: 4px; }

.battle-log { height: 120px; margin-bottom: 4px; }

.title-fight-banner {
  background: #2a1800; color: #f39c12;
  border: 1px solid #f39c12; border-radius: 6px;
  padding: 5px 12px; margin: 4px 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem; letter-spacing: 2px; text-align: center;
}

.result-banner {
  text-align: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 3px;
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
}
.result-win  { background: #001a0a; border: 1px solid #27ae60; color: #27ae60; }
.result-loss { background: #1a0000; border: 1px solid #e94560; color: #e94560; }
</style>
