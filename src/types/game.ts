// Complete Data Types for Pokémon: Spectra Chronicles

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
  accuracy: number;
  cooldown: number; // in seconds
  isGentleTap?: boolean;
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
  catchRate: number; // 3 (legendary) to 255 (common)
  rarityTier: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  isFainted?: boolean;
  faintedUntilTimestamp?: number;
  isAlpha?: boolean;
}

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

export interface GymLeader {
  id: number;
  region: number;
  cityName: string;
  name: string;
  badgeName: string;
  badgeIcon: string;
  type: ElementalType;
  levelRequirement: number;
  acePokemon: string;
  aceDexNumber: number;
  rewardShards: number;
  rewardDollars: number;
  wavesRequiredToChallenge: number;
  unlocked: boolean;
  defeated: boolean;
  // Full gym leader party for real main-series battles
  party: { dex: number; name: string; level: number; types: [ElementalType] | [ElementalType, ElementalType] }[];
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
  legendaryDex: number[]; // Unlocked only after clearing all gyms in region
  gyms: GymLeader[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'balls' | 'potions' | 'held' | 'materials' | 'orbs' | 'candies' | 'stones';
  pocket?: 'items' | 'medicine' | 'balls' | 'berries';
  count: number;
  price: number;
  shardPrice?: number;
  description: string;
  icon: string;
  catchMultiplier?: number;
  usableOnPokemon?: boolean;
  effectType?: 'heal_hp' | 'revive' | 'full_heal' | 'rare_candy' | 'exp_candy' | 'evolution';
  effectValue?: number;
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

// Active Animated Gym Battle Arena Session
export interface GymBattleSession {
  gymId: number;
  gymLeader: GymLeader;
  trainerCurrentPokemonIdx: number;
  leaderCurrentPokemonIdx: number;
  leaderCurrentHp: number;
  leaderMaxHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
  turnPhase: 'intro' | 'player_choose' | 'player_attack' | 'leader_attack' | 'victory' | 'defeat';
  battleDialog: string;
  isCompleted: boolean;
}

// PokéRogue-Style Item Pick Rewards
export interface RogueRewardOption {
  id: string;
  name: string;
  category: 'orbs' | 'potions' | 'candy' | 'stat_booster' | 'money' | 'shards';
  description: string;
  icon: string;
  rarity: 'Common' | 'Great' | 'Ultra' | 'Master';
  applyReward: (state: any) => void;
}

export interface AutoCatchSettings {
  enabled: boolean;
  targetPrismaticOnly: boolean;
  minTierToThrow: PrismaticTier;
  catchUnregistered: boolean;
  autoFaintStandardDuplicates: boolean;
  preferredBall: string;
  hpThresholdPercent: number; // Only throw when wild HP <= this percentage
  whitelistedTiers: Record<PrismaticTier, boolean>;
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
