import { PokemonData, PokemonIVs, PokemonEVs, PokemonStats, PrismaticTier, RegionInfo, Move, ElementalType } from '../types/game';
import allPokemonRaw from './allPokemonMeta.json';
import { ALL_72_GYM_LEADERS } from './gymLeadersData';
import { REGION_LEGENDARIES, getSpeciesRarityAndCatchRate } from './rarityAndLegendaries';

export interface PokemonSpeciesEntry {
  dex: number;
  name: string;
  gen: number;
}

export const ALL_POKEMON_ENTRIES: PokemonSpeciesEntry[] = allPokemonRaw as PokemonSpeciesEntry[];

// SVG Icons & Sprite URLs for items, balls, and badges (Pure asset sprites, zero emojis)
export const ASSET_ICONS = {
  pokeBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  greatBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  ultraBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  masterBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  prismaticShard: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/prism-scale.png',
  potion: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png',
  maxPotion: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-potion.png',
  revive: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/revive.png',
  currencyCoin: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/amulet-coin.png',
  rareCandy: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
  expCandyL: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-candy-l.png',
};

// Return animated Showdown GIF + official artwork fallback
export function getPokemonSpriteUrls(dex: number, tier: PrismaticTier = 'Standard'): { sprite: string; artwork: string } {
  const isShiny = tier === 'Shiny';
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${dex}.gif`;
  const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${dex}.png`;

  return { sprite, artwork };
}

// Custom CSS Filters for the Custom Prismatic Variant Sprites
export function getPrismaticSpriteStyle(tier: PrismaticTier): {
  filterStyle: string;
  badgeClass: string;
  auraClass: string;
  label: string;
} {
  switch (tier) {
    case 'Supernova':
      return {
        filterStyle: 'brightness(0.85) contrast(1.7) saturate(2.4) hue-rotate(335deg) drop-shadow(0 0 10px #f59e0b) drop-shadow(0 0 18px #ea580c)',
        badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-lg shadow-amber-950/50',
        auraClass: 'animate-pulse ring-2 ring-amber-400',
        label: 'Supernova (1/65,536)',
      };
    case 'Ethereal':
      return {
        filterStyle: 'brightness(1.25) contrast(1.3) saturate(1.8) hue-rotate(180deg) drop-shadow(0 0 8px #06b6d4) drop-shadow(0 0 16px #3b82f6)',
        badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/70 shadow-lg shadow-cyan-950/50',
        auraClass: 'ring-2 ring-cyan-400',
        label: 'Ethereal (1/32,768)',
      };
    case 'Radiant':
      return {
        filterStyle: 'brightness(1.15) contrast(1.5) saturate(2.0) hue-rotate(95deg) drop-shadow(0 0 8px #10b981) drop-shadow(0 0 14px #ec4899)',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/70 shadow-lg shadow-emerald-950/50',
        auraClass: 'ring-1 ring-emerald-400',
        label: 'Radiant (1/16,384)',
      };
    case 'Shiny':
      return {
        filterStyle: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.8))',
        badgeClass: 'bg-yellow-950/70 text-yellow-300 border border-yellow-500/60',
        auraClass: 'ring-1 ring-yellow-400',
        label: 'Shiny (1/4,096)',
      };
    default:
      return {
        filterStyle: '',
        badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
        auraClass: '',
        label: 'Standard',
      };
  }
}

// Tallgrass / Pokemon Official Type Effectiveness Matrix
export const TYPE_CHART: Record<ElementalType, Partial<Record<ElementalType, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2.0, Ice: 2.0, Bug: 2.0, Rock: 0.5, Dragon: 0.5, Steel: 2.0 },
  Water: { Fire: 2.0, Water: 0.5, Grass: 0.5, Ground: 2.0, Rock: 2.0, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2.0, Grass: 0.5, Poison: 0.5, Ground: 2.0, Flying: 0.5, Bug: 0.5, Rock: 2.0, Dragon: 0.5, Steel: 0.5 },
  Electric: { Water: 2.0, Grass: 0.5, Electric: 0.5, Ground: 0, Flying: 2.0, Dragon: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2.0, Ice: 0.5, Ground: 2.0, Flying: 2.0, Dragon: 2.0, Steel: 0.5 },
  Fighting: { Normal: 2.0, Ice: 2.0, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2.0, Ghost: 0, Dark: 2.0, Steel: 2.0, Fairy: 0.5 },
  Poison: { Grass: 2.0, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2.0 },
  Ground: { Fire: 2.0, Grass: 0.5, Electric: 2.0, Poison: 2.0, Flying: 0, Bug: 0.5, Rock: 2.0, Steel: 2.0 },
  Flying: { Grass: 2.0, Electric: 0.5, Fighting: 2.0, Bug: 2.0, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2.0, Poison: 2.0, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2.0, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2.0, Ghost: 0.5, Dark: 2.0, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2.0, Ice: 2.0, Fighting: 0.5, Ground: 0.5, Flying: 2.0, Bug: 2.0, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2.0, Ghost: 2.0, Dark: 0.5 },
  Dragon: { Dragon: 2.0, Steel: 0.5, Fairy: 0 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2.0, Rock: 2.0, Steel: 0.5, Fairy: 2.0 },
  Fairy: { Fire: 0.5, Fighting: 2.0, Poison: 0.5, Dragon: 2.0, Dark: 2.0, Steel: 0.5 },
  Dark: { Fighting: 0.5, Psychic: 2.0, Ghost: 2.0, Dark: 0.5, Fairy: 0.5 },
};

export function calculateTypeMultiplier(moveType: ElementalType, targetTypes: ElementalType[]): number {
  let mult = 1.0;
  targetTypes.forEach(t => {
    const val = TYPE_CHART[moveType]?.[t];
    if (val !== undefined) mult *= val;
  });
  return mult;
}

export const TYPE_PALETTES: Record<ElementalType, { primary: string; secondary: string; accent: string }> = {
  Fire: { primary: '#e06020', secondary: '#f8d030', accent: '#ff4500' },
  Water: { primary: '#3878d8', secondary: '#6890f0', accent: '#00d2ff' },
  Grass: { primary: '#48a890', secondary: '#78c850', accent: '#a0e575' },
  Electric: { primary: '#ffd820', secondary: '#f8d030', accent: '#fffa65' },
  Ice: { primary: '#98d8d8', secondary: '#e0f8f8', accent: '#70d6ff' },
  Fighting: { primary: '#c03028', secondary: '#7f1d1d', accent: '#ff6b6b' },
  Poison: { primary: '#a040a0', secondary: '#c183c1', accent: '#e056fd' },
  Ground: { primary: '#e0c068', secondary: '#d4a373', accent: '#b08968' },
  Flying: { primary: '#a890f0', secondary: '#c6b7f5', accent: '#e0aaff' },
  Psychic: { primary: '#f85888', secondary: '#fa92b2', accent: '#ff70a6' },
  Bug: { primary: '#a8b820', secondary: '#c6d16e', accent: '#d4e09b' },
  Rock: { primary: '#b8a038', secondary: '#d1c17d', accent: '#9c6644' },
  Ghost: { primary: '#705898', secondary: '#493963', accent: '#9d4edd' },
  Dragon: { primary: '#7038f8', secondary: '#4c08e6', accent: '#7b2cbf' },
  Steel: { primary: '#b8b8d0', secondary: '#9292a8', accent: '#e2eafc' },
  Fairy: { primary: '#ee99ac', secondary: '#f4bdc9', accent: '#ffccd5' },
  Dark: { primary: '#705848', secondary: '#48392f', accent: '#212529' },
  Normal: { primary: '#a8a878', secondary: '#c6c6a7', accent: '#e9edc9' },
};

export function getTypesForDex(dex: number): [ElementalType] | [ElementalType, ElementalType] {
  const typeCycle: ElementalType[] = [
    'Grass', 'Fire', 'Water', 'Bug', 'Normal', 'Flying', 'Poison', 'Electric', 
    'Ground', 'Fairy', 'Fighting', 'Psychic', 'Rock', 'Steel', 'Ice', 'Ghost', 'Dragon', 'Dark'
  ];
  const primary = typeCycle[(dex * 7) % typeCycle.length];
  if (dex % 3 === 0) {
    const secondary = typeCycle[(dex * 13) % typeCycle.length];
    if (secondary !== primary) return [primary, secondary];
  }
  return [primary];
}

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
  const mult = 1 + bonusResonance * 0.5;
  const roll = Math.random();

  if (roll < (1 / 65536) * mult * 35) return 'Supernova';
  if (roll < (1 / 32768) * mult * 45) return 'Ethereal';
  if (roll < (1 / 16384) * mult * 60) return 'Radiant';
  if (roll < (1 / 4096) * mult * 80) return 'Shiny';
  return 'Standard';
}

// Official Tallgrass Move Templates + Signature "Gentle Tap" Mechanic
export const GENTLE_TAP_MOVE: Move = {
  id: 'm_gentle_tap',
  name: 'Gentle Tap',
  type: 'Normal',
  power: 20,
  accuracy: 100,
  cooldown: 1.0,
  isGentleTap: true,
  description: 'A gentle attack that weakens wild Pokémon but ALWAYS leaves at least 1 HP to ensure a safe capture!',
};

export const SAMPLE_MOVES: Record<string, Move> = {
  tackle: { id: 'm1', name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, cooldown: 1.5, description: 'A physical charge attack.' },
  flamethrower: { id: 'm2', name: 'Flamethrower', type: 'Fire', power: 90, accuracy: 100, cooldown: 3.2, description: 'Intense blast of fire with burn potential.' },
  hydropump: { id: 'm3', name: 'Hydro Pump', type: 'Water', power: 110, accuracy: 80, cooldown: 4.2, description: 'High-pressure water cannon.' },
  solarbeam: { id: 'm4', name: 'Solar Beam', type: 'Grass', power: 120, accuracy: 100, cooldown: 4.8, description: 'Condensed sunlight energy beam.' },
  thunderbolt: { id: 'm5', name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, cooldown: 3.2, description: 'Powerful shock with stun potential.' },
  dragonclaw: { id: 'm6', name: 'Dragon Claw', type: 'Dragon', power: 80, accuracy: 100, cooldown: 2.8, description: 'Sharp claws slash through targets.' },
  shadowball: { id: 'm7', name: 'Shadow Ball', type: 'Ghost', power: 80, accuracy: 100, cooldown: 3.0, description: 'Dark shadowy sphere.' },
  psychic: { id: 'm8', name: 'Psychic', type: 'Psychic', power: 90, accuracy: 100, cooldown: 3.2, description: 'Strong telekinetic wave.' },
  icebeam: { id: 'm9', name: 'Ice Beam', type: 'Ice', power: 90, accuracy: 100, cooldown: 3.6, description: 'Freezing ray.' },
  earthquake: { id: 'm10', name: 'Earthquake', type: 'Ground', power: 100, accuracy: 100, cooldown: 4.0, description: 'Massive tremors.' },
  moonblast: { id: 'm11', name: 'Moonblast', type: 'Fairy', power: 95, accuracy: 100, cooldown: 3.5, description: 'Borrowing the power of the moon.' },
  aurasphere: { id: 'm12', name: 'Aura Sphere', type: 'Fighting', power: 80, accuracy: 100, cooldown: 2.5, description: 'Pure inner aura blast.' },
};

export function getMovesForType(type: ElementalType): Move[] {
  // Always include Gentle Tap as slot #1 for Tallgrass catching mechanics
  const gentle = { ...GENTLE_TAP_MOVE };
  switch (type) {
    case 'Fire': return [gentle, SAMPLE_MOVES.flamethrower, SAMPLE_MOVES.tackle];
    case 'Water': return [gentle, SAMPLE_MOVES.hydropump, SAMPLE_MOVES.tackle];
    case 'Grass': return [gentle, SAMPLE_MOVES.solarbeam, SAMPLE_MOVES.tackle];
    case 'Electric': return [gentle, SAMPLE_MOVES.thunderbolt, SAMPLE_MOVES.tackle];
    case 'Ice': return [gentle, SAMPLE_MOVES.icebeam, SAMPLE_MOVES.tackle];
    case 'Fighting': return [gentle, SAMPLE_MOVES.aurasphere, SAMPLE_MOVES.tackle];
    case 'Ghost': return [gentle, SAMPLE_MOVES.shadowball, SAMPLE_MOVES.tackle];
    case 'Dragon': return [gentle, SAMPLE_MOVES.dragonclaw, SAMPLE_MOVES.flamethrower];
    case 'Psychic': return [gentle, SAMPLE_MOVES.psychic, SAMPLE_MOVES.shadowball];
    case 'Fairy': return [gentle, SAMPLE_MOVES.moonblast, SAMPLE_MOVES.psychic];
    case 'Ground': return [gentle, SAMPLE_MOVES.earthquake, SAMPLE_MOVES.tackle];
    default: return [gentle, SAMPLE_MOVES.tackle, SAMPLE_MOVES.dragonclaw];
  }
}

export function createPokemonInstanceByDex(
  dex: number,
  level: number,
  forcedTier?: PrismaticTier,
  bonusResonance: number = 0
): PokemonData {
  const entry = ALL_POKEMON_ENTRIES[dex - 1] || ALL_POKEMON_ENTRIES[0];
  const types = getTypesForDex(dex);
  const palette = TYPE_PALETTES[types[0]];
  const tier = forcedTier || rollPrismaticTier(bonusResonance);

  const baseStats = {
    hp: 60 + (dex % 50),
    atk: 65 + ((dex * 3) % 65),
    def: 60 + ((dex * 5) % 60),
    spa: 65 + ((dex * 7) % 65),
    spd: 60 + ((dex * 11) % 60),
    spe: 65 + ((dex * 13) % 65),
  };

  const ivs = generateRandomIVs();
  const evs: PokemonEVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  const stats = calculatePokemonStats(baseStats, ivs, evs, level);
  const moves = getMovesForType(types[0]);
  const urls = getPokemonSpriteUrls(dex, tier);
  const rarityInfo = getSpeciesRarityAndCatchRate(dex);

  return {
    id: `pk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    dexNumber: dex,
    speciesName: entry.name,
    level,
    currentExp: 0,
    expToNextLevel: level * 100,
    types,
    prismaticTier: tier,
    capturedAt: Date.now(),
    catchRegion: entry.gen,
    baseStats,
    ivs,
    evs,
    stats,
    moves,
    nature: 'Hardy',
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    scale: 1.0,
    spriteUrl: urls.sprite,
    artworkUrl: urls.artwork,
    catchRate: rarityInfo.catchRate,
    rarityTier: rarityInfo.rarityTier,
  };
}

export const REGIONS_DATA: RegionInfo[] = [
  {
    id: 1,
    name: 'Kanto',
    generation: 'Gen 1',
    dexRange: [1, 151],
    levelRange: [1, 100],
    biomeTheme: 'kanto_grass',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/1.png',
    legendaryDex: REGION_LEGENDARIES[1],
    gyms: ALL_72_GYM_LEADERS[1],
  },
  {
    id: 2,
    name: 'Johto',
    generation: 'Gen 2',
    dexRange: [152, 251],
    levelRange: [101, 200],
    biomeTheme: 'johto_autumn',
    bgGradient: 'from-amber-950 via-stone-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/9.png',
    legendaryDex: REGION_LEGENDARIES[2],
    gyms: ALL_72_GYM_LEADERS[2],
  },
  {
    id: 3,
    name: 'Hoenn',
    generation: 'Gen 3',
    dexRange: [252, 386],
    levelRange: [201, 300],
    biomeTheme: 'hoenn_volcano',
    bgGradient: 'from-orange-950 via-red-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magma-stone.png',
    legendaryDex: REGION_LEGENDARIES[3],
    gyms: ALL_72_GYM_LEADERS[3],
  },
  {
    id: 4,
    name: 'Sinnoh',
    generation: 'Gen 4',
    dexRange: [387, 493],
    levelRange: [301, 400],
    biomeTheme: 'sinnoh_snow',
    bgGradient: 'from-sky-950 via-slate-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/icicle-plate.png',
    legendaryDex: REGION_LEGENDARIES[4],
    gyms: ALL_72_GYM_LEADERS[4],
  },
  {
    id: 5,
    name: 'Unova',
    generation: 'Gen 5',
    dexRange: [494, 649],
    levelRange: [401, 500],
    biomeTheme: 'unova_city',
    bgGradient: 'from-blue-950 via-slate-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/draco-plate.png',
    legendaryDex: REGION_LEGENDARIES[5],
    gyms: ALL_72_GYM_LEADERS[5],
  },
  {
    id: 6,
    name: 'Kalos',
    generation: 'Gen 6',
    dexRange: [650, 721],
    levelRange: [501, 600],
    biomeTheme: 'kalos_fairy',
    bgGradient: 'from-fuchsia-950 via-purple-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pixie-plate.png',
    legendaryDex: REGION_LEGENDARIES[6],
    gyms: ALL_72_GYM_LEADERS[6],
  },
  {
    id: 7,
    name: 'Alola',
    generation: 'Gen 7',
    dexRange: [722, 809],
    levelRange: [601, 700],
    biomeTheme: 'alola_beach',
    bgGradient: 'from-cyan-950 via-emerald-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sun-stone.png',
    legendaryDex: REGION_LEGENDARIES[7],
    gyms: ALL_72_GYM_LEADERS[7],
  },
  {
    id: 8,
    name: 'Galar',
    generation: 'Gen 8',
    dexRange: [810, 905],
    levelRange: [701, 800],
    biomeTheme: 'galar_wild',
    bgGradient: 'from-indigo-950 via-violet-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rusty-sword.png',
    legendaryDex: REGION_LEGENDARIES[8],
    gyms: ALL_72_GYM_LEADERS[8],
  },
  {
    id: 9,
    name: 'Paldea',
    generation: 'Gen 9',
    dexRange: [906, 1025],
    levelRange: [801, 900],
    biomeTheme: 'paldea_crater',
    bgGradient: 'from-purple-950 via-rose-950 to-slate-950',
    badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/booster-energy.png',
    legendaryDex: REGION_LEGENDARIES[9],
    gyms: ALL_72_GYM_LEADERS[9],
  },
];
