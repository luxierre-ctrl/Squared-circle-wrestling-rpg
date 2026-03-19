/**
 * Character.js
 * System postaci: klasa bazowa Wrestler + Powerhouse, HighFlyer, Technician.
 * Squared Circle Wrestling RPG
 */

import { StatBonus, findItemById, CHAMPIONSHIPS } from './Items.js'
import { PASSIVE_SKILLS, findSkillById } from './Skills.js'

// ─────────────────────────────────────────────────────────────────────────────
// XP THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────

export const XP_THRESHOLDS = [0, 150, 380, 700, 1150, 1800, 2700, 3800, 5200, 6800]

// ─────────────────────────────────────────────────────────────────────────────
// BASE WRESTLER CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class Wrestler {
  /**
   * @param {string} name
   * @param {number} baseStrength
   * @param {number} baseDexterity
   * @param {number} baseHp
   * @param {number} baseEnergy
   */
  constructor(name, baseStrength, baseDexterity, baseHp, baseEnergy) {
    this.name = name
    this._baseStrength = baseStrength
    this._baseDexterity = baseDexterity
    this._baseHp = baseHp
    this._baseEnergy = baseEnergy

    this.level = 1
    this.xp = 0

    // Ekwipunek – słoty
    this.equipped = { outfit: null, gadget: null, protector: null, championship: null }

    // Torba
    this.inventory = []

    // Ruchy
    this.moves = []        // ActiveSkill[]
    this.finisher = null   // ActiveSkill

    // Stan walki
    this._currentHp = this.maxHp
    this._currentEnergy = this.maxEnergy

    // Statystyki gry
    this.wins = 0
    this.losses = 0
  }

  // ── Klasa (nadpisywana przez podklasy) ──────────────────────────────────────

  get characterClass() { return 'Wrestler' }

  get levelUpBonus() {
    return new StatBonus({ strength: 2, dexterity: 2, hp: 10, energy: 4 })
  }

  // ── Pasywna umiejętność ────────────────────────────────────────────────────

  get passiveSkill() {
    return PASSIVE_SKILLS[this.characterClass]
  }

  // ── Bonusy z ekwipunku ────────────────────────────────────────────────────

  get itemBonuses() {
    return Object.values(this.equipped)
      .filter(Boolean)
      .reduce((acc, item) => acc.add(item.bonuses), new StatBonus())
  }

  // ── Bonusy z poziomów ────────────────────────────────────────────────────

  get levelBonuses() {
    const b = this.levelUpBonus
    const gained = this.level - 1
    return new StatBonus({
      strength:  b.strength  * gained,
      dexterity: b.dexterity * gained,
      hp:        b.hp        * gained,
      energy:    b.energy    * gained,
    })
  }

  // ── Efektywne statystyki ──────────────────────────────────────────────────

  get effectiveStrength() {
    const p = this.passiveSkill
    const ib = this.itemBonuses
    const lb = this.levelBonuses
    return this._baseStrength + ib.strength + lb.strength + p.strengthBonus
  }

  get effectiveDexterity() {
    const p = this.passiveSkill
    const ib = this.itemBonuses
    const lb = this.levelBonuses
    return this._baseDexterity + ib.dexterity + lb.dexterity + p.dexterityBonus
  }

  get maxHp() {
    const p = this.passiveSkill
    const ib = this.itemBonuses
    const lb = this.levelBonuses
    const base = this._baseHp + ib.hp + lb.hp
    return Math.floor(base * (1 + p.hpBonusPct / 100))
  }

  get maxEnergy() {
    const p = this.passiveSkill
    const ib = this.itemBonuses
    const lb = this.levelBonuses
    const base = this._baseEnergy + ib.energy + lb.energy
    return Math.floor(base * (1 + p.energyBonusPct / 100))
  }

  // ── Aktualny stan walki ───────────────────────────────────────────────────

  get currentHp() { return this._currentHp }
  set currentHp(val) { this._currentHp = Math.max(0, Math.min(val, this.maxHp)) }

  get currentEnergy() { return this._currentEnergy }
  set currentEnergy(val) { this._currentEnergy = Math.max(0, Math.min(val, this.maxEnergy)) }

  get hpPercentage() { return this.maxHp > 0 ? (this._currentHp / this.maxHp) * 100 : 0 }

  get isAlive() { return this._currentHp > 0 }

  get xpToNextLevel() {
    if (this.level >= XP_THRESHOLDS.length) return 9999
    return XP_THRESHOLDS[this.level] - this.xp
  }

  // ── Akcje walki ───────────────────────────────────────────────────────────

  takeDamage(amount) {
    this._currentHp = Math.max(0, this._currentHp - Math.max(0, amount))
  }

  spendEnergy(amount) {
    this._currentEnergy = Math.max(0, this._currentEnergy - amount)
  }

  heal(amount) {
    this._currentHp = Math.min(this._currentHp + amount, this.maxHp)
  }

  restoreEnergy(amount) {
    this._currentEnergy = Math.min(this._currentEnergy + amount, this.maxEnergy)
  }

  restoreToFull() {
    this._currentHp = this.maxHp
    this._currentEnergy = this.maxEnergy
  }

  /**
   * Adrenalina: +30 HP, +25 En.
   * @returns {string} log
   */
  adrenalineRush() {
    this.heal(30)
    this.restoreEnergy(25)
    return `⚡ ADRENALINA! ${this.name} czerpie z rezerw! +30 HP, +25 En. (${this._currentHp}/${this.maxHp} HP)`
  }

  // ── XP i leveling ────────────────────────────────────────────────────────

  /**
   * Zdobądź XP, obsłuż level-upy.
   * @param {number} amount
   * @returns {string[]} logi
   */
  gainXp(amount) {
    this.xp += amount
    const logs = [`🏅 +${amount} XP! (łącznie: ${this.xp})`]

    while (this.level < XP_THRESHOLDS.length && this.xp >= XP_THRESHOLDS[this.level]) {
      this.level++
      this.restoreToFull()
      logs.push(`⭐ LEVEL UP! Osiągnąłeś poziom ${this.level}! HP i energia uzupełnione.`)
    }

    return logs
  }

  // ── Ekwipunek ─────────────────────────────────────────────────────────────

  /**
   * Załóż przedmiot.
   * @param {import('./Items').Item} item
   * @returns {{ ok: boolean, message: string }}
   */
  equip(item) {
    const check = item.checkRequirements(this.level)
    if (!check.ok) return { ok: false, message: check.reason }

    this.equipped[item.slot] = item
    // Clamp current values to new max
    this._currentHp = Math.min(this._currentHp, this.maxHp)
    this._currentEnergy = Math.min(this._currentEnergy, this.maxEnergy)
    return { ok: true, message: `✅ Założono: ${item.name}` }
  }

  /**
   * Zdejmij przedmiot ze slotu.
   * @param {string} slot
   * @returns {string} log
   */
  unequip(slot) {
    const item = this.equipped[slot]
    if (!item) return `Slot '${slot}' jest pusty.`
    this.equipped[slot] = null
    this._currentHp = Math.min(this._currentHp, this.maxHp)
    this._currentEnergy = Math.min(this._currentEnergy, this.maxEnergy)
    return `🔄 Zdjęto: ${item.name}`
  }

  addToInventory(item) { this.inventory.push(item) }

  /**
   * Przyznaj pas mistrzowski.
   * @param {import('./Items').Item} championship
   * @returns {string}
   */
  awardChampionship(championship) {
    this.equipped.championship = championship
    return `🏆 ${this.name} ZDOBYWA ${championship.name.toUpperCase()}!`
  }

  // ── Akcje dzienne ─────────────────────────────────────────────────────────

  /**
   * Trening: +70 XP, -25 HP, -10 En.
   * Zablokowany gdy energia < 10.
   * @returns {{ ok: boolean, logs: string[] }}
   */
  train() {
    if (this._currentEnergy < 10) {
      return { ok: false, logs: ['❌ Za mało energii na trening! (wymagane min. 10)'] }
    }
    this._currentHp = Math.max(0, this._currentHp - 25)
    this._currentEnergy = Math.max(0, this._currentEnergy - 10)
    const xpLogs = this.gainXp(70)
    return { ok: true, logs: ['🏋️ Trening ukończony! -25 HP, -10 Energii', ...xpLogs] }
  }

  /**
   * Spacer: szansa na przedmiot (45%), -5 En.
   * @param {import('./Items').Item[]} lootPool - dostępne przedmioty (filtrowane po levelu)
   * @returns {{ ok: boolean, logs: string[], foundItem: Item|null }}
   */
  walk(lootPool) {
    const eligible = lootPool.filter(i => i.requiredLevel <= this.level)
    let foundItem = null
    const logs = ['🚶 Spacer po okolicach...']

    if (eligible.length > 0 && Math.random() < 0.45) {
      foundItem = eligible[Math.floor(Math.random() * eligible.length)]
      this.inventory.push(foundItem)
      logs.push(`🎁 Znaleziono: ${foundItem.name}! (${foundItem.slotLabel})`)
    } else {
      logs.push('Nic ciekawego się nie wydarzyło.')
    }

    this._currentEnergy = Math.max(0, this._currentEnergy - 5)
    logs.push('🚶 Spacer: -5 Energii')
    return { ok: true, logs, foundItem }
  }

  /**
   * Regeneracja: +30 HP, +10 En (max 1 raz dziennie).
   * @param {boolean} alreadyUsedToday
   * @returns {{ ok: boolean, logs: string[] }}
   */
  regenerate(alreadyUsedToday = false) {
    if (alreadyUsedToday) {
      return { ok: false, logs: ['❌ Już odpoczywałeś dzisiaj!'] }
    }
    const hpBefore = this._currentHp
    const enBefore = this._currentEnergy
    this.heal(30)
    this.restoreEnergy(10)
    return {
      ok: true,
      logs: [
        `😴 Regeneracja: +${this._currentHp - hpBefore} HP, +${this._currentEnergy - enBefore} En`,
        `Stan: ${this._currentHp}/${this.maxHp} HP | ${this._currentEnergy}/${this.maxEnergy} En`,
      ]
    }
  }

  // ── Serializacja ──────────────────────────────────────────────────────────

  toJSON() {
    return {
      name: this.name,
      characterClass: this.characterClass,
      level: this.level,
      xp: this.xp,
      currentHp: this._currentHp,
      currentEnergy: this._currentEnergy,
      wins: this.wins,
      losses: this.losses,
      equipped: Object.fromEntries(
        Object.entries(this.equipped).map(([slot, item]) => [slot, item?.toJSON() ?? null])
      ),
      inventory: this.inventory.map(i => i.toJSON()),
      moves: this.moves.map(m => m.toJSON()),
      finisher: this.finisher?.toJSON() ?? null,
    }
  }

  static fromJSON(data) {
    const cls = { Powerhouse, HighFlyer, Technician }[data.characterClass]
    if (!cls) throw new Error(`Nieznana klasa: ${data.characterClass}`)

    const wrestler = new cls(data.name)
    wrestler.level = data.level
    wrestler.xp = data.xp
    wrestler.wins = data.wins ?? 0
    wrestler.losses = data.losses ?? 0

    // Ekwipunek
    for (const [slot, itemData] of Object.entries(data.equipped)) {
      if (itemData) {
        const item = findItemById(itemData.id)
        if (item) wrestler.equipped[slot] = item
      }
    }

    // Torba
    wrestler.inventory = (data.inventory ?? [])
      .map(d => findItemById(d.id))
      .filter(Boolean)

    // Ruchy
    wrestler.moves = (data.moves ?? [])
      .map(m => findSkillById(m.id, data.characterClass))
      .filter(Boolean)

    wrestler.finisher = data.finisher
      ? findSkillById(data.finisher.id, data.characterClass)
      : null

    // Ustaw aktualny stan PO odtworzeniu ekwipunku (żeby maxHp był prawidłowy)
    wrestler._currentHp = Math.min(data.currentHp, wrestler.maxHp)
    wrestler._currentEnergy = Math.min(data.currentEnergy, wrestler.maxEnergy)

    return wrestler
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCRETE CLASSES
// ─────────────────────────────────────────────────────────────────────────────

export class Powerhouse extends Wrestler {
  constructor(name) {
    super(name, 16, 6, 135, 80)
  }
  get characterClass() { return 'Powerhouse' }
  get levelUpBonus() { return new StatBonus({ strength: 3, dexterity: 1, hp: 12, energy: 3 }) }
}

export class HighFlyer extends Wrestler {
  constructor(name) {
    super(name, 14, 18, 108, 120)
  }
  get characterClass() { return 'HighFlyer' }
  get levelUpBonus() { return new StatBonus({ strength: 1, dexterity: 3, hp: 8, energy: 6 }) }
}

export class Technician extends Wrestler {
  constructor(name) {
    super(name, 15, 15, 125, 100)
  }
  get characterClass() { return 'Technician' }
  get levelUpBonus() { return new StatBonus({ strength: 2, dexterity: 2, hp: 10, energy: 4 }) }
}

/**
 * Stwórz instancję postaci na podstawie nazwy klasy.
 * @param {string} className
 * @param {string} name
 * @returns {Wrestler}
 */
export function createWrestler(className, name) {
  const map = { Powerhouse, HighFlyer, Technician }
  const Cls = map[className]
  if (!Cls) throw new Error(`Nieznana klasa: ${className}`)
  return new Cls(name)
}
