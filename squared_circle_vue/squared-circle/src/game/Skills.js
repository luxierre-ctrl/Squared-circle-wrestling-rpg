/**
 * Skills.js
 * Wszystkie ruchy wrestlingowe, finishery i umiejętności pasywne.
 * Squared Circle Wrestling RPG
 */

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE SKILL
// ─────────────────────────────────────────────────────────────────────────────

export class ActiveSkill {
  /**
   * @param {string} id        - unikalny identyfikator (klucz tłumaczenia)
   * @param {string} name      - nazwa wyświetlana (może być nadpisana przez i18n)
   * @param {number} energyCost
   * @param {number} damageMultiplier
   * @param {boolean} isFinisher
   */
  constructor(id, name, energyCost, damageMultiplier, isFinisher = false) {
    this.id = id
    this.name = name
    this.energyCost = energyCost
    this.damageMultiplier = damageMultiplier
    this.isFinisher = isFinisher
  }

  /**
   * Oblicz obrażenia na podstawie siły atakującego.
   * @param {number} strength
   * @returns {number}
   */
  calculateDamage(strength) {
    return Math.round(strength * this.damageMultiplier)
  }

  /**
   * Wykonaj ruch – odejmij energię atakującemu, zadaj obrażenia.
   * @param {import('./Character').Wrestler} attacker
   * @param {import('./Character').Wrestler} defender
   * @returns {{ success: boolean, damage: number, message: string, log: string }}
   */
  use(attacker, defender) {
    if (attacker.currentEnergy < this.energyCost) {
      return {
        success: false,
        damage: 0,
        message: 'insufficient_energy',
        log: `❌ ${attacker.name} nie ma wystarczającej energii! (${attacker.currentEnergy}/${this.energyCost}⚡)`
      }
    }

    if (this.isFinisher) {
      const hpPct = (defender.currentHp / defender.maxHp) * 100
      if (hpPct >= 35) {
        return {
          success: false,
          damage: 0,
          message: 'finisher_blocked',
          log: `🔒 Finisher niedostępny! ${defender.name} ma ${hpPct.toFixed(0)}% HP (wymagane < 35%)`
        }
      }
    }

    attacker.spendEnergy(this.energyCost)
    const damage = this.calculateDamage(attacker.effectiveStrength)
    defender.takeDamage(damage)

    const log = this.isFinisher
      ? `💥 FINISHER! ${attacker.name} wykonuje ${this.name}! Zadano ${damage} obrażeń!`
      : `🤼 ${attacker.name} używa ${this.name}! Zadano ${damage} obrażeń. ${defender.name}: ${defender.currentHp}/${defender.maxHp} HP`

    return { success: true, damage, message: 'hit', log }
  }

  toJSON() {
    return { id: this.id, name: this.name, energyCost: this.energyCost, damageMultiplier: this.damageMultiplier, isFinisher: this.isFinisher }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PASSIVE SKILL
// ─────────────────────────────────────────────────────────────────────────────

export class PassiveSkill {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} description
   * @param {object} bonuses - { strengthBonus, dexterityBonus, hpBonusPct, energyBonusPct }
   */
  constructor(id, name, description, bonuses = {}) {
    this.id = id
    this.name = name
    this.description = description
    this.strengthBonus = bonuses.strengthBonus ?? 0
    this.dexterityBonus = bonuses.dexterityBonus ?? 0
    this.hpBonusPct = bonuses.hpBonusPct ?? 0
    this.energyBonusPct = bonuses.energyBonusPct ?? 0
  }

  toJSON() {
    return { id: this.id }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CATALOGUES
// ─────────────────────────────────────────────────────────────────────────────

export const MOVES_CATALOGUE = {
  Powerhouse: [
    new ActiveSkill('vertical_suplex',       'Vertical Suplex',        15, 1.2),
    new ActiveSkill('spinebuster',            'Spinebuster',            18, 1.4),
    new ActiveSkill('military_press',         'Military Press',         20, 1.5),
    new ActiveSkill('powerslam',              'Powerslam',              15, 1.3),
    new ActiveSkill('big_boot',               'Big Boot',               10, 1.1),
    new ActiveSkill('clothesline_from_hell',  'Clothesline from Hell',  22, 1.6),
    new ActiveSkill('backbreaker',            'Backbreaker',            17, 1.4),
    new ActiveSkill('bearhug',                'Bearhug',                12, 1.0),
    new ActiveSkill('fallaway_slam',          'Fallaway Slam',          16, 1.3),
    new ActiveSkill('shoulder_tackle',        'Shoulder Tackle',        10, 1.1),
  ],
  HighFlyer: [
    new ActiveSkill('dropkick',               'Dropkick',               12, 1.1),
    new ActiveSkill('hurricanrana',           'Hurricanrana',           15, 1.3),
    new ActiveSkill('moonsault',              'Moonsault',              22, 1.6),
    new ActiveSkill('enzuigiri',              'Enzuigiri',              18, 1.4),
    new ActiveSkill('springboard_forearm',    'Springboard Forearm',    20, 1.5),
    new ActiveSkill('tornado_ddt',            'Tornado DDT',            17, 1.4),
    new ActiveSkill('crossbody',              'Crossbody',              14, 1.2),
    new ActiveSkill('standing_shooting_star', 'Standing Shooting Star', 25, 1.7),
    new ActiveSkill('handspring_elbow',       'Handspring Elbow',       15, 1.3),
    new ActiveSkill('619_kick',               '619 Kick',               20, 1.5),
  ],
  Technician: [
    new ActiveSkill('arm_bar',                'Arm Bar',                10, 1.0),
    new ActiveSkill('german_suplex',          'German Suplex',          18, 1.5),
    new ActiveSkill('dragon_screw',           'Dragon Screw',           12, 1.2),
    new ActiveSkill('cobra_twist',            'Cobra Twist',            15, 1.3),
    new ActiveSkill('northern_lights_suplex', 'Northern Lights Suplex', 17, 1.4),
    new ActiveSkill('crossface',              'Crossface',              20, 1.6),
    new ActiveSkill('ankle_lock',             'Ankle Lock',             18, 1.4),
    new ActiveSkill('exploder_suplex',        'Exploder Suplex',        16, 1.3),
    new ActiveSkill('sharpshooter',           'Sharpshooter',           22, 1.7),
    new ActiveSkill('fujiwara_armbar',        'Fujiwara Armbar',        15, 1.3),
  ],
}

export const FINISHER_CATALOGUE = {
  Powerhouse: [
    new ActiveSkill('powerbomb',   'Powerbomb',   45, 2.5, true),
    new ActiveSkill('chokeslam',   'Chokeslam',   40, 2.3, true),
    new ActiveSkill('spear',       'Spear',       35, 2.1, true),
  ],
  HighFlyer: [
    new ActiveSkill('450_splash',     '450 Splash',     35, 2.4, true),
    new ActiveSkill('red_arrow',      'Red Arrow',       40, 2.6, true),
    new ActiveSkill('phoenix_splash', 'Phoenix Splash',  45, 2.7, true),
  ],
  Technician: [
    new ActiveSkill('lebell_lock',        'LeBell Lock',        30, 2.2, true),
    new ActiveSkill('cattle_mutilation',  'Cattle Mutilation',  35, 2.4, true),
    new ActiveSkill('hells_gate',         "Hell's Gate",        40, 2.5, true),
  ],
}

export const PASSIVE_SKILLS = {
  Powerhouse: new PassiveSkill(
    'iron_body',
    'Iron Body',
    '+15% max HP, +5 Siły dzięki masie mięśniowej',
    { strengthBonus: 5, hpBonusPct: 15 }
  ),
  HighFlyer: new PassiveSkill(
    'aerial_mastery',
    'Aerial Mastery',
    '+20% max Energii, +5 Zręczności dzięki treningom akrobatycznym',
    { dexterityBonus: 5, energyBonusPct: 20 }
  ),
  Technician: new PassiveSkill(
    'technical_precision',
    'Technical Precision',
    '+10% max HP, +8 Zręczności dzięki technicznym umiejętnościom',
    { dexterityBonus: 8, hpBonusPct: 10 }
  ),
}

/**
 * Znajdź skill po ID w katalogu.
 * @param {string} id
 * @param {string} characterClass
 * @returns {ActiveSkill|null}
 */
export function findSkillById(id, characterClass) {
  const allMoves = [
    ...(MOVES_CATALOGUE[characterClass] ?? []),
    ...(FINISHER_CATALOGUE[characterClass] ?? []),
  ]
  return allMoves.find(s => s.id === id) ?? null
}
