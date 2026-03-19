import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './i18n.js'
import { gameState } from './game/GameState.js'

// Wczytaj język z localStorage lub domyślnie 'pl'
const savedLang = localStorage.getItem('sc_language') || 'pl'

setupI18n(savedLang).then(() => {
  const app = createApp(App)
  app.provide('gameState', gameState)
  app.mount('#app')
})
