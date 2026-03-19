/**
 * NPCs.js
 * Roster rywali NPC z systemem doboru przeciwnika i AI walki.
 * Squared Circle Wrestling RPG
 */

import { Powerhouse, HighFlyer, Technician } from './Character.js'
import { MOVES_CATALOGUE, FINISHER_CATALOGUE } from './Skills.js'

// ─────────────────────────────────────────────────────────────────────────────
// NPC FACTORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Stwórz NPC z określonymi parametrami.
 * @param {typeof Wrestler} Cls
 * @param {string} name
 * @param {number} level
 * @param {number[]} movesIdx
 * @param {number} finIdx
 * @param {number} statScale - mnożnik bazowych statystyk (0.55 = 55%)
 * @returns {Wrestler}
 */
function makeNpc(Cls, name, level, movesIdx, finIdx, statScale = 1.0) {
  const npc = new Cls(name)
  npc.level = level

  // Skaluj statystyki bazowe
  if (statScale !== 1.0) {
    npc._baseStrength   = Math.max(5,  Math.floor(npc._baseStrength   * statScale))
    npc._baseHp         = Math.max(50, Math.floor(npc._baseHp         * statScale))
    npc._baseEnergy     = Math.max(40, Math.floor(npc._baseEnergy      * statScale))
    npc._baseDexterity  = Math.max(4,  Math.floor(npc._baseDexterity   * statScale))
  }

  const className = npc.characterClass
  const availableMoves    = MOVES_CATALOGUE[className]
  const availableFinishers = FINISHER_CATALOGUE[className]

  npc.moves    = movesIdx.filter(i => i < availableMoves.length).map(i => availableMoves[i])
  npc.finisher = availableFinishers[finIdx % availableFinishers.length]
  npc.restoreToFull()

  return npc
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC ROSTER
// ─────────────────────────────────────────────────────────────────────────────

export function buildNpcRoster() {
  return [
    // ── Szkoła Lvl 1 (55% statystyk) ──────────────────────────────────────
    makeNpc(Powerhouse, 'Rocky Bułka',         1, [0,4,7], 2, 0.55),
    makeNpc(HighFlyer,  'Timmy Flip',           1, [0,6,3], 0, 0.55),
    makeNpc(Technician, 'Grzegorz Dźwignia',    1, [0,2,7], 0, 0.55),

    // ── Szkoła Lvl 2 (72% statystyk) ──────────────────────────────────────
    makeNpc(Powerhouse, 'Bartek Mocarz',        2, [1,3,5], 0, 0.72),
    makeNpc(HighFlyer,  'Salto Stasiu',         2, [1,4,8], 1, 0.72),

    // ── Środek Lvl 3 (90% statystyk) ──────────────────────────────────────
    makeNpc(Technician, 'Adam Dusiciel',        3, [1,5,8], 1, 0.90),
    makeNpc(Powerhouse, 'Wielki Zbyszek',       3, [2,5,9], 1, 0.90),
    makeNpc(HighFlyer,  'Lotny Krzysztof',      3, [2,7,9], 2, 0.90),

    // ── Federacja Lvl 4 (100%) ─────────────────────────────────────────────
    makeNpc(Technician, 'Mistrz Janusz',        4, [3,6,8], 2, 1.00),
    makeNpc(Powerhouse, 'Destruktor Marek',     4, [0,2,5], 0, 1.00),

    // ── Federacja Lvl 5 (105%) ─────────────────────────────────────────────
    makeNpc(HighFlyer,  'Feniks Radek',         5, [3,7,9], 2, 1.05),
    makeNpc(Technician, 'Żelazny Piotr',        5, [4,6,9], 0, 1.05),

    // ── Bossowie Lvl 6-7 (110-115%) ────────────────────────────────────────
    makeNpc(Powerhouse, 'Kolos Waldemar',       6, [1,2,5], 0, 1.10),
    makeNpc(Technician, 'Profesor Zygmunt',     6, [2,5,8], 2, 1.10),
    makeNpc(HighFlyer,  'Legenda – El Aguila',  7, [1,4,7], 1, 1.15),
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC SELECTION – dopasowanie rywala do gracza
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dobierz rywala na podstawie rozdziału i liczby wygranych.
 * @param {Wrestler[]} roster
 * @param {number} chapter
 * @param {number} schoolWins
 * @param {number} federationWins
 * @param {number} playerLevel
 * @returns {Wrestler}
 */
export function pickNpc(roster, chapter, schoolWins, federationWins, playerLevel) {
  let pool

  if (chapter === 1) {
    // Szkoła: stopniowe trudniejsze
    if (schoolWins < 2) {
      pool = roster.filter(n => n.level === 1)
    } else if (schoolWins < 4) {
      pool = roster.filter(n => n.level <= 2)
    } else {
      pool = roster.filter(n => n.level <= Math.max(2, playerLevel))
    }
  } else {
    // Federacja: stopniowe trudniejsze
    if (federationWins < 2) {
      pool = roster.filter(n => n.level === 3)
    } else if (federationWins < 5) {
      pool = roster.filter(n => n.level >= 3 && n.level <= 4)
    } else {
      pool = roster.filter(n => n.level >= 4)
    }
  }

  if (!pool || pool.length === 0) pool = roster

  const npc = pool[Math.floor(Math.random() * pool.length)]
  npc.restoreToFull()
  return npc
}

/**
 * Sprawdź czy ta walka jest o pas mistrzowski.
 * @param {number} chapter
 * @param {number} federationWins
 * @param {object} equippedChampionship
 * @returns {{ isTitle: boolean, championshipId: string|null, titleName: string }}
 */
export function checkTitleFight(chapter, federationWins, equippedChampionship) {
  if (chapter !== 2) return { isTitle: false, championshipId: null, titleName: '' }

  if (!equippedChampionship && federationWins >= 2) {
    return { isTitle: true, championshipId: 'local_championship', titleName: 'Local Championship' }
  }

  if (equippedChampionship?.id === 'local_championship' && federationWins >= 6) {
    return { isTitle: true, championshipId: 'national_championship', titleName: 'National Championship' }
  }

  return { isTitle: false, championshipId: null, titleName: '' }
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC AI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AI decyzja NPC – wybór ruchu.
 * @param {Wrestler} npc
 * @param {Wrestler} player
 * @param {number} adrenalineStreak - ile razy z rzędu użył adrenaliny
 * @returns {{ action: 'move'|'finisher'|'adrenaline', skill?: ActiveSkill }}
 */
export function npcChooseAction(npc, player, adrenalineStreak = 0) {
  const affordable = npc.moves.filter(m => npc.currentEnergy >= m.energy_cost)

  // Finisher gdy możliwy
  if (
    npc.finisher &&
    player.hpPercentage < 35 &&
    npc.currentEnergy >= npc.finisher.energyCost &&
    adrenalineStreak < 2
  ) {
    return { action: 'finisher', skill: npc.finisher }
  }

  // Adrenalina gdy brak ruchu LUB bardzo niskie HP+energia
  const shouldAdrenaline = (
    affordable.length === 0 ||
    (npc.hpPercentage < 20 && npc.currentEnergy < 15)
  ) && adrenalineStreak < 2

  if (shouldAdrenaline) {
    return { action: 'adrenaline' }
  }

  // Losowy dostępny ruch
  if (affordable.length > 0) {
    const move = affordable[Math.floor(Math.random() * affordable.length)]
    return { action: 'move', skill: move }
  }

  // Panic move – daj minimalną energię
  const cheapest = npc.moves.reduce((a, b) => a.energyCost < b.energyCost ? a : b)
  npc._currentEnergy = cheapest.energyCost
  return { action: 'move', skill: cheapest }
}

// ─────────────────────────────────────────────────────────────────────────────
// NPC LORE – dialogi przed walką
// ─────────────────────────────────────────────────────────────────────────────

export const NPC_LORE = {
  'Rocky Bułka':
    'Kaz: <i>– Rocky. Syn piekarza z Końskich. Silny jak wół, powolny jak wół. Nie daj mu się złapać.</i>',
  'Timmy Flip':
    'Kaz: <i>– Timmy. Oglądał za dużo WWE jako dziecko. Myśli że jest Rey Mysterio. Pokaż mu że nie jest.</i>',
  'Grzegorz Dźwignia':
    'Kaz: <i>– Grzegorz. Były judoka. Uważaj na chwyty – wie co robi.</i>',
  'Bartek Mocarz':
    'Kaz: <i>– Bartek jest tu rok. Myśli że już wszystko umie. Takim trzeba pokazać że nie umieją.</i>',
  'Salto Stasiu':
    'Kaz: <i>– Stasiu. Dobry chłopak, za bardzo się stara. Przez to robi błędy. Wykorzystaj to.</i>',
  'Adam Dusiciel':
    'Bożena: <i>– Uważaj na Adama. Całkiem miły poza ringiem. W ringu jakby ktoś go przełączał.</i>',
  'Wielki Zbyszek':
    '<b>– ZBYSZEK CIĘ ZMIAŻDŻY!</b> ryczy przez szatnię.<br>Bożena: <i>– Jego mama mówi że w domu jest spokojny.</i>',
  'Lotny Krzysztof':
    'Krzysztof podaje rękę: <i>– Przepraszam z góry za to co zrobię. Naprawdę mi przykro.</i>',
  'Mistrz Janusz':
    'Janusz do nieistniejącego menadżera: <i>– Powiedzcie nowemu że Janusz nie rozmawia z nikim poniżej TOP 5.</i>',
  'Destruktor Marek':
    'Bożena: <i>– Marek jest tu od 3 lat. Bije każdego. Ale płaci składkę punktualnie, więc co zrobisz.</i>',
  'Feniks Radek':
    '<i>– Słyszałem o tobie. Kaz cię trenował. To znaczy że umiesz walczyć.</i><br><i>– Ale ja też umiem.</i>',
  'Żelazny Piotr':
    '<i>– Wiesz co jest różnica między tobą a mną? Ja byłem tu 12 lat temu tam gdzie ty jesteś. Przetrwałem.</i>',
  'Kolos Waldemar':
    'Bożena ścisza głos: <i>– Waldemar to były ochroniarz. Powodzenia, skarbie.</i>',
  'Profesor Zygmunt':
    '<i>– Interesujący okaz – mówi Zygmunt, notując w zeszycie. – Sprawdzimy twoją odporność na ból.</i>',
  'Legenda – El Aguila':
    'Bożena wstaje od biurka.<br><i>– To jest El Aguila. Przyjeżdża z Warszawy. To... naprawdę duże.</i>',
}
