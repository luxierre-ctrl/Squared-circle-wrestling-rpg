/**
 * GameState.js
 * Centralny manager stanu gry + zapis/odczyt z localStorage.
 * Squared Circle Wrestling RPG
 */

import { Wrestler } from './Character.js'
import { buildNpcRoster, pickNpc, checkTitleFight, NPC_LORE } from './NPCs.js'
import { CombatState } from './Combat.js'
import { ALL_LOOTABLE_ITEMS, findItemById, CHAMPIONSHIPS } from './Items.js'

const SAVE_KEY = 'squared_circle_save_v1'

// ─────────────────────────────────────────────────────────────────────────────
// WEEKLY EVENTS – losowe zdarzenia tygodniowe
// ─────────────────────────────────────────────────────────────────────────────

const WEEKLY_EVENTS_CH1 = [
  {
    id: 'kaz_tip_strength',
    text: 'Kaz zatrzymuje cię przy wyjściu.<br><i>– Siła to nie wszystko. Ale bez siły to wszystko nic.</i>',
    effect: null,
  },
  {
    id: 'sparring_offer',
    text: 'Inny uczeń podchodzi z propozycją.<br><i>– Hej, może sparring? Muszę potrenować rzuty.</i>',
    choices: [
      { label: 'Przyjmij (+20 XP, -15 HP)', effect: { xp: 20, hp: -15 } },
      { label: 'Odmów',                     effect: null },
    ],
  },
  {
    id: 'kaz_observation',
    text: 'Kaz obserwuje twój trening przez chwilę.<br><i>– Widziałem gorszych. Ale nie wielu lepszych na twoim etapie.</i><br>Prawie komplement.',
    effect: null,
  },
  {
    id: 'found_old_tape',
    text: 'W szatni znajdujesz starą kasetę VHS. Na etykiecie: <b>"KAZ vs DESTRUKTOR – 1998"</b>.<br>Oglądasz przez noc. Uczysz się czegoś nowego.',
    effect: { xp: 30 },
  },
  {
    id: 'injury_scare',
    text: 'Podczas treningu skręcasz nadgarstek.<br><i>– Nic poważnego – mówi Kaz. – Ale uważaj.</i>',
    effect: { hp: -20 },
  },
]

const WEEKLY_EVENTS_CH2 = [
  {
    id: 'bozena_gossip',
    text: 'Bożena podchodzi konspiracyjnie.<br><i>– Słyszałam że Destruktor Marek pyta o ciebie. To chyba dobrze? Chyba.</i>',
    effect: null,
  },
  {
    id: 'fan_meeting',
    text: 'Po walce podchodzi kibic.<br><i>– Oglądałem cię od początku. Naprawdę robisz postępy.</i><br>Motywacja wzrasta.',
    effect: { energy: 20 },
  },
  {
    id: 'rival_taunt',
    text: 'W szatni jeden z zawodników zaczepia cię.<br><i>– Myślisz że masz u nas co szukać? Wróć do szkoły.</i><br>Denerwujesz się ale milczysz.',
    effect: null,
    choices: [
      { label: 'Odpowiedz (+reputacja, -5 HP)', effect: { hp: -5, xp: 15 } },
      { label: 'Zignoruj (spokojna głowa)',      effect: null },
    ],
  },
  {
    id: 'training_bonus',
    text: 'Kaz dzwoni wieczorem.<br><i>– Jutro dodatkowy trening. Szósta rano. Nie spóźnij się.</i><br>Ciężka sesja. Ale warto.',
    effect: { xp: 50, hp: -30 },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TRAINER QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export const TRAINER_QUOTES = [
  'Kaz patrzy jak ćwiczysz. Nic nie mówi. To dobry znak.',
  '– Jeszcze raz – warczy Kaz. – Jakbyś robił to po raz pierwszy.',
  '– Nieźle – mówi Kaz i odchodzi. Pochwała od Kaza to jak Oscar.',
  'Kaz rzuca ci ręcznik. – Woda. Nie zdychaj mi tu.',
  '– Widziałem gorszych – mówi Kaz. – Ale nie wielu.',
  '– Ból to informacja – mówi Kaz. – Słuchaj jej, ale nie słuchaj za długo.',
  '– Nikt nie pamięta drugiego miejsca – warczy Kaz. – Trenuj mocniej.',
  'Kaz poprawia twój uchwyt bez słowa. Potem kiwa głową. To jego wersja komplementu.',
]

// ─────────────────────────────────────────────────────────────────────────────
// GAME STATE
// ─────────────────────────────────────────────────────────────────────────────

export class GameState {
  constructor() {
    this.player = null          // Wrestler
    this.day = 1
    this.chapter = 1            // 1 | 2
    this.schoolWins = 0
    this.federationWins = 0
    this.journal = []           // string[] – log wszystkich wydarzeń
    this.lastEvent = ''         // ostatnie ważne wydarzenie (do paska)
    this.npcRoster = buildNpcRoster()
    this.currentNpc = null      // Wrestler – aktualny rywal
    this.combat = null          // CombatState | null
    this.offeredChapter2 = false
    this.chapter2DeclinedDay = -99
    this.fightDayNpc = null
    this.fightDayNpcDay = -1
    this.regenUsedToday = false
    this.trainCount = 0
    this.language = 'pl'        // 'pl' | 'en'
    this.weeklyEventShown = false  // czy event tygodniowy już pokazany
    this.pendingWeeklyEvent = null // { text, choices?, effect? }
    this.phase = 'splash'       // splash | intro | game | battle
    this.introStep = 0
    this.introFearChoice = null
    this.playerNameInput = ''
    this.selectedClass = 'Powerhouse'
  }

  // ── Journal ────────────────────────────────────────────────────────────────

  log(msg) {
    this.journal.unshift(msg)
    if (this.journal.length > 100) this.journal.pop()

    // Ważne do paska
    const importantEmojis = ['🏆', '⭐', '💥', '🎁', '🥊', '💀', '📖', '🏅', '🎺']
    if (importantEmojis.some(e => msg.includes(e))) {
      this.lastEvent = msg.replace(/<[^>]+>/g, '').trim()
    }
  }

  // ── Dzienna logika ────────────────────────────────────────────────────────

  get isFightDay() { return this.day % 7 === 0 }

  /**
   * Wykonaj akcję dnia.
   * @param {'train'|'walk'|'rest'} action
   * @returns {{ ok: boolean, logs: string[] }}
   */
  doAction(action) {
    if (!this.player) return { ok: false, logs: ['Brak gracza!'] }

    this.regenUsedToday = action === 'rest' ? true : this.regenUsedToday

    let result
    if (action === 'train') {
      result = this.player.train()
    } else if (action === 'walk') {
      result = this.player.walk(ALL_LOOTABLE_ITEMS)
    } else if (action === 'rest') {
      result = this.player.regenerate(this.regenUsedToday && action === 'rest')
    }

    if (result.ok) {
      result.logs.forEach(l => this.log(l))

      // Losowy cytat Kaza co 2 treningi
      if (action === 'train') {
        this.trainCount++
        if (this.trainCount % 2 === 0) {
          const quote = TRAINER_QUOTES[Math.floor(Math.random() * TRAINER_QUOTES.length)]
          this.log(`💬 ${quote}`)
        }
      }

      this._advanceDay()
    } else {
      result.logs.forEach(l => this.log(l))
    }

    return result
  }

  _advanceDay() {
    this.day++
    this.regenUsedToday = false
    this.weeklyEventShown = false

    // Tygodniowy event (co 3-4 dni, nie w dzień walki)
    if (!this.isFightDay && Math.random() < 0.35 && !this.weeklyEventShown) {
      const pool = this.chapter === 1 ? WEEKLY_EVENTS_CH1 : WEEKLY_EVENTS_CH2
      this.pendingWeeklyEvent = pool[Math.floor(Math.random() * pool.length)]
      this.weeklyEventShown = true
    }
  }

  // ── Walka ─────────────────────────────────────────────────────────────────

  /**
   * Pobierz/zapamiętaj rywala na dzień walki.
   * @returns {Wrestler}
   */
  getFightDayNpc() {
    if (this.fightDayNpcDay !== this.day || !this.fightDayNpc) {
      this.fightDayNpc = pickNpc(
        this.npcRoster, this.chapter,
        this.schoolWins, this.federationWins,
        this.player.level
      )
      this.fightDayNpcDay = this.day
    }
    return this.fightDayNpc
  }

  /**
   * Sprawdź czy walka jest o pas.
   */
  getTitleInfo() {
    return checkTitleFight(
      this.chapter,
      this.federationWins,
      this.player.equipped.championship
    )
  }

  /**
   * Rozpocznij walkę.
   * @returns {CombatState}
   */
  startBattle() {
    const npc = this.getFightDayNpc()
    const titleInfo = this.getTitleInfo()
    this.combat = new CombatState(this.player, npc, titleInfo)
    this.currentNpc = npc
    this.phase = 'battle'
    return this.combat
  }

  /**
   * Obsłuż wynik walki.
   * @param {{ won: boolean, isTitle: boolean, xpReward: number }}
   */
  resolveBattle({ won, isTitle, xpReward }) {
    if (won) {
      if (this.chapter === 1) {
        this.schoolWins++
        this.log(`🏫 Wygrane w szkole: ${this.schoolWins}/5`)
        this._schoolWinDialog()
      } else {
        this.federationWins++
        this.log(`🏟️ Wygrane w federacji: ${this.federationWins}`)
        this._fedWinDialog()
      }

      // Pas mistrzowski
      if (isTitle && this.combat?.titleInfo?.championshipId) {
        const champ = CHAMPIONSHIPS.find(c => c.id === this.combat.titleInfo.championshipId)
        if (champ) {
          const msg = this.player.awardChampionship(champ)
          this.log(msg)
          this.log(`🎊 ${this._championshipStory(champ.id)}`)
        }
      }

      this.log(`🥊 Wygrałeś z ${this.currentNpc?.name}! (+${xpReward} XP)`)
    } else {
      this.log(`💀 Przegrałeś z ${this.currentNpc?.name}...`)
      this.log('💬 Kaz: – Bolało? Dobrze. Zapamiętasz.')
      this.player.restoreToFull()
    }

    this.day++
    this.combat = null
    this.phase = 'game'
  }

  _schoolWinDialog() {
    const dialogs = {
      1: 'Kaz podchodzi. Długa chwila ciszy.<br><i>– Żyjesz. Na dziś wystarczy.</i>',
      3: '<i>– Zaczynasz wyglądać jak zawodnik – mówi Kaz. – Zaczynasz</i> – dodaje szybko.',
      5: 'Kaz siada na krawędzi ringu. Pierwszy raz nie stoi.<br><i>– Nauczyłem cię wszystkiego co mogę nauczyć w piwnicy.</i><br><i>– Jest w Radomiu federacja. Lokalna, mała. Ale prawdziwa.</i>',
    }
    const d = dialogs[this.schoolWins]
    if (d) this.log(`📖 ${d}`)
  }

  _fedWinDialog() {
    const dialogs = {
      1: 'Bożena klaszcze raz, ceremonialnie. <i>– Witamy w tabeli wyników, skarbie.</i>',
      3: 'Bożena wychodzi zza biurka.<br><i>– Kaz dzwonił. Pytał jak ci idzie. Powiedziałam że nieźle.</i><br><i>– \'Nieźle to za mało\' – odpowiedział.</i>',
      7: 'W szatni czekasz sam. Wchodzi Destruktor Marek.<br><i>– Kaz cię trenował. Mnie też. Dawno temu.</i><br><i>– Przyjedź do Warszawy jak skończysz tu robotę.</i>',
    }
    const d = dialogs[this.federationWins]
    if (d) this.log(`📖 ${d}`)
  }

  _championshipStory(id) {
    const stories = {
      local_championship: 'Ring. Kilkaset osób krzyczy. Sędzia unosi twoją rękę. W pierwszym rzędzie siedzi Kaz. Nie klaszcze. Ale kiwa głową.',
      national_championship: 'Światła. Hałas. Pas ląduje na twoich ramionach. Droga na szczyt właśnie się zaczęła.',
    }
    return stories[id] ?? 'Zdobyłeś pas!'
  }

  // ── Przejście do federacji ────────────────────────────────────────────────

  get canOfferChapter2() {
    return (
      !this.offeredChapter2 &&
      this.chapter === 1 &&
      this.schoolWins >= 5 &&
      this.player?.level >= 3 &&
      (this.day - this.chapter2DeclinedDay) >= 7
    )
  }

  acceptChapter2() {
    this.chapter = 2
    this.offeredChapter2 = true
    this.log('🏟️ Rozdział II – Radom Wrestling League!')
    this.log('Bożena: <i>– Wypełnij, podpisz, nie czytaj małego druku. Nikt nie czyta.</i>')
  }

  declineChapter2() {
    this.chapter2DeclinedDay = this.day
  }

  // ── Zapis / odczyt ────────────────────────────────────────────────────────

  /**
   * Zapisz stan gry do localStorage.
   */
  save() {
    try {
      const data = {
        version: 1,
        player: this.player?.toJSON() ?? null,
        day: this.day,
        chapter: this.chapter,
        schoolWins: this.schoolWins,
        federationWins: this.federationWins,
        journal: this.journal.slice(0, 80),
        lastEvent: this.lastEvent,
        offeredChapter2: this.offeredChapter2,
        chapter2DeclinedDay: this.chapter2DeclinedDay,
        regenUsedToday: this.regenUsedToday,
        trainCount: this.trainCount,
        language: this.language,
        phase: this.phase === 'battle' ? 'game' : this.phase, // walka nie jest zapisywana w połowie
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Błąd zapisu:', e)
      return false
    }
  }

  /**
   * Wczytaj stan gry z localStorage.
   * @returns {boolean}
   */
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return false

      const data = JSON.parse(raw)
      if (data.version !== 1) return false

      this.player = data.player ? Wrestler.fromJSON(data.player) : null
      this.day = data.day ?? 1
      this.chapter = data.chapter ?? 1
      this.schoolWins = data.schoolWins ?? 0
      this.federationWins = data.federationWins ?? 0
      this.journal = data.journal ?? []
      this.lastEvent = data.lastEvent ?? ''
      this.offeredChapter2 = data.offeredChapter2 ?? false
      this.chapter2DeclinedDay = data.chapter2DeclinedDay ?? -99
      this.regenUsedToday = data.regenUsedToday ?? false
      this.trainCount = data.trainCount ?? 0
      this.language = data.language ?? 'pl'
      this.phase = data.phase ?? 'game'

      return !!this.player
    } catch (e) {
      console.error('Błąd wczytywania:', e)
      return false
    }
  }

  /**
   * Sprawdź czy istnieje zapis.
   */
  static hasSave() {
    return !!localStorage.getItem(SAVE_KEY)
  }

  /**
   * Usuń zapis.
   */
  static deleteSave() {
    localStorage.removeItem(SAVE_KEY)
  }

  /**
   * Lore NPC dla aktualnego rywala.
   */
  getNpcLore(npcName) {
    return NPC_LORE[npcName] ?? null
  }
}

// Singleton eksportowany dla Vue
export const gameState = new GameState()
