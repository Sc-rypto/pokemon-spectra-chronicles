// Tallgrass 1v1 Battle Mechanics & Data Types

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
  accuracy: number; // e.g. 100
  cooldown: number; // in seconds
  isGentleTap?: boolean; // Tallgrass Mechanic: Never KOs target, always leaves at least 1 HP!
  isFinishingRisk?: boolean; // Tallgrass Flag: warns player this attack risks knocking out target
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

// 1v1 Meadow Active Combatant (Tallgrass Battle State)
export interface Active1v1Combatant {
  pokemon: PokemonData;
  isPlayer: boolean;
  currentHp: number;
  maxHp: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  wanderTimer: number;
  lungeX: number;
  shakeX: number;
  attackCooldowns: Record<string, number>;
  lastAttackTimestamp: number;
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
  catchMultiplier?: number;
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
