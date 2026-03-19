/**
 * Combat.js
 * Silnik walki turowej – obsługuje jedną walkę od początku do końca.
 * Squared Circle Wrestling RPG
 */

import { npcChooseAction } from './NPCs.js'

// ─────────────────────────────────────────────────────────────────────────────
// COMBAT STATE
// ─────────────────────────────────────────────────────────────────────────────

export class CombatState {
  /**
   * @param {import('./Character').Wrestler} player
   * @param {import('./Character').Wrestler} npc
   * @param {{ isTitle: boolean, titleName: string }} titleInfo
   */
  constructor(player, npc, titleInfo = { isTitle: false, titleName: '' }) {
    this.player = player
    this.npc = npc
    this.titleInfo = titleInfo

    this.log = []           // string[] – pełny log walki
    this.turn = 0
    this.over = false
    this.playerWon = null   // true | false | null

    this.npcAdrenalineStreak = 0

    // Przygotowanie
    npc.restoreToFull()
    // Gracz NIE jest regenerowany – idzie z tym co ma

    this._addLog(`🎺 ${player.name} vs ${npc.name} [Lvl ${npc.level}]`)
    if (titleInfo.isTitle) {
      this._addLog(`🏆 WALKA O ${titleInfo.titleName.toUpperCase()}!`)
    }
    this._addLog(`Rywal: HP ${npc.currentHp} | Siła ${npc.effectiveStrength} | En ${npc.currentEnergy}`)
  }

  _addLog(msg) {
    this.log.push(msg)
  }

  // ── Akcje gracza ──────────────────────────────────────────────────────────

  /**
   * Gracz używa ruchu.
   * @param {import('./Skills').ActiveSkill} skill
   * @returns {{ logs: string[], combatOver: boolean }}
   */
  playerUseSkill(skill) {
    if (this.over) return { logs: ['Walka już się skończyła!'], combatOver: true }

    this.turn++
    const result = skill.use(this.player, this.npc)
    this._addLog(result.log)

    if (!result.success) {
      return { logs: [result.log], combatOver: false }
    }

    if (!this.npc.isAlive) {
      return this._resolveWin()
    }

    return this._npcTurn()
  }

  /**
   * Gracz używa adrenaliny.
   * @returns {{ logs: string[], combatOver: boolean }}
   */
  playerAdrenaline() {
    if (this.over) return { logs: ['Walka już się skończyła!'], combatOver: true }

    this.turn++
    const msg = this.player.adrenalineRush()
    this._addLog(msg)

    return this._npcTurn()
  }

  // ── Tura NPC ──────────────────────────────────────────────────────────────

  _npcTurn() {
    const { action, skill } = npcChooseAction(this.npc, this.player, this.npcAdrenalineStreak)

    if (action === 'adrenaline') {
      this.npc.heal(30)
      this.npc.restoreEnergy(25)
      this.npcAdrenalineStreak++
      this._addLog(`[${this.npc.name}] ⚡ Adrenalina! +30 HP, +25 En (${this.npc.currentHp}/${this.npc.maxHp} HP)`)
    } else {
      this.npcAdrenalineStreak = 0
      const result = skill.use(this.npc, this.player)
      this._addLog(`[${this.npc.name}] ${result.log}`)
    }

    if (!this.player.isAlive) {
      return this._resolveLoss()
    }

    return { logs: this._lastLogs(), combatOver: false }
  }

  // ── Rozwiązanie walki ─────────────────────────────────────────────────────

  _resolveWin() {
    this.over = true
    this.playerWon = true
    this.player.wins++

    const xpReward = 70 + this.npc.level * 15
    const xpLogs = this.player.gainXp(xpReward)

    const msgs = [
      `🏆 ${this.player.name} WYGRYWA!`,
      `+${xpReward} XP`,
      ...xpLogs,
    ]

    if (this.titleInfo.isTitle) {
      msgs.push(`🎺 NOWY MISTRZ! ${this.player.name} zdobywa ${this.titleInfo.titleName}!`)
    }

    msgs.forEach(m => this._addLog(m))
    return { logs: this._lastLogs(), combatOver: true, won: true, xpReward, isTitle: this.titleInfo.isTitle }
  }

  _resolveLoss() {
    this.over = true
    this.playerWon = false
    this.player.losses++

    const msgs = [
      `💀 ${this.player.name} przegrywa...`,
      'Kaz: – Bolało? Dobrze. Zapamiętasz.',
    ]
    msgs.forEach(m => this._addLog(m))
    return { logs: this._lastLogs(), combatOver: true, won: false }
  }

  _lastLogs(n = 5) {
    return this.log.slice(-n)
  }

  // ── Gettery pomocnicze ────────────────────────────────────────────────────

  get finisherAvailable() {
    const fin = this.player.finisher
    if (!fin) return false
    return this.npc.hpPercentage < 35 && this.player.currentEnergy >= fin.energyCost
  }

  get recentLog() {
    return this.log.slice(-20)
  }

  // ── Serializacja (zapis w trakcie walki) ──────────────────────────────────

  toJSON() {
    return {
      log: this.log,
      turn: this.turn,
      over: this.over,
      playerWon: this.playerWon,
      npcAdrenalineStreak: this.npcAdrenalineStreak,
      titleInfo: this.titleInfo,
      npcId: this.npc.name,
    }
  }
}
