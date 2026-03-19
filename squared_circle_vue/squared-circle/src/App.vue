<template>
  <div class="app-shell">
    <SplashScreen v-if="phase === 'splash'" @done="phase = 'lang'" />
    <LangSelect   v-else-if="phase === 'lang'"    @selected="onLangSelected" />
    <IntroScreen  v-else-if="phase === 'intro'"   @done="phase = 'game'" />
    <GameScreen   v-else-if="phase === 'game'"    @battle="phase = 'battle'" />
    <BattleScreen v-else-if="phase === 'battle'"  @done="phase = 'game'" />
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import SplashScreen  from './components/SplashScreen.vue'
import LangSelect    from './components/LangSelect.vue'
import IntroScreen   from './components/IntroScreen.vue'
import GameScreen    from './components/GameScreen.vue'
import BattleScreen  from './components/BattleScreen.vue'
import { changeLanguage } from './i18n.js'
import { GameState }  from './game/GameState.js'

const gs = inject('gameState')
const phase = ref('splash')

onMounted(() => {
  // Sprawdź czy jest zapis
  if (GameState.hasSave()) {
    const loaded = gs.load()
    if (loaded) {
      phase.value = gs.phase ?? 'game'
    }
  }
})

function onLangSelected(lang) {
  changeLanguage(lang)
  localStorage.setItem('sc_language', lang)
  gs.language = lang

  // Sprawdź czy mamy zapis
  if (GameState.hasSave()) {
    const loaded = gs.load()
    phase.value = loaded ? (gs.phase ?? 'game') : 'intro'
  } else {
    phase.value = 'intro'
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  width: 100%;
  height: 100%;
  background: #0f0f1a;
  color: #eee;
  font-family: 'Barlow', sans-serif;
  font-size: 15px;
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

.app-shell {
  width: 100%;
  min-height: 100vh;
  background: #0f0f1a;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Centralny kontener – wąski jak telefon */
.game-container {
  width: 100%;
  max-width: 480px;
  padding: 0 12px 20px;
  flex: 1;
}

/* Bebas Neue dla nagłówków */
.bebas { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1.5px; }

/* Karty */
.card {
  background: #12121f;
  border: 1px solid #2a2a3e;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 6px;
}
.card-gold  { border-color: #f39c12; background: #1a0e00; }
.card-teal  { border-color: #4ecdc4; background: #001a18; }
.card-red   { border-color: #e94560; background: #1a0808; }

/* Etykieta sekcji */
.section-label {
  color: #888;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin: 6px 0 3px;
}

/* Pasek statystyki */
.stat-bar-wrap { display: flex; align-items: center; gap: 5px; margin: 2px 0; }
.stat-bar-label { color: #888; font-size: 0.68rem; width: 20px; flex-shrink: 0; }
.stat-bar-bg { flex: 1; background: #2a2a3a; border-radius: 3px; height: 8px; }
.stat-bar-fg { height: 8px; border-radius: 3px; transition: width 0.3s; }
.stat-bar-value { color: #aaa; font-size: 0.68rem; min-width: 52px; text-align: right; white-space: nowrap; }

/* Przyciski */
.btn {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  background: #12121f;
  color: #eee;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  margin-bottom: 5px;
  transition: opacity 0.15s, transform 0.1s;
  white-space: pre-line;
}
.btn:active { transform: scale(0.98); opacity: 0.85; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-primary  { background: #e94560; border-color: #e94560; color: #fff; }
.btn-gold     { background: #1a0e00; border-color: #f39c12; color: #f39c12; }
.btn-teal     { background: #001a18; border-color: #4ecdc4; color: #4ecdc4; }
.btn-dark     { background: #1a1a2e; border-color: #3a3a5e; color: #ccc; }
.btn-sm { padding: 5px 10px; font-size: 0.75rem; margin-bottom: 3px; }

/* Grid ruchów */
.moves-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin-bottom: 4px; }
.moves-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-bottom: 6px; }

/* Move cell */
.move-cell {
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  border-radius: 6px;
  padding: 6px 4px;
  text-align: center;
}
.move-cell-name { font-size: 0.75rem; color: #ddd; font-weight: 600; line-height: 1.2; }
.move-cell-cost { font-size: 0.62rem; color: #888; margin-top: 2px; }

/* Log wydarzeń */
.journal {
  background: #0a0a14;
  border: 1px solid #1a1a2e;
  border-radius: 8px;
  padding: 8px 10px;
  height: 160px;
  overflow-y: auto;
  font-size: 0.78rem;
  color: #bbb;
  line-height: 1.7;
}
.journal::-webkit-scrollbar { width: 4px; }
.journal::-webkit-scrollbar-track { background: #0a0a14; }
.journal::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }

/* Pasek ostatniego wydarzenia */
.last-event {
  background: #1a1200;
  border: 1px solid #f39c12;
  border-radius: 6px;
  padding: 5px 10px;
  margin: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #f39c12;
  font-weight: 600;
}

/* Nagłówek lokacji */
.location-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0 8px;
  border-bottom: 1px solid #2a2a3e;
  margin-bottom: 6px;
}
.location-logo { height: 32px; width: auto; opacity: 0.9; }

/* Animacje intro */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
.fade-in  { animation: fadeIn  0.6s ease forwards; }
.scale-in { animation: scaleIn 0.8s ease forwards; }
</style>
