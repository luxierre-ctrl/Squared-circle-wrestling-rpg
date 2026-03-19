<template>
  <div class="game-container">
    <HUD :day="gs.day" />

    <!-- TYGODNIOWE ZDARZENIE -->
    <div v-if="weeklyEvent" class="card card-gold weekly-event">
      <p class="section-label">{{ t('game.weekly_event_title') }}</p>
      <p class="weekly-text" v-html="weeklyEvent.text"></p>
      <div v-if="weeklyEvent.choices">
        <button
          v-for="choice in weeklyEvent.choices"
          :key="choice.label"
          class="btn btn-dark"
          @click="resolveWeeklyEvent(choice.effect)"
        >{{ choice.label }}</button>
      </div>
      <button v-else class="btn btn-dark" @click="resolveWeeklyEvent(weeklyEvent.effect)">
        {{ t('game.weekly_event_ok') }}
      </button>
    </div>

    <!-- OFERTA FEDERACJI -->
    <div v-else-if="gs.canOfferChapter2" class="card card-teal">
      <p v-html="t('game.chapter2_offer')"></p>
      <p class="dialogue">{{ t('game.chapter2_kaz1') }}</p>
      <p class="dialogue">{{ t('game.chapter2_kaz2') }}</p>
      <button class="btn btn-primary" @click="gs.acceptChapter2(); gs.save()">
        {{ t('game.chapter2_accept') }}
      </button>
      <button class="btn btn-dark" @click="gs.declineChapter2(); gs.save()">
        {{ t('game.chapter2_decline') }}
      </button>
    </div>

    <!-- DZIEŃ WALKI -->
    <div v-else-if="gs.isFightDay">
      <div class="card card-red fight-day-card">
        <div class="bebas fight-day-title">🥊 {{ t('game.fight_day_title') }}</div>
        <!-- Info o pasie -->
        <div v-if="titleInfo.isTitle" class="title-fight-banner">
          {{ t('game.title_fight_banner') }} {{ titleInfo.titleName.toUpperCase() }}!
        </div>
        <div class="fight-day-info">
          {{ t('game.opponent') }}
          <strong>{{ fightNpc?.name }}</strong>
          · {{ t('game.opponent_lvl') }} {{ fightNpc?.level }}
          · HP {{ fightNpc?.maxHp }}
          · STR {{ fightNpc?.effectiveStrength }}
        </div>
      </div>
      <!-- Lore NPC -->
      <div v-if="npcLore" class="lore-box" v-html="npcLore"></div>
      <button class="btn btn-primary" @click="startBattle">{{ t('game.enter_ring') }}</button>
    </div>

    <!-- AKCJE DNIA -->
    <div v-else>
      <p class="action-question">{{ t('game.action_question') }}</p>

      <button
        class="btn btn-primary"
        :disabled="gs.player.currentEnergy < 10"
        @click="doAction('train')"
      >{{ t('game.train') }}</button>

      <button class="btn btn-dark" @click="doAction('walk')">
        {{ t('game.walk') }}
      </button>

      <button
        class="btn btn-teal"
        :disabled="gs.regenUsedToday"
        @click="doAction('rest')"
      >
        {{ gs.regenUsedToday ? t('game.rest_used') : t('game.rest') }}
      </button>
    </div>

    <!-- LOG WYDARZEŃ -->
    <p class="section-label">{{ t('hud.log_title') }}</p>
    <div class="journal">
      <div v-for="(entry, i) in gs.journal.slice(0, 50)" :key="i" v-html="entry"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { t } from '../i18n.js'
import HUD from './HUD.vue'

const emit = defineEmits(['battle'])
const gs = inject('gameState')

const fightNpc   = computed(() => gs.isFightDay ? gs.getFightDayNpc() : null)
const titleInfo  = computed(() => gs.isFightDay ? gs.getTitleInfo() : { isTitle: false })
const npcLore    = computed(() => fightNpc.value ? gs.getNpcLore(fightNpc.value.name) : null)
const weeklyEvent = computed(() => gs.pendingWeeklyEvent)

function doAction(action) {
  gs.doAction(action)
  gs.save()
}

function resolveWeeklyEvent(effect) {
  if (effect) {
    if (effect.xp)     gs.player.gainXp(effect.xp).forEach(m => gs.log(m))
    if (effect.hp)     { gs.player.heal(effect.hp); if (effect.hp < 0) gs.player.takeDamage(-effect.hp) }
    if (effect.energy) gs.player.restoreEnergy(effect.energy)
  }
  gs.pendingWeeklyEvent = null
  gs.save()
}

function startBattle() {
  gs.startBattle()
  gs.save()
  emit('battle')
}
</script>

<style scoped>
.fight-day-card { text-align: center; }
.fight-day-title { font-size: 1.3rem; color: #e94560; }
.fight-day-info { font-size: 0.8rem; color: #aaa; margin-top: 4px; }
.title-fight-banner {
  background: #2a1800; color: #f39c12;
  border: 1px solid #f39c12; border-radius: 6px;
  padding: 4px 10px; margin: 6px 0;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem; letter-spacing: 2px;
}
.lore-box {
  background: #0e0e1c; border-left: 3px solid #e94560;
  border-radius: 0 6px 6px 0; padding: 8px 12px;
  margin: 4px 0; font-size: 0.82rem; color: #ccc;
  line-height: 1.7;
}
.action-question { color: #aaa; font-size: 0.82rem; margin: 4px 0; }
.weekly-text { font-size: 0.85rem; color: #ccc; line-height: 1.7; margin: 6px 0; }
.dialogue { color: #fff; font-weight: 600; font-size: 0.88rem; margin: 4px 0; }
</style>
