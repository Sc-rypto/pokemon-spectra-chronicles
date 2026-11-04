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
  lastUsed?: number;
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
  capturedAt: number; // timestamp
  catchRegion: number;
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  ivs: PokemonIVs;
  evs: PokemonEVs;
  stats: PokemonStats;
  moves: Move[];
  heldItem?: string;
  nature: string;
  // Visual model configuration
  modelArchetype: 'quadruped' | 'biped' | 'draconic' | 'serpentine' | 'avian' | 'orb' | 'crystal_golem';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  scale: number;
}

export interface ActiveCombatant {
  pokemon: PokemonData;
  isPlayer: boolean;
  positionSlot: number; // 0 to 4 for squad, 0 to 3 for enemy waves
  currentHp: number;
  maxHp: number;
  targetSlot?: number;
  attackCooldowns: Record<string, number>; // moveId -> remaining cooldown in ms
  lastAttackTimestamp: number;
  statusEffect?: { type: 'burn' | 'freeze' | 'stun'; durationMs: number };
  isFainted: boolean;
  visual3dId: string;
}

export interface BuddyData {
  pokemonId: string; // references player pokemon id
  affectionLevel: number;
  passiveTree: {
    prismaticResonanceTier: number; // increases rare Prismatic spawns
    autoDowsingTier: number;        // auto-picks up shards and evolution stones
    hasteAuraTier: number;          // boosts squad attack speed
    goldHoarderTier: number;        // boosts poké-dollar drops
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
  rewardShards: number;
  unlocked: boolean;
  defeated: boolean;
}

export interface RegionInfo {
  id: number;
  name: string;
  generation: string;
  levelRange: [number, number];
  biomeTheme: 'kanto_grass' | 'johto_autumn' | 'hoenn_volcano' | 'sinnoh_snow' | 'unova_city' | 'kalos_fairy' | 'alola_beach' | 'galar_wild' | 'paldea_crater';
  skyColor: string;
  groundColor: string;
  ambientColor: string;
  fogColor: string;
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

export interface GTSListing {
  id: string;
  sellerName: string;
  pokemon: PokemonData;
  price: number; // Poke-dollars or Shards
  currency: 'dollars' | 'shards';
  listedTimestamp: number;
}

export interface RaidBoss {
  id: string;
  name: string;
  tier: 'Gamma' | 'Omega' | 'Cosmic';
  level: number;
  element: ElementalType;
  maxHp: number;
  currentHp: number;
  prismaticTier: PrismaticTier;
  participants: { id: string; name: string; damageDealt: number; avatarUrl: string }[];
  timeRemainingSeconds: number;
}
