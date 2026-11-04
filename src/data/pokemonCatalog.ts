import { PokemonData, PokemonIVs, PokemonEVs, PokemonStats, PrismaticTier, RegionInfo, Move } from '../types/game';

// Stat Calculation Formula:
// Scaled Stat = (((2 * Base + IV + (EV/4)) / 100) * Level) + 10 (with HP having + Level + 10)
export function calculatePokemonStats(
  base: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  ivs: PokemonIVs,
  evs: PokemonEVs,
  level: number
): PokemonStats {
  const calcStat = (b: number, iv: number, ev: number, isHp: boolean = false) => {
    const raw = Math.floor((((2 * b + iv + Math.floor(ev / 4)) / 100) * level) + 10);
    return isHp ? raw + level + 15 : raw;
  };

  const maxHp = calcStat(base.hp, ivs.hp, evs.hp, true);
  return {
    hp: maxHp,
    maxHp,
    atk: calcStat(base.atk, ivs.atk, evs.atk),
    def: calcStat(base.def, ivs.def, evs.def),
    spa: calcStat(base.spa, ivs.spa, evs.spa),
    spd: calcStat(base.spd, ivs.spd, evs.spd),
    spe: calcStat(base.spe, ivs.spe, evs.spe),
  };
}

export function generateRandomIVs(): PokemonIVs {
  return {
    hp: Math.floor(Math.random() * 32),
    atk: Math.floor(Math.random() * 32),
    def: Math.floor(Math.random() * 32),
    spa: Math.floor(Math.random() * 32),
    spd: Math.floor(Math.random() * 32),
    spe: Math.floor(Math.random() * 32),
  };
}

export function rollPrismaticTier(bonusResonance = 0): PrismaticTier {
  // Base rates:
  // Supernova: 1 / 65536
  // Ethereal: 1 / 32768
  // Radiant: 1 / 16384
  // Shiny: 1 / 4096
  // Standard: rest
  // With resonance bonus, multipliers apply
  const mult = 1 + bonusResonance * 0.5; // up to 3x rate
  const roll = Math.random();

  if (roll < (1 / 65536) * mult * 20) return 'Supernova'; // boost slightly so gameplay showcases it reliably!
  if (roll < (1 / 32768) * mult * 25) return 'Ethereal';
  if (roll < (1 / 16384) * mult * 30) return 'Radiant';
  if (roll < (1 / 4096) * mult * 40) return 'Shiny';
  return 'Standard';
}

export const SAMPLE_MOVES: Record<string, Move> = {
  tackle: { id: 'm1', name: 'Tackle', type: 'Normal', power: 40, cooldown: 1.5, priorityTier: 3, description: 'A physical charge attack.' },
  flamethrower: { id: 'm2', name: 'Flamethrower', type: 'Fire', power: 90, cooldown: 3.5, priorityTier: 1, effect: 'burn', description: 'Intense blast of fire with 25% burn chance.' },
  hydropump: { id: 'm3', name: 'Hydro Pump', type: 'Water', power: 110, cooldown: 4.5, priorityTier: 1, description: 'High-pressure water cannon.' },
  solarbeam: { id: 'm4', name: 'Solar Beam', type: 'Grass', power: 120, cooldown: 5.0, priorityTier: 1, description: 'Condensed sunlight energy beam.' },
  thunderbolt: { id: 'm5', name: 'Thunderbolt', type: 'Electric', power: 90, cooldown: 3.5, priorityTier: 1, effect: 'stun', description: 'Powerful shock with stun chance.' },
  dragonclaw: { id: 'm6', name: 'Dragon Claw', type: 'Dragon', power: 80, cooldown: 2.8, priorityTier: 2, description: 'Sharp claws slash through targets.' },
  shadowball: { id: 'm7', name: 'Shadow Ball', type: 'Ghost', power: 80, cooldown: 3.0, priorityTier: 2, description: 'Dark shadowy sphere of spirit energy.' },
  psychic: { id: 'm8', name: 'Psychic', type: 'Psychic', power: 90, cooldown: 3.2, priorityTier: 1, description: 'Strong telekinetic wave.' },
  icebeam: { id: 'm9', name: 'Ice Beam', type: 'Ice', power: 90, cooldown: 3.8, priorityTier: 1, effect: 'freeze', description: 'Freezing ray that stops foes cold.' },
  earthquake: { id: 'm10', name: 'Earthquake', type: 'Ground', power: 100, cooldown: 4.2, priorityTier: 1, effect: 'aoe', description: 'Massive tremors hitting all enemies.' },
  moonblast: { id: 'm11', name: 'Moonblast', type: 'Fairy', power: 95, cooldown: 3.6, priorityTier: 1, description: 'Borrowing the power of the moon.' },
  aurasphere: { id: 'm12', name: 'Aura Sphere', type: 'Fighting', power: 80, cooldown: 2.5, priorityTier: 2, description: 'A blast of pure inner aura that never misses.' },
};

export interface SpeciesTemplate {
  dexNumber: number;
  speciesName: string;
  types: [any] | [any, any];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  modelArchetype: 'quadruped' | 'biped' | 'draconic' | 'serpentine' | 'avian' | 'orb' | 'crystal_golem';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  scale: number;
  availableMoves: string[];
}

export const SPECIES_CATALOG: SpeciesTemplate[] = [
  // Gen 1
  {
    dexNumber: 6,
    speciesName: 'Charizard',
    types: ['Fire', 'Flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    modelArchetype: 'draconic',
    primaryColor: '#e06020',
    secondaryColor: '#f8d030',
    accentColor: '#30a0d0',
    scale: 1.2,
    availableMoves: ['flamethrower', 'dragonclaw', 'tackle'],
  },
  {
    dexNumber: 9,
    speciesName: 'Blastoise',
    types: ['Water'],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    modelArchetype: 'biped',
    primaryColor: '#3878d8',
    secondaryColor: '#c8a060',
    accentColor: '#e0e0e0',
    scale: 1.15,
    availableMoves: ['hydropump', 'icebeam', 'tackle'],
  },
  {
    dexNumber: 3,
    speciesName: 'Venusaur',
    types: ['Grass', 'Poison'],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    modelArchetype: 'quadruped',
    primaryColor: '#48a890',
    secondaryColor: '#e05878',
    accentColor: '#d0c830',
    scale: 1.25,
    availableMoves: ['solarbeam', 'earthquake', 'tackle'],
  },
  {
    dexNumber: 25,
    speciesName: 'Pikachu',
    types: ['Electric'],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    modelArchetype: 'quadruped',
    primaryColor: '#ffd820',
    secondaryColor: '#a05020',
    accentColor: '#e83020',
    scale: 0.75,
    availableMoves: ['thunderbolt', 'tackle'],
  },
  {
    dexNumber: 94,
    speciesName: 'Gengar',
    types: ['Ghost', 'Poison'],
    baseStats: { hp: 60, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    modelArchetype: 'orb',
    primaryColor: '#6a3880',
    secondaryColor: '#421d59',
    accentColor: '#ff2040',
    scale: 1.0,
    availableMoves: ['shadowball', 'psychic'],
  },
  {
    dexNumber: 150,
    speciesName: 'Mewtwo',
    types: ['Psychic'],
    baseStats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
    modelArchetype: 'biped',
    primaryColor: '#d8c8e0',
    secondaryColor: '#803098',
    accentColor: '#b840d0',
    scale: 1.35,
    availableMoves: ['psychic', 'aurasphere', 'shadowball'],
  },
  // Gen 2
  {
    dexNumber: 248,
    speciesName: 'Tyranitar',
    types: ['Rock', 'Dark'],
    baseStats: { hp: 100, atk: 134, def: 110, spa: 95, spd: 100, spe: 61 },
    modelArchetype: 'biped',
    primaryColor: '#6a824e',
    secondaryColor: '#304230',
    accentColor: '#1a5078',
    scale: 1.3,
    availableMoves: ['earthquake', 'dragonclaw', 'tackle'],
  },
  {
    dexNumber: 249,
    speciesName: 'Lugia',
    types: ['Psychic', 'Flying'],
    baseStats: { hp: 106, atk: 90, def: 130, spa: 90, spd: 154, spe: 110 },
    modelArchetype: 'avian',
    primaryColor: '#e8ecf0',
    secondaryColor: '#3d4f8f',
    accentColor: '#4f72c4',
    scale: 1.4,
    availableMoves: ['aeroblast' in SAMPLE_MOVES ? 'aeroblast' : 'hydropump', 'psychic'],
  },
  // Gen 3
  {
    dexNumber: 384,
    speciesName: 'Rayquaza',
    types: ['Dragon', 'Flying'],
    baseStats: { hp: 105, atk: 150, def: 90, spa: 150, spd: 90, spe: 95 },
    modelArchetype: 'serpentine',
    primaryColor: '#288848',
    secondaryColor: '#d8aa28',
    accentColor: '#d83838',
    scale: 1.45,
    availableMoves: ['dragonclaw', 'flamethrower', 'earthquake'],
  },
  // Gen 4
  {
    dexNumber: 448,
    speciesName: 'Lucario',
    types: ['Fighting', 'Steel'],
    baseStats: { hp: 70, atk: 110, def: 70, spa: 115, spd: 70, spe: 90 },
    modelArchetype: 'biped',
    primaryColor: '#3466af',
    secondaryColor: '#222222',
    accentColor: '#d8c478',
    scale: 1.0,
    availableMoves: ['aurasphere', 'dragonclaw'],
  },
  {
    dexNumber: 445,
    speciesName: 'Garchomp',
    types: ['Dragon', 'Ground'],
    baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
    modelArchetype: 'draconic',
    primaryColor: '#284e80',
    secondaryColor: '#b82020',
    accentColor: '#f0c028',
    scale: 1.3,
    availableMoves: ['earthquake', 'dragonclaw'],
  },
  // Gen 7
  {
    dexNumber: 778,
    speciesName: 'Mimikyu',
    types: ['Ghost', 'Fairy'],
    baseStats: { hp: 55, atk: 90, def: 80, spa: 50, spd: 105, spe: 96 },
    modelArchetype: 'orb',
    primaryColor: '#cfbe7a',
    secondaryColor: '#303030',
    accentColor: '#403830',
    scale: 0.7,
    availableMoves: ['shadowball', 'moonblast'],
  },
  // Gen 9
  {
    dexNumber: 1007,
    speciesName: 'Koraidon',
    types: ['Fighting', 'Dragon'],
    baseStats: { hp: 100, atk: 135, def: 115, spa: 85, spd: 100, spe: 135 },
    modelArchetype: 'draconic',
    primaryColor: '#d62d3a',
    secondaryColor: '#265487',
    accentColor: '#f2eae1',
    scale: 1.4,
    availableMoves: ['dragonclaw', 'flamethrower', 'earthquake'],
  },
  {
    dexNumber: 1024,
    speciesName: 'Terapagos',
    types: ['Normal', 'Fairy'],
    baseStats: { hp: 95, atk: 65, def: 110, spa: 105, spd: 110, spe: 85 },
    modelArchetype: 'crystal_golem',
    primaryColor: '#3aa8d8',
    secondaryColor: '#e0f4ff',
    accentColor: '#f8d030',
    scale: 1.25,
    availableMoves: ['moonblast', 'icebeam', 'earthquake'],
  }
];

export function createPokemonInstance(
  template: SpeciesTemplate,
  level: number,
  forcedTier?: PrismaticTier,
  bonusResonance: number = 0
): PokemonData {
  const ivs = generateRandomIVs();
  const evs: PokemonEVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const stats = calculatePokemonStats(template.baseStats, ivs, evs, level);
  const tier = forcedTier || rollPrismaticTier(bonusResonance);

  const moves: Move[] = template.availableMoves.map(id => SAMPLE_MOVES[id] || SAMPLE_MOVES.tackle);

  return {
    id: `pk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    dexNumber: template.dexNumber,
    speciesName: template.speciesName,
    level,
    currentExp: 0,
    expToNextLevel: level * 100,
    types: template.types,
    prismaticTier: tier,
    capturedAt: Date.now(),
    catchRegion: Math.min(9, Math.ceil(level / 100)),
    baseStats: template.baseStats,
    ivs,
    evs,
    stats,
    moves,
    nature: 'Adamant',
    modelArchetype: template.modelArchetype,
    primaryColor: template.primaryColor,
    secondaryColor: template.secondaryColor,
    accentColor: template.accentColor,
    scale: template.scale,
  };
}

export const REGIONS_DATA: RegionInfo[] = [
  {
    id: 1,
    name: 'Kanto',
    generation: 'Gen 1',
    levelRange: [1, 100],
    biomeTheme: 'kanto_grass',
    skyColor: '#68b0f8',
    groundColor: '#388e3c',
    ambientColor: '#c8e6c9',
    fogColor: '#b2dfdb',
    gyms: [
      { id: 1, region: 1, name: 'Brock', badgeName: 'Boulder Badge', badgeIcon: '🪨', levelRequirement: 14, acePokemon: 'Onix', rewardShards: 50, unlocked: true, defeated: true },
      { id: 2, region: 1, name: 'Misty', badgeName: 'Cascade Badge', badgeIcon: '💧', levelRequirement: 25, acePokemon: 'Starmie', rewardShards: 75, unlocked: true, defeated: true },
      { id: 3, region: 1, name: 'Lt. Surge', badgeName: 'Thunder Badge', badgeIcon: '⚡', levelRequirement: 38, acePokemon: 'Raichu', rewardShards: 100, unlocked: true, defeated: false },
      { id: 4, region: 1, name: 'Erika', badgeName: 'Rainbow Badge', badgeIcon: '🌈', levelRequirement: 50, acePokemon: 'Vileplume', rewardShards: 120, unlocked: false, defeated: false },
      { id: 5, region: 1, name: 'Koga', badgeName: 'Soul Badge', badgeIcon: '💜', levelRequirement: 65, acePokemon: 'Weezing', rewardShards: 150, unlocked: false, defeated: false },
      { id: 6, region: 1, name: 'Sabrina', badgeName: 'Marsh Badge', badgeIcon: '🔮', levelRequirement: 78, acePokemon: 'Alakazam', rewardShards: 180, unlocked: false, defeated: false },
      { id: 7, region: 1, name: 'Blaine', badgeName: 'Volcano Badge', badgeIcon: '🔥', levelRequirement: 88, acePokemon: 'Magmar', rewardShards: 220, unlocked: false, defeated: false },
      { id: 8, region: 1, name: 'Giovanni', badgeName: 'Earth Badge', badgeIcon: '🌱', levelRequirement: 100, acePokemon: 'Rhydon', rewardShards: 300, unlocked: false, defeated: false },
    ],
  },
  {
    id: 2,
    name: 'Johto',
    generation: 'Gen 2',
    levelRange: [101, 200],
    biomeTheme: 'johto_autumn',
    skyColor: '#e0a96d',
    groundColor: '#8d6e63',
    ambientColor: '#ffe0b2',
    fogColor: '#d7ccc8',
    gyms: [
      { id: 9, region: 2, name: 'Falkner', badgeName: 'Zephyr Badge', badgeIcon: '🪶', levelRequirement: 115, acePokemon: 'Pidgeot', rewardShards: 350, unlocked: false, defeated: false },
      { id: 10, region: 2, name: 'Bugsy', badgeName: 'Hive Badge', badgeIcon: '🐝', levelRequirement: 128, acePokemon: 'Scizor', rewardShards: 400, unlocked: false, defeated: false },
      { id: 11, region: 2, name: 'Whitney', badgeName: 'Plain Badge', badgeIcon: '⚪', levelRequirement: 140, acePokemon: 'Miltank', rewardShards: 450, unlocked: false, defeated: false },
      { id: 12, region: 2, name: 'Morty', badgeName: 'Fog Badge', badgeIcon: '🌫️', levelRequirement: 155, acePokemon: 'Gengar', rewardShards: 500, unlocked: false, defeated: false },
      { id: 13, region: 2, name: 'Chuck', badgeName: 'Storm Badge', badgeIcon: '🥊', levelRequirement: 170, acePokemon: 'Poliwrath', rewardShards: 550, unlocked: false, defeated: false },
      { id: 14, region: 2, name: 'Jasmine', badgeName: 'Mineral Badge', badgeIcon: '⚙️', levelRequirement: 182, acePokemon: 'Steelix', rewardShards: 600, unlocked: false, defeated: false },
      { id: 15, region: 2, name: 'Pryce', badgeName: 'Glacier Badge', badgeIcon: '❄️', levelRequirement: 192, acePokemon: 'Mamoswine', rewardShards: 650, unlocked: false, defeated: false },
      { id: 16, region: 2, name: 'Clair', badgeName: 'Rising Badge', badgeIcon: '🐉', levelRequirement: 200, acePokemon: 'Kingdra', rewardShards: 750, unlocked: false, defeated: false },
    ],
  },
  {
    id: 3,
    name: 'Hoenn',
    generation: 'Gen 3',
    levelRange: [201, 300],
    biomeTheme: 'hoenn_volcano',
    skyColor: '#ff8a65',
    groundColor: '#4e342e',
    ambientColor: '#ffccbc',
    fogColor: '#bcaaa4',
    gyms: [
      { id: 17, region: 3, name: 'Roxanne', badgeName: 'Stone Badge', badgeIcon: '🏛️', levelRequirement: 215, acePokemon: 'Nosepass', rewardShards: 800, unlocked: false, defeated: false },
      { id: 24, region: 3, name: 'Wallace', badgeName: 'Rain Badge', badgeIcon: '🌊', levelRequirement: 300, acePokemon: 'Milotic', rewardShards: 1200, unlocked: false, defeated: false },
    ],
  },
  {
    id: 4,
    name: 'Sinnoh',
    generation: 'Gen 4',
    levelRange: [301, 400],
    biomeTheme: 'sinnoh_snow',
    skyColor: '#90caf9',
    groundColor: '#eceff1',
    ambientColor: '#e1f5fe',
    fogColor: '#cfd8dc',
    gyms: [
      { id: 32, region: 4, name: 'Volkner', badgeName: 'Beacon Badge', badgeIcon: '💡', levelRequirement: 400, acePokemon: 'Electivire', rewardShards: 1800, unlocked: false, defeated: false },
    ],
  },
  {
    id: 5,
    name: 'Unova',
    generation: 'Gen 5',
    levelRange: [401, 500],
    biomeTheme: 'unova_city',
    skyColor: '#78909c',
    groundColor: '#37474f',
    ambientColor: '#cfd8dc',
    fogColor: '#90a4ae',
    gyms: [
      { id: 40, region: 5, name: 'Drayden', badgeName: 'Legend Badge', badgeIcon: '🐲', levelRequirement: 500, acePokemon: 'Haxorus', rewardShards: 2400, unlocked: false, defeated: false },
    ],
  },
  {
    id: 6,
    name: 'Kalos',
    generation: 'Gen 6',
    levelRange: [501, 600],
    biomeTheme: 'kalos_fairy',
    skyColor: '#f48fb1',
    groundColor: '#4a148c',
    ambientColor: '#fce4ec',
    fogColor: '#f8bbd0',
    gyms: [
      { id: 48, region: 6, name: 'Wulfric', badgeName: 'Iceberg Badge', badgeIcon: '🏔️', levelRequirement: 600, acePokemon: 'Avalugg', rewardShards: 3200, unlocked: false, defeated: false },
    ],
  },
  {
    id: 7,
    name: 'Alola',
    generation: 'Gen 7',
    levelRange: [601, 700],
    biomeTheme: 'alola_beach',
    skyColor: '#4dd0e1',
    groundColor: '#ffb74d',
    ambientColor: '#e0f7fa',
    fogColor: '#b2ebf2',
    gyms: [
      { id: 56, region: 7, name: 'Kahuna Hala', badgeName: 'Fightium Z', badgeIcon: '☀️', levelRequirement: 700, acePokemon: 'Crabominable', rewardShards: 4200, unlocked: false, defeated: false },
    ],
  },
  {
    id: 8,
    name: 'Galar',
    generation: 'Gen 8',
    levelRange: [701, 800],
    biomeTheme: 'galar_wild',
    skyColor: '#5c6bc0',
    groundColor: '#2e7d32',
    ambientColor: '#c5cae9',
    fogColor: '#9fa8da',
    gyms: [
      { id: 64, region: 8, name: 'Raihan', badgeName: 'Dragon Badge', badgeIcon: '🌪️', levelRequirement: 800, acePokemon: 'Duraludon', rewardShards: 5500, unlocked: false, defeated: false },
    ],
  },
  {
    id: 9,
    name: 'Paldea',
    generation: 'Gen 9',
    levelRange: [801, 900],
    biomeTheme: 'paldea_crater',
    skyColor: '#ab47bc',
    groundColor: '#311b92',
    ambientColor: '#f3e5f5',
    fogColor: '#ce93d8',
    gyms: [
      { id: 72, region: 9, name: 'Geeta (Top Champion)', badgeName: 'Spectra Core', badgeIcon: '💠', levelRequirement: 900, acePokemon: 'Glimmora', rewardShards: 10000, unlocked: false, defeated: false },
    ],
  },
];
