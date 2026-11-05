// Types for Pokémon: Spectra Chronicles

export type PrismaticTier = 'Standard' | 'Shiny' | 'Radiant' | 'Ethereal' | 'Supernova';

export type ElementalType = 
  | 'Normal' | 'Fire' | 'Water' | 'Grass' | 'Electric' | 'Ice' 
  | 'Fighting' | 'Poison' | 'Ground' | 'Flying' | 'Psychic' | 'Bug' 
  | 'Rock' | 'Ghost' | 'Dragon' | 'Steel' | 'Fairy' | 'Dark';

export interface Move {
  id: string;
  name: string;
  type: ElementalType;
  power: number;
  cooldown: number; // in seconds
  priorityTier: 1 | 2 | 3; // 1 = High, 2 = Mid, 3 = Low
  effect?: 'burn' | 'freeze' | 'stun' | 'heal' | 'aoe' | 'buff_atk';
  description: string;
}

export interface PokemonStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonIVs {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonEVs {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface PokemonData {
  id: string;
  dexNumber: number;
  speciesName: string;
  customNickname?: string;
  level: number;
  currentExp: number;
  expToNextLevel: number;
  types: [ElementalType] | [ElementalType, ElementalType];
  prismaticTier: PrismaticTier;
  capturedAt: number;
  catchRegion: number;
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: PokemonIVs;
  evs: PokemonEVs;
  stats: PokemonStats;
  moves: Move[];
  heldItem?: string;
  nature: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  scale: number;
  spriteUrl: string;
  artworkUrl: string;
}

export interface ActiveCombatant {
  pokemon: PokemonData;
  isPlayer: boolean;
  positionSlot: number;
  currentHp: number;
  maxHp: number;
  // 2D Canvas Meadow Roaming Position (in % 0-100 of meadow area)
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  wanderTimer: number;
  attackCooldowns: Record<string, number>;
  lastAttackTimestamp: number;
  isFainted: boolean;
  visualId: string;
  lungeProgress: number; // 0 to 1 for physical attack dash
  shakeTimer: number;
}

export interface BuddyData {
  pokemonId: string;
  affectionLevel: number;
  passiveTree: {
    prismaticResonanceTier: number;
    autoDowsingTier: number;
    hasteAuraTier: number;
    goldHoarderTier: number;
  };
}

export interface AutoCatchSettings {
  enabled: boolean;
  targetPrismaticOnly: boolean;
  minTierToThrow: PrismaticTier;
  catchUnregistered: boolean;
  autoFaintStandardDuplicates: boolean;
  preferredBall: 'poke' | 'great' | 'ultra' | 'prismatic';
}

export interface GymLeader {
  id: number;
  region: number;
  name: string;
  badgeName: string;
  badgeIcon: string;
  levelRequirement: number;
  acePokemon: string;
  aceDexNumber: number;
  rewardShards: number;
  rewardDollars: number;
  unlocked: boolean;
  defeated: boolean;
}

export interface RegionInfo {
  id: number;
  name: string;
  generation: string;
  dexRange: [number, number];
  levelRange: [number, number];
  biomeTheme: 'kanto_grass' | 'johto_autumn' | 'hoenn_volcano' | 'sinnoh_snow' | 'unova_city' | 'kalos_fairy' | 'alola_beach' | 'galar_wild' | 'paldea_crater';
  bgGradient: string;
  badgeIcon: string;
  gyms: GymLeader[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'balls' | 'potions' | 'held' | 'materials' | 'shaders';
  count: number;
  price: number;
  shardPrice?: number;
  description: string;
  icon: string;
}

export interface MarketListing {
  id: string;
  sellerTrainerName: string;
  isPlayerListing: boolean;
  pokemon: PokemonData;
  price: number;
  currency: 'dollars' | 'shards';
  listedTimestamp: number;
}

export interface RaidBossState {
  id: string;
  name: string;
  dexNumber: number;
  tier: 'Cosmic Alpha' | 'Omega Prismatic' | 'Ancient Rift';
  level: number;
  element: ElementalType;
  maxHp: number;
  currentHp: number;
  prismaticTier: PrismaticTier;
  active: boolean;
  totalDamageDealt: number;
  spriteUrl: string;
  artworkUrl: string;
}
