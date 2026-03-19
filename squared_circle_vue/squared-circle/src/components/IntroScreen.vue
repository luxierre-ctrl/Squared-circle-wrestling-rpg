<template>
  <div class="intro game-container">

    <!-- KROK 0: Noc, park -->
    <div v-if="step === 0" class="scene fade-in">
      <p class="scene-time">{{ t('intro.time') }}</p>
      <div class="scene-text">
        <p>{{ t('intro.scene1_1') }}</p>
        <p>{{ t('intro.scene1_2') }}</p>
        <p>{{ t('intro.scene1_3') }}</p>
        <br/>
        <p><em>{{ t('intro.scene1_4') }}</em></p>
        <br/>
        <p>{{ t('intro.scene1_5') }}</p>
        <p>{{ t('intro.scene1_6') }}</p>
        <br/>
        <p>{{ t('intro.scene1_7') }}</p>
      </div>
      <button class="btn btn-dark" @click="step++">{{ t('intro.btn_next') }}</button>
    </div>

    <!-- KROK 1: Scena -->
    <div v-else-if="step === 1" class="scene fade-in">
      <div class="scene-text">
        <p>{{ t('intro.scene2_1') }}</p>
        <p>{{ t('intro.scene2_2') }}</p>
        <p><em>{{ t('intro.scene2_3') }}</em></p>
        <br/>
        <p>{{ t('intro.scene2_4') }}</p>
        <p>{{ t('intro.scene2_5') }}</p>
        <br/>
        <p>{{ t('intro.scene2_6') }}</p>
      </div>
      <button class="btn btn-primary" @click="step++">{{ t('intro.btn_shout') }}</button>
      <p class="hint">{{ t('intro.btn_shout_hint') }}</p>
    </div>

    <!-- KROK 2: Ucieczka, Kaz wstaje -->
    <div v-else-if="step === 2" class="scene fade-in">
      <div class="scene-text">
        <p>{{ t('intro.scene3_1') }}</p>
        <p>{{ t('intro.scene3_2') }}</p>
        <p>{{ t('intro.scene3_3') }}</p>
        <br/>
        <p>{{ t('intro.scene3_4') }}</p>
        <br/>
        <p>{{ t('intro.scene3_5') }}</p>
        <br/>
        <p>{{ t('intro.scene3_6') }}</p>
        <p>{{ t('intro.scene3_7') }}</p>
        <p>{{ t('intro.scene3_8') }}</p>
        <br/>
        <p class="dialogue">{{ t('intro.kaz_line1') }}</p>
      </div>
      <button class="btn btn-dark" @click="step++">{{ t('intro.btn_help') }}</button>
    </div>

    <!-- KROK 3: Pytanie o strach -->
    <div v-else-if="step === 3" class="scene fade-in">
      <div class="scene-text">
        <p class="dialogue">{{ t('intro.fear_question') }}</p>
      </div>
      <div class="choices">
        <button class="btn btn-dark" @click="chooseFear('A')">{{ t('intro.fear_a') }}</button>
        <button class="btn btn-dark" @click="chooseFear('B')">{{ t('intro.fear_b') }}</button>
        <button class="btn btn-dark" @click="chooseFear('C')">{{ t('intro.fear_c') }}</button>
      </div>
    </div>

    <!-- KROK 4: Reakcja Kaza, adres -->
    <div v-else-if="step === 4" class="scene fade-in">
      <div class="scene-text">
        <p v-if="fearChoice === 'A'"><em>{{ t('intro.fear_react_a') }}</em></p>
        <p class="dialogue">
          {{ fearChoice === 'A' ? t('intro.fear_react_a_line') :
             fearChoice === 'B' ? t('intro.fear_react_b_line') :
                                  t('intro.fear_react_c_line') }}
        </p>
        <br/>
        <p class="dialogue">{{ t('intro.kaz_intro') }}</p>
        <br/>
        <p class="dialogue">{{ t('intro.kaz_address') }}</p>
        <br/>
        <p>{{ t('intro.scene4_end1') }}</p>
        <p>{{ t('intro.scene4_end2') }}</p>
        <br/>
        <p>{{ t('intro.scene4_end3') }}</p>
        <p><em>{{ t('intro.scene4_end4') }}</em></p>
      </div>
      <button class="btn btn-dark" @click="step++">{{ t('intro.btn_next_day') }}</button>
    </div>

    <!-- KROK 5: Drzwi piwnicy -->
    <div v-else-if="step === 5" class="scene fade-in">
      <p class="scene-time">{{ t('intro.next_day_time') }}</p>
      <div class="scene-text">
        <p>{{ t('intro.gym_scene1') }}</p>
        <p><strong>{{ t('intro.gym_scene2') }}</strong></p>
        <p><em>{{ t('intro.gym_scene3') }}</em></p>
        <br/>
        <p>{{ t('intro.gym_scene4') }}</p>
        <br/>
        <p>{{ t('intro.gym_scene5') }}</p>
      </div>
      <button class="btn btn-primary" @click="step++">{{ t('intro.btn_enter') }}</button>
    </div>

    <!-- KROK 6: Środek piwnicy + imię -->
    <div v-else-if="step === 6" class="scene fade-in">
      <div class="scene-text">
        <p>{{ t('intro.gym_inside1') }}</p>
        <p>{{ t('intro.gym_inside2') }}</p>
        <p>{{ t('intro.gym_inside3') }}</p>
        <p>{{ t('intro.gym_inside4') }}</p>
        <br/>
        <p class="kaz-name">{{ t('intro.kaz_thought') }}</p>
        <br/>
        <p class="dialogue">{{ t('intro.kaz_surprise') }}</p>
        <p class="dialogue">{{ t('intro.kaz_most_dont') }}</p>
        <br/>
        <p class="dialogue">{{ t('intro.kaz_name_ask') }}</p>
      </div>
      <label class="input-label">{{ t('intro.name_label') }}</label>
      <input
        v-model="playerName"
        class="name-input"
        :placeholder="t('intro.name_placeholder')"
        maxlength="24"
        @keyup.enter="playerName.trim() && step++"
      />
      <button class="btn btn-primary" :disabled="!playerName.trim()" @click="step++">
        {{ t('intro.btn_name_next') }}
      </button>
    </div>

    <!-- KROK 7: Wybór klasy -->
    <div v-else-if="step === 7" class="scene fade-in">
      <div class="scene-text">
        <p class="dialogue">{{ t('intro.kaz_class_ask') }}</p>
      </div>
      <div class="class-grid">
        <button
          v-for="cls in classes"
          :key="cls.id"
          :class="['btn', selectedClass === cls.id ? 'btn-primary' : 'btn-dark', 'class-btn']"
          @click="selectedClass = cls.id"
        >
          <span class="class-icon">{{ cls.icon }}</span>
          <span class="class-name">{{ cls.id }}</span>
          <span class="class-stats">{{ cls.stats }}</span>
        </button>
      </div>
      <div v-if="selectedClass" class="scene-text kaz-comment fade-in">
        <p class="dialogue">{{ classComment }}</p>
        <br/>
        <p v-html="classEnter"></p>
      </div>
      <button class="btn btn-primary" @click="step++">{{ t('intro.btn_name_next') }}</button>
    </div>

    <!-- KROK 8: Wybór ruchów -->
    <div v-else-if="step === 8" class="scene fade-in">
      <div class="scene-text">
        <p class="dialogue">{{ t('intro.moves_kaz') }}</p>
        <p class="dialogue">{{ t('intro.moves_kaz2') }}</p>
        <p class="dialogue">{{ t('intro.moves_kaz3') }}</p>
      </div>

      <p class="section-label">{{ t('intro.moves_select') }}</p>
      <div class="moves-list">
        <button
          v-for="move in availableMoves"
          :key="move.id"
          :class="['btn', 'btn-sm', isSelectedMove(move) ? 'btn-teal' : 'btn-dark']"
          :disabled="selectedMoves.length >= 3 && !isSelectedMove(move)"
          @click="toggleMove(move)"
        >
          {{ move.name }} — {{ move.energyCost }}⚡ ×{{ move.damageMultiplier }}
        </button>
      </div>

      <p class="section-label">{{ t('intro.finisher_label') }}</p>
      <div class="moves-list">
        <button
          v-for="fin in availableFinishers"
          :key="fin.id"
          :class="['btn', 'btn-sm', selectedFinisher?.id === fin.id ? 'btn-gold' : 'btn-dark']"
          @click="selectedFinisher = fin"
        >
          💥 {{ fin.name }} — {{ fin.energyCost }}⚡ ×{{ fin.damageMultiplier }}
        </button>
      </div>

      <button
        class="btn btn-primary"
        :disabled="selectedMoves.length !== 3 || !selectedFinisher"
        @click="step++"
      >
        {{ t('intro.btn_confirm_moves') }}
      </button>
    </div>

    <!-- KROK 9: Prezent od trenera -->
    <div v-else-if="step === 9" class="scene fade-in">
      <div class="scene-text">
        <p>{{ t('intro.starter_kaz1') }}</p>
        <p class="dialogue">{{ t('intro.starter_kaz2') }}</p>
        <p class="dialogue">{{ t('intro.starter_kaz3') }}</p>
        <br/>
        <p>{{ t('intro.starter_kaz4') }}</p>
        <p class="dialogue">{{ t('intro.starter_kaz_thanks') }}</p>
        <br/>
        <p><em>{{ t('intro.starter_kaz_note') }}</em></p>
      </div>

      <p class="section-label">{{ t('intro.starter_select') }}</p>
      <div class="starter-grid">
        <button
          v-for="item in starterItems"
          :key="item.id"
          class="btn btn-dark starter-btn"
          @click="selectStarter(item)"
        >
          <strong>{{ item.name }}</strong>
          <span class="starter-desc">{{ item.description }}</span>
          <span class="starter-bonus">{{ item.bonuses.toString() }}</span>
        </button>
      </div>
    </div>

    <!-- KROK 10: Finale -->
    <div v-else-if="step === 10" class="scene fade-in">
      <div class="scene-text">
        <p>{{ t('intro.finale1') }}</p>
        <p>{{ t('intro.finale2') }}</p>
        <br/>
        <p><strong>{{ t('intro.finale3') }}</strong></p>
        <br/>
        <p><em>{{ t('intro.finale4') }}</em></p>
      </div>
      <div class="chapter-title">
        <p class="bebas chapter-num">{{ t('intro.chapter1_title') }}</p>
        <p class="chapter-sub">{{ t('intro.chapter1_subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="startGame">{{ t('intro.btn_start') }}</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { t } from '../i18n.js'
import { createWrestler } from '../game/Character.js'
import { MOVES_CATALOGUE, FINISHER_CATALOGUE } from '../game/Skills.js'
import { STARTER_ITEMS } from '../game/Items.js'

const emit = defineEmits(['done'])
const gs = inject('gameState')

const step = ref(0)
const fearChoice = ref(null)
const playerName = ref('')
const selectedClass = ref('Powerhouse')
const selectedMoves = ref([])
const selectedFinisher = ref(null)

const classes = [
  { id: 'Powerhouse', icon: '🏋️', stats: 'STR 16 · DEX 6 · HP 135 · En 80' },
  { id: 'HighFlyer',  icon: '🦅', stats: 'STR 14 · DEX 18 · HP 108 · En 120' },
  { id: 'Technician', icon: '🎓', stats: 'STR 15 · DEX 15 · HP 125 · En 100' },
]

const classComments = {
  Powerhouse: 'intro.class_comment_power',
  HighFlyer:  'intro.class_comment_high',
  Technician: 'intro.class_comment_tech',
}
const classEnters = {
  Powerhouse: 'intro.class_enter_power',
  HighFlyer:  'intro.class_enter_high',
  Technician: 'intro.class_enter_tech',
}

const classComment = computed(() => t(classComments[selectedClass.value] ?? ''))
const classEnter   = computed(() => t(classEnters[selectedClass.value] ?? ''))

const availableMoves    = computed(() => MOVES_CATALOGUE[selectedClass.value] ?? [])
const availableFinishers = computed(() => FINISHER_CATALOGUE[selectedClass.value] ?? [])
const starterItems = STARTER_ITEMS

function chooseFear(choice) {
  fearChoice.value = choice
  step.value++
}

function isSelectedMove(move) {
  return selectedMoves.value.some(m => m.id === move.id)
}

function toggleMove(move) {
  if (isSelectedMove(move)) {
    selectedMoves.value = selectedMoves.value.filter(m => m.id !== move.id)
  } else if (selectedMoves.value.length < 3) {
    selectedMoves.value.push(move)
  }
}

function selectStarter(item) {
  // Utwórz gracza i skonfiguruj
  const player = createWrestler(selectedClass.value, playerName.value.trim())
  player.moves    = [...selectedMoves.value]
  player.finisher = selectedFinisher.value
  player.addToInventory(item)
  player.equip(item)
  player.restoreToFull()

  gs.player = player
  gs.log(`🎉 ${player.name} [${player.characterClass}] wchodzi do gry!`)
  gs.log(`💪 Ruchy: ${player.moves.map(m => m.name).join(', ')}`)
  gs.log(`💥 Koronny cios: ${player.finisher.name}`)
  gs.log(`🎁 Kaz wręczył: ${item.name}`)
  gs.log('📍 Radom. Żelazna Piwnica. Dzień pierwszy.')

  gs.save()
  step.value++
}

function startGame() {
  gs.phase = 'game'
  gs.save()
  emit('done')
}
</script>

<style scoped>
.intro { padding-top: 16px; }

.scene {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 80vh;
  justify-content: center;
  padding: 8px 0;
}

.scene-time {
  color: #e94560;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 0.9rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.scene-text {
  background: #0a0a14;
  border: 1px solid #1e1e2e;
  border-radius: 8px;
  padding: 16px;
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.8;
}
.scene-text p { margin-bottom: 2px; }

.dialogue {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.kaz-name {
  color: #e94560;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.2rem;
  letter-spacing: 2px;
}

.hint { color: #555; font-size: 0.72rem; text-align: center; }

.choices { display: flex; flex-direction: column; gap: 6px; }

.input-label { color: #888; font-size: 0.78rem; }
.name-input {
  width: 100%;
  padding: 10px 12px;
  background: #1a1a2e;
  border: 1px solid #2a2a3e;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-family: 'Barlow', sans-serif;
  outline: none;
}
.name-input:focus { border-color: #e94560; }

.class-grid { display: flex; flex-direction: column; gap: 6px; }
.class-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  padding: 10px 14px;
}
.class-icon { font-size: 1.4rem; flex-shrink: 0; }
.class-name { font-weight: 700; font-size: 0.9rem; flex: 1; }
.class-stats { font-size: 0.65rem; color: #888; white-space: nowrap; }

.kaz-comment { margin-top: 4px; }

.moves-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }

.starter-grid { display: flex; flex-direction: column; gap: 6px; }
.starter-btn {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
  padding: 10px 14px;
}
.starter-desc { font-size: 0.72rem; color: #888; font-weight: 400; }
.starter-bonus { font-size: 0.72rem; color: #4ecdc4; font-weight: 700; }

.chapter-title {
  text-align: center;
  padding: 16px 0 8px;
}
.chapter-num {
  font-size: 2rem;
  color: #e94560;
  letter-spacing: 4px;
}
.chapter-sub {
  color: #666;
  font-size: 0.8rem;
  letter-spacing: 3px;
  text-transform: uppercase;
}
</style>
