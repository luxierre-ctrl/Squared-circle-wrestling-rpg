/**
 * Items.js
 * System przedmiotów: Outfit, Gadget, Protector, Championship.
 * Squared Circle Wrestling RPG
 */

// ─────────────────────────────────────────────────────────────────────────────
// STAT BONUS
// ─────────────────────────────────────────────────────────────────────────────

export class StatBonus {
  constructor({ strength = 0, dexterity = 0, hp = 0, energy = 0 } = {}) {
    this.strength = strength
    this.dexterity = dexterity
    this.hp = hp
    this.energy = energy
  }

  /** Suma dwóch bonusów. */
  add(other) {
    return new StatBonus({
      strength:  this.strength  + other.strength,
      dexterity: this.dexterity + other.dexterity,
      hp:        this.hp        + other.hp,
      energy:    this.energy    + other.energy,
    })
  }

  /** Opis tekstowy bonusów. */
  toString() {
    const parts = []
    if (this.strength)  parts.push(`+${this.strength} STR`)
    if (this.dexterity) parts.push(`+${this.dexterity} DEX`)
    if (this.hp)        parts.push(`+${this.hp} HP`)
    if (this.energy)    parts.push(`+${this.energy} En`)
    return parts.join(', ') || 'brak bonusów'
  }

  toJSON() {
    return { strength: this.strength, dexterity: this.dexterity, hp: this.hp, energy: this.energy }
  }

  static fromJSON(data) {
    return new StatBonus(data ?? {})
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE ITEM
// ─────────────────────────────────────────────────────────────────────────────

export class Item {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} description
   * @param {string} slot         - 'outfit' | 'gadget' | 'protector' | 'championship'
   * @param {number} requiredLevel
   * @param {StatBonus} bonuses
   */
  constructor(id, name, description, slot, requiredLevel, bonuses) {
    this.id = id
    this.name = name
    this.description = description
    this.slot = slot
    this.requiredLevel = requiredLevel
    this.bonuses = bonuses instanceof StatBonus ? bonuses : new StatBonus(bonuses)
  }

  get slotLabel() {
    const labels = { outfit: 'Strój', gadget: 'Gadżet', protector: 'Ochraniacz', championship: '🏆 Pas' }
    return labels[this.slot] ?? this.slot
  }

  /**
   * Sprawdź czy zawodnik spełnia wymagania.
   * @param {number} wrestlerLevel
   * @returns {{ ok: boolean, reason: string }}
   */
  checkRequirements(wrestlerLevel) {
    if (wrestlerLevel < this.requiredLevel) {
      return { ok: false, reason: `Wymagany poziom ${this.requiredLevel} (masz ${wrestlerLevel})` }
    }
    return { ok: true, reason: '' }
  }

  toJSON() {
    return { id: this.id }
  }

  static fromJSON(data, catalogue) {
    return catalogue.find(i => i.id === data.id) ?? null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ITEM CATALOGUE
// ─────────────────────────────────────────────────────────────────────────────

// ── Outfits (Stroje) ──────────────────────────────────────────────────────────
export const OUTFITS = [
  new Item('rookie_trunks',      'Rookie Trunks',       'Podstawowe spodenki wrestlera.',           'outfit', 1, new StatBonus({ strength: 2, dexterity: 2 })),
  new Item('beginner_singlet',   'Beginner\'s Singlet', 'Klasyczny strój zapaśniczy.',              'outfit', 1, new StatBonus({ hp: 10, energy: 5 })),
  new Item('power_suit',         'Power Suit',          'Obcisły strój podkreślający mięśnie.',     'outfit', 2, new StatBonus({ strength: 6, hp: 15 })),
  new Item('aerial_tights',      'Aerial Tights',       'Lekki, aerodynamiczny strój akrobaty.',    'outfit', 3, new StatBonus({ dexterity: 8, energy: 10 })),
  new Item('championship_attire','Championship Attire', 'Lśniący strój godny mistrza.',             'outfit', 4, new StatBonus({ strength: 5, dexterity: 5, hp: 20, energy: 10 })),
]

// ── Gadgets (Gadżety) ─────────────────────────────────────────────────────────
export const GADGETS = [
  new Item('sports_tape',         'Sports Tape',          'Taśma sportowa – wsparcie nadgarstków.',  'gadget', 1, new StatBonus({ strength: 3 })),
  new Item('sweatband',           'Sweatband',            'Opaska – skupienie w walce.',             'gadget', 1, new StatBonus({ dexterity: 3 })),
  new Item('power_gloves',        'Power Gloves',         'Rękawice wzmacniające chwyt.',            'gadget', 2, new StatBonus({ strength: 7, dexterity: 2 })),
  new Item('energy_drink_flask',  'Energy Drink Flask',   'Kolba z napojem energetycznym.',          'gadget', 2, new StatBonus({ energy: 15 })),
  new Item('champion_wristbands', 'Champion\'s Wristbands','Złote opaski mistrza.',                 'gadget', 4, new StatBonus({ strength: 8, dexterity: 6, energy: 10 })),
]

// ── Protectors (Ochraniacze) ──────────────────────────────────────────────────
export const PROTECTORS = [
  new Item('basic_knee_pads',      'Basic Knee Pads',      'Standardowe ochraniacze na kolana.',     'protector', 1, new StatBonus({ hp: 15 })),
  new Item('elbow_pads',           'Elbow Pads',           'Ochraniacze na łokcie.',                 'protector', 1, new StatBonus({ hp: 10, dexterity: 2 })),
  new Item('pro_knee_guards',      'Pro Knee Guards',      'Profesjonalne ochraniacze z wyściółką.', 'protector', 2, new StatBonus({ hp: 25, dexterity: 3 })),
  new Item('steel_boots',          'Steel-Reinforced Boots','Buty z wzmocnionym czubkiem.',          'protector', 3, new StatBonus({ strength: 5, hp: 20 })),
  new Item('full_body_wrap',       'Full Body Wrap',       'Profesjonalne owiązania całego ciała.',  'protector', 4, new StatBonus({ hp: 40, dexterity: 4 })),
]

// ── Championships (Pasy) ──────────────────────────────────────────────────────
export const CHAMPIONSHIPS = [
  new Item('local_championship',    'Local Championship',    'Pas Lokalnej Federacji.',   'championship', 1, new StatBonus({ strength: 5,  dexterity: 5,  hp: 20, energy: 10 })),
  new Item('national_championship', 'National Championship', 'Pas Federacji Krajowej.',   'championship', 1, new StatBonus({ strength: 10, dexterity: 10, hp: 40, energy: 20 })),
]

// ── Starter items (od trenera) ────────────────────────────────────────────────
export const STARTER_ITEMS = [
  new Item('trainers_gloves',   'Trainer\'s Gloves',   'Rękawice od trenera – bonus do siły.',        'gadget',    1, new StatBonus({ strength: 5 })),
  new Item('trainers_knee_pads','Trainer\'s Knee Pads','Ochraniacze od trenera – bonus do zręczności.','protector', 1, new StatBonus({ dexterity: 5 })),
  new Item('trainers_singlet',  'Trainer\'s Singlet',  'Strój od trenera – dodatkowe HP.',            'outfit',    1, new StatBonus({ hp: 20 })),
]

// ── Wszystkie lootowalne przedmioty ──────────────────────────────────────────
export const ALL_LOOTABLE_ITEMS = [...OUTFITS, ...GADGETS, ...PROTECTORS]

// ── Pełny katalog (do deserializacji) ────────────────────────────────────────
export const ALL_ITEMS = [...OUTFITS, ...GADGETS, ...PROTECTORS, ...CHAMPIONSHIPS, ...STARTER_ITEMS]

/**
 * Znajdź przedmiot po ID.
 * @param {string} id
 * @returns {Item|null}
 */
export function findItemById(id) {
  return ALL_ITEMS.find(i => i.id === id) ?? null
}
