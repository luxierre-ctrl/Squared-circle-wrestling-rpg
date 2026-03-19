<template>
  <div class="splash">
    <!-- Krok 0: Logo twórcy -->
    <div v-if="step === 0" class="splash-step fade-in">
      <img :src="logoCreator" class="splash-logo-creator" alt="Don Kiepa Games" />
      <p class="splash-presents">{{ t('game.presents') }}</p>
      <button class="btn btn-dark splash-btn" @click="step = 1">{{ t('btn_next', 'Dalej →') }}</button>
    </div>

    <!-- Krok 1: Logo gry + Graj -->
    <div v-else-if="step === 1" class="splash-step fade-in">
      <img :src="logoGame" class="splash-logo-game" alt="Squared Circle Wrestling RPG" />
      <div class="splash-actions">
        <!-- Jeśli jest zapis -->
        <template v-if="hasSave">
          <p class="splash-save-notice">💾 {{ t('game.save_exists') }}</p>
          <button class="btn btn-primary" @click="$emit('done', 'load')">{{ t('game.load_game') }}</button>
          <button class="btn btn-dark"    @click="$emit('done', 'new')">{{ t('game.new_game') }}</button>
        </template>
        <template v-else>
          <button class="btn btn-primary splash-play-btn" @click="$emit('done', 'new')">
            {{ t('game.play') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { t } from '../i18n.js'
import { GameState } from '../game/GameState.js'
import logoCreator from '../assets/logo_creator.png'
import logoGame    from '../assets/logo_game.png'

defineEmits(['done'])

const step = ref(0)
const hasSave = GameState.hasSave()
</script>

<style scoped>
.splash {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #0f0f1a;
  padding: 20px;
}

.splash-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 420px;
}

.splash-logo-creator {
  width: 80%;
  max-width: 360px;
}

.splash-logo-game {
  width: 95%;
  max-width: 440px;
  border-radius: 10px;
}

.splash-presents {
  color: #555;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 6px;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.splash-btn { max-width: 200px; margin-top: 8px; }

.splash-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.splash-play-btn { font-size: 1.1rem; padding: 14px; }

.splash-save-notice {
  color: #4ecdc4;
  font-size: 0.82rem;
  text-align: center;
}
</style>
