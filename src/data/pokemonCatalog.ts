import { PokemonData, PokemonIVs, PokemonEVs, PokemonStats, PrismaticTier, RegionInfo, Move, ElementalType } from '../types/game';
import allPokemonRaw from './allPokemonMeta.json';

export interface PokemonSpeciesEntry {
  dex: number;
  name: string;
  gen: number;
}

export const ALL_POKEMON_ENTRIES: PokemonSpeciesEntry[] = allPokemonRaw as PokemonSpeciesEntry[];

// SVG Icons & Sprite URLs for items, balls, and badges (No emojis!)
export const ASSET_ICONS = {
  pokeBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  greatBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  ultraBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png',
  masterBall: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
  prismaticShard: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/prism-scale.png',
  potion: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png',
  currencyCoin: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/amulet-coin.png',
  rareCandy: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png',
};

// Return animated Showdown GIF + official artwork fallback
export function getPokemonSpriteUrls(dex: number, tier: PrismaticTier = 'Standard'): { sprite: string; artwork: string } {
  const isShiny = tier === 'Shiny';
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${dex}.gif`;
  const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${dex}.png`;

  return { sprite, artwork };
}

// Custom CSS Filters & SVGs for the Custom Prismatic Variant Sprites
export function getPrismaticSpriteStyle(tier: PrismaticTier): {
  filterStyle: string;
  badgeClass: string;
  auraClass: string;
  label: string;
} {
  switch (tier) {
    case 'Supernova':
      // Obsidian shell with fiery incandescent molten solar corona
      return {
        filterStyle: 'brightness(0.85) contrast(1.7) saturate(2.4) hue-rotate(335deg) drop-shadow(0 0 10px #f59e0b) drop-shadow(0 0 18px #ea580c)',
        badgeClass: 'bg-amber-950/80 text-amber-300 border border-amber-500/70 shadow-lg shadow-amber-950/50',
        auraClass: 'animate-pulse ring-2 ring-amber-400',
        label: 'Supernova (1/65,536)',
      };
    case 'Ethereal':
      // Translucent cosmic crystal starfield glow
      return {
        filterStyle: 'brightness(1.25) contrast(1.3) saturate(1.8) hue-rotate(180deg) drop-shadow(0 0 8px #06b6d4) drop-shadow(0 0 16px #3b82f6)',
        badgeClass: 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/70 shadow-lg shadow-cyan-950/50',
        auraClass: 'ring-2 ring-cyan-400',
        label: 'Ethereal (1/32,768)',
      };
    case 'Radiant':
      // Neon color-shifted celestial aura
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

export const SAMPLE_MOVES: Record<string, Move> = {
  tackle: { id: 'm1', name: 'Tackle', type: 'Normal', power: 40, cooldown: 1.5, priorityTier: 3, description: 'A physical charge attack.' },
  flamethrower: { id: 'm2', name: 'Flamethrower', type: 'Fire', power: 90, cooldown: 3.5, priorityTier: 1, effect: 'burn', description: 'Intense blast of fire.' },
  hydropump: { id: 'm3', name: 'Hydro Pump', type: 'Water', power: 110, cooldown: 4.5, priorityTier: 1, description: 'High-pressure water cannon.' },
  solarbeam: { id: 'm4', name: 'Solar Beam', type: 'Grass', power: 120, cooldown: 5.0, priorityTier: 1, description: 'Condensed sunlight energy beam.' },
  thunderbolt: { id: 'm5', name: 'Thunderbolt', type: 'Electric', power: 90, cooldown: 3.5, priorityTier: 1, effect: 'stun', description: 'Powerful shock with stun chance.' },
  dragonclaw: { id: 'm6', name: 'Dragon Claw', type: 'Dragon', power: 80, cooldown: 2.8, priorityTier: 2, description: 'Sharp claws slash through targets.' },
  shadowball: { id: 'm7', name: 'Shadow Ball', type: 'Ghost', power: 80, cooldown: 3.0, priorityTier: 2, description: 'Dark shadowy sphere.' },
  psychic: { id: 'm8', name: 'Psychic', type: 'Psychic', power: 90, cooldown: 3.2, priorityTier: 1, description: 'Strong telekinetic wave.' },
  icebeam: { id: 'm9', name: 'Ice Beam', type: 'Ice', power: 90, cooldown: 3.8, priorityTier: 1, effect: 'freeze', description: 'Freezing ray.' },
  earthquake: { id: 'm10', name: 'Earthquake', type: 'Ground', power: 100, cooldown: 4.2, priorityTier: 1, effect: 'aoe', description: 'Massive tremors.' },
  moonblast: { id: 'm11', name: 'Moonblast', type: 'Fairy', power: 95, cooldown: 3.6, priorityTier: 1, description: 'Borrowing the power of the moon.' },
  aurasphere: { id: 'm12', name: 'Aura Sphere', type: 'Fighting', power: 80, cooldown: 2.5, priorityTier: 2, description: 'Pure inner aura blast.' },
};

export function getMovesForType(type: ElementalType): Move[] {
  switch (type) {
    case 'Fire': return [SAMPLE_MOVES.flamethrower, SAMPLE_MOVES.tackle];
    case 'Water': return [SAMPLE_MOVES.hydropump, SAMPLE_MOVES.tackle];
    case 'Grass': return [SAMPLE_MOVES.solarbeam, SAMPLE_MOVES.tackle];
    case 'Electric': return [SAMPLE_MOVES.thunderbolt, SAMPLE_MOVES.tackle];
    case 'Ice': return [SAMPLE_MOVES.icebeam, SAMPLE_MOVES.tackle];
    case 'Fighting': return [SAMPLE_MOVES.aurasphere, SAMPLE_MOVES.tackle];
    case 'Ghost': return [SAMPLE_MOVES.shadowball, SAMPLE_MOVES.tackle];
    case 'Dragon': return [SAMPLE_MOVES.dragonclaw, SAMPLE_MOVES.flamethrower];
    case 'Psychic': return [SAMPLE_MOVES.psychic, SAMPLE_MOVES.shadowball];
    case 'Fairy': return [SAMPLE_MOVES.moonblast, SAMPLE_MOVES.psychic];
    case 'Ground': return [SAMPLE_MOVES.earthquake, SAMPLE_MOVES.tackle];
    default: return [SAMPLE_MOVES.tackle, SAMPLE_MOVES.dragonclaw];
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
    gyms: [
      { id: 1, region: 1, name: 'Brock', badgeName: 'Boulder Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/1.png', levelRequirement: 14, acePokemon: 'Onix', aceDexNumber: 95, rewardShards: 50, rewardDollars: 2500, unlocked: true, defeated: true },
      { id: 2, region: 1, name: 'Misty', badgeName: 'Cascade Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/2.png', levelRequirement: 25, acePokemon: 'Starmie', aceDexNumber: 121, rewardShards: 75, rewardDollars: 4000, unlocked: true, defeated: true },
      { id: 3, region: 1, name: 'Lt. Surge', badgeName: 'Thunder Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/3.png', levelRequirement: 38, acePokemon: 'Raichu', aceDexNumber: 26, rewardShards: 100, rewardDollars: 6000, unlocked: true, defeated: false },
      { id: 4, region: 1, name: 'Erika', badgeName: 'Rainbow Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/4.png', levelRequirement: 50, acePokemon: 'Vileplume', aceDexNumber: 45, rewardShards: 120, rewardDollars: 8000, unlocked: false, defeated: false },
      { id: 5, region: 1, name: 'Koga', badgeName: 'Soul Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/5.png', levelRequirement: 65, acePokemon: 'Weezing', aceDexNumber: 110, rewardShards: 150, rewardDollars: 11000, unlocked: false, defeated: false },
      { id: 6, region: 1, name: 'Sabrina', badgeName: 'Marsh Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/6.png', levelRequirement: 78, acePokemon: 'Alakazam', aceDexNumber: 65, rewardShards: 180, rewardDollars: 14000, unlocked: false, defeated: false },
      { id: 7, region: 1, name: 'Blaine', badgeName: 'Volcano Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/7.png', levelRequirement: 88, acePokemon: 'Magmar', aceDexNumber: 126, rewardShards: 220, rewardDollars: 18000, unlocked: false, defeated: false },
      { id: 8, region: 1, name: 'Giovanni', badgeName: 'Earth Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/8.png', levelRequirement: 100, acePokemon: 'Rhydon', aceDexNumber: 112, rewardShards: 300, rewardDollars: 25000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 9, region: 2, name: 'Falkner', badgeName: 'Zephyr Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/9.png', levelRequirement: 115, acePokemon: 'Pidgeot', aceDexNumber: 18, rewardShards: 350, rewardDollars: 30000, unlocked: false, defeated: false },
      { id: 10, region: 2, name: 'Bugsy', badgeName: 'Hive Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/10.png', levelRequirement: 128, acePokemon: 'Scizor', aceDexNumber: 212, rewardShards: 400, rewardDollars: 35000, unlocked: false, defeated: false },
      { id: 11, region: 2, name: 'Whitney', badgeName: 'Plain Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/11.png', levelRequirement: 140, acePokemon: 'Miltank', aceDexNumber: 241, rewardShards: 450, rewardDollars: 40000, unlocked: false, defeated: false },
      { id: 12, region: 2, name: 'Morty', badgeName: 'Fog Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/12.png', levelRequirement: 155, acePokemon: 'Gengar', aceDexNumber: 94, rewardShards: 500, rewardDollars: 45000, unlocked: false, defeated: false },
      { id: 13, region: 2, name: 'Chuck', badgeName: 'Storm Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/13.png', levelRequirement: 170, acePokemon: 'Poliwrath', aceDexNumber: 62, rewardShards: 550, rewardDollars: 50000, unlocked: false, defeated: false },
      { id: 14, region: 2, name: 'Jasmine', badgeName: 'Mineral Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/14.png', levelRequirement: 182, acePokemon: 'Steelix', aceDexNumber: 208, rewardShards: 600, rewardDollars: 55000, unlocked: false, defeated: false },
      { id: 15, region: 2, name: 'Pryce', badgeName: 'Glacier Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/15.png', levelRequirement: 192, acePokemon: 'Mamoswine', aceDexNumber: 473, rewardShards: 650, rewardDollars: 60000, unlocked: false, defeated: false },
      { id: 16, region: 2, name: 'Clair', badgeName: 'Rising Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/16.png', levelRequirement: 200, acePokemon: 'Kingdra', aceDexNumber: 230, rewardShards: 750, rewardDollars: 70000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 17, region: 3, name: 'Roxanne', badgeName: 'Stone Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hard-stone.png', levelRequirement: 215, acePokemon: 'Nosepass', aceDexNumber: 299, rewardShards: 800, rewardDollars: 75000, unlocked: false, defeated: false },
      { id: 24, region: 3, name: 'Wallace', badgeName: 'Rain Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/water-stone.png', levelRequirement: 300, acePokemon: 'Milotic', aceDexNumber: 350, rewardShards: 1200, rewardDollars: 100000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 32, region: 4, name: 'Volkner', badgeName: 'Beacon Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zap-plate.png', levelRequirement: 400, acePokemon: 'Electivire', aceDexNumber: 466, rewardShards: 1800, rewardDollars: 150000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 40, region: 5, name: 'Drayden', badgeName: 'Legend Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-scale.png', levelRequirement: 500, acePokemon: 'Haxorus', aceDexNumber: 612, rewardShards: 2400, rewardDollars: 200000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 48, region: 6, name: 'Wulfric', badgeName: 'Iceberg Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/never-melt-ice.png', levelRequirement: 600, acePokemon: 'Avalugg', aceDexNumber: 713, rewardShards: 3200, rewardDollars: 260000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 56, region: 7, name: 'Kahuna Hala', badgeName: 'Fightium Z', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/fist-plate.png', levelRequirement: 700, acePokemon: 'Crabominable', aceDexNumber: 740, rewardShards: 4200, rewardDollars: 350000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 64, region: 8, name: 'Raihan', badgeName: 'Dragon Badge', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dragon-fang.png', levelRequirement: 800, acePokemon: 'Duraludon', aceDexNumber: 884, rewardShards: 5500, rewardDollars: 450000, unlocked: false, defeated: false },
    ],
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
    gyms: [
      { id: 72, region: 9, name: 'Geeta', badgeName: 'Spectra Core', badgeIcon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tera-orb.png', levelRequirement: 900, acePokemon: 'Glimmora', aceDexNumber: 970, rewardShards: 10000, rewardDollars: 1000000, unlocked: false, defeated: false },
    ],
  },
];
