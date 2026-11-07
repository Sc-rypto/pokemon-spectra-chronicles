import { PokemonData, PokemonIVs, PokemonEVs, PokemonStats, PrismaticTier, RegionInfo, Move, ElementalType } from '../types/game';
import allPokemonRaw from './allPokemonMeta.json';
import pokemonTypesMapRaw from './pokemonTypesMap.json';
import { ALL_72_GYM_LEADERS } from './gymLeadersData';
import { REGION_LEGENDARIES, getSpeciesRarityAndCatchRate } from './rarityAndLegendaries';

export interface PokemonSpeciesEntry {
  dex: number;
  name: string;
  gen: number;
}

export const ALL_POKEMON_ENTRIES: PokemonSpeciesEntry[] = allPokemonRaw as PokemonSpeciesEntry[];
export const POKEMON_ACCURATE_TYPES: Record<string, string[]> = pokemonTypesMapRaw as Record<string, string[]>;

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
  const accurate = POKEMON_ACCURATE_TYPES[dex.toString()];
  if (accurate && accurate.length > 0) {
    if (accurate.length >= 2) {
      return [accurate[0] as ElementalType, accurate[1] as ElementalType];
    }
    return [accurate[0] as ElementalType];
  }
  return ['Normal'];
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

// Realistic Authentically Scaled Pokémon Moves by Tier / Power / Accuracy
export const REALISTIC_MOVES: Record<string, Move> = {
  // Early-game Moves (Lv 1 - 15)
  pound: { id: 'm_pnd', name: 'Pound', type: 'Normal', power: 40, accuracy: 100, cooldown: 1.5, description: 'Pounds with forelegs or tail.' },
  scratch: { id: 'm_scr', name: 'Scratch', type: 'Normal', power: 40, accuracy: 100, cooldown: 1.5, description: 'Hard, pointed, sharp claws rake the target.' },
  tackle: { id: 'm_tck', name: 'Tackle', type: 'Normal', power: 40, accuracy: 100, cooldown: 1.5, description: 'A physical charge attack.' },
  ember: { id: 'm_emb', name: 'Ember', type: 'Fire', power: 40, accuracy: 100, cooldown: 1.8, description: 'A weak fire attack that may inflict a burn.' },
  watergun: { id: 'm_wgn', name: 'Water Gun', type: 'Water', power: 40, accuracy: 100, cooldown: 1.8, description: 'Squirts water to attack.' },
  vinewhip: { id: 'm_vwp', name: 'Vine Whip', type: 'Grass', power: 45, accuracy: 100, cooldown: 1.8, description: 'Strikes with slender, whiplike vines.' },
  absorb: { id: 'm_abs', name: 'Absorb', type: 'Grass', power: 35, accuracy: 100, cooldown: 2.0, description: 'A nutrient-draining attack.' },
  thundershock: { id: 'm_tsh', name: 'Thunder Shock', type: 'Electric', power: 40, accuracy: 100, cooldown: 1.8, description: 'A jolt of electricity attacks the foe.' },
  gust: { id: 'm_gst', name: 'Gust', type: 'Flying', power: 40, accuracy: 100, cooldown: 1.8, description: 'Strikes with a gust of wind.' },
  confusion: { id: 'm_cnf', name: 'Confusion', type: 'Psychic', power: 50, accuracy: 100, cooldown: 2.0, description: 'A weak telekinetic attack.' },
  karatechop: { id: 'm_krt', name: 'Karate Chop', type: 'Fighting', power: 50, accuracy: 100, cooldown: 2.0, description: 'A sharp chop with critical hit potential.' },
  poisonsting: { id: 'm_pst', name: 'Poison Sting', type: 'Poison', power: 35, accuracy: 100, cooldown: 1.6, description: 'Shoots a toxic barb or barb.' },
  mudslap: { id: 'm_msl', name: 'Mud-Slap', type: 'Ground', power: 35, accuracy: 100, cooldown: 1.8, description: 'Hurls mud to damage and confuse.' },
  rockthrow: { id: 'm_rth', name: 'Rock Throw', type: 'Rock', power: 50, accuracy: 90, cooldown: 2.2, description: 'Drops a small rock on the foe.' },
  powder_snow: { id: 'm_psn', name: 'Powder Snow', type: 'Ice', power: 40, accuracy: 100, cooldown: 1.8, description: 'Blows freezing frosty snow.' },
  bite: { id: 'm_bit', name: 'Bite', type: 'Dark', power: 60, accuracy: 100, cooldown: 2.2, description: 'Bites with vicious fangs.' },
  astonish: { id: 'm_ast', name: 'Astonish', type: 'Ghost', power: 35, accuracy: 100, cooldown: 1.6, description: 'Attacks with a startling screech.' },
  bugbite: { id: 'm_bbt', name: 'Bug Bite', type: 'Bug', power: 60, accuracy: 100, cooldown: 2.0, description: 'Bites the target with strong pincers.' },
  metalclaw: { id: 'm_mcl', name: 'Metal Claw', type: 'Steel', power: 50, accuracy: 95, cooldown: 2.0, description: 'Rakes with hard steel claws.' },
  disarmingvoice: { id: 'm_dvc', name: 'Disarming Voice', type: 'Fairy', power: 40, accuracy: 100, cooldown: 1.8, description: 'Lets out a charming cry.' },
  twister: { id: 'm_tws', name: 'Twister', type: 'Dragon', power: 40, accuracy: 100, cooldown: 2.0, description: 'Whips up a vicious tornado.' },

  // Mid-game Moves (Lv 16 - 34)
  flamewheel: { id: 'm_fwh', name: 'Flame Wheel', type: 'Fire', power: 60, accuracy: 100, cooldown: 2.4, description: 'Cloaks self in fire and charges.' },
  waterpulse: { id: 'm_wpl', name: 'Water Pulse', type: 'Water', power: 60, accuracy: 100, cooldown: 2.4, description: 'Attacks with pulsing ultrasonic water waves.' },
  megadrain: { id: 'm_mdr', name: 'Mega Drain', type: 'Grass', power: 55, accuracy: 100, cooldown: 2.4, description: 'A nutrient-draining attack.' },
  magicalleaf: { id: 'm_mlf', name: 'Magical Leaf', type: 'Grass', power: 60, accuracy: 100, cooldown: 2.4, description: 'Scatters curious magical leaves.' },
  spark: { id: 'm_spk', name: 'Spark', type: 'Electric', power: 65, accuracy: 100, cooldown: 2.4, description: 'An electrified tackle.' },
  headbutt: { id: 'm_hbt', name: 'Headbutt', type: 'Normal', power: 70, accuracy: 100, cooldown: 2.5, description: 'A direct hard head slam.' },
  aircutter: { id: 'm_act', name: 'Air Cutter', type: 'Flying', power: 60, accuracy: 95, cooldown: 2.2, description: 'Slices with razor-sharp winds.' },
  psybeam: { id: 'm_psb', name: 'Psybeam', type: 'Psychic', power: 65, accuracy: 100, cooldown: 2.5, description: 'A peculiar ray of psychic energy.' },
  brickbreak: { id: 'm_bbk', name: 'Brick Break', type: 'Fighting', power: 75, accuracy: 100, cooldown: 2.6, description: 'A swift, sharp-handed chop.' },
  sludgebomb_early: { id: 'm_sbd', name: 'Sludge', type: 'Poison', power: 65, accuracy: 100, cooldown: 2.4, description: 'Unsanitary sludge is hurled at the target.' },
  bulldoze: { id: 'm_bdz', name: 'Bulldoze', type: 'Ground', power: 60, accuracy: 100, cooldown: 2.5, description: 'Stomps down hard on the ground.' },
  rockslide: { id: 'm_rsl', name: 'Rock Slide', type: 'Rock', power: 75, accuracy: 90, cooldown: 2.8, description: 'Large boulders are hurled at the foe.' },
  aurorabeam: { id: 'm_abm', name: 'Aurora Beam', type: 'Ice', power: 65, accuracy: 100, cooldown: 2.5, description: 'A rainbow-colored beam of cold light.' },
  faintattack: { id: 'm_fat', name: 'Feint Attack', type: 'Dark', power: 60, accuracy: 100, cooldown: 2.2, description: 'Draws near deceptively and strikes.' },
  shadowsneak: { id: 'm_ssn', name: 'Shadow Sneak', type: 'Ghost', power: 55, accuracy: 100, cooldown: 2.0, description: 'Extends shadow and strikes from behind.' },
  signalbeam: { id: 'm_sgb', name: 'Signal Beam', type: 'Bug', power: 75, accuracy: 100, cooldown: 2.6, description: 'Flashes a sinister beam of light.' },
  ironhead_early: { id: 'm_mir', name: 'Mirror Shot', type: 'Steel', power: 65, accuracy: 90, cooldown: 2.4, description: 'Emits a polished flash of steel energy.' },
  drainingkiss: { id: 'm_dks', name: 'Draining Kiss', type: 'Fairy', power: 50, accuracy: 100, cooldown: 2.2, description: 'Steals HP with a kiss.' },
  dragonbreath: { id: 'm_dbr', name: 'Dragon Breath', type: 'Dragon', power: 60, accuracy: 100, cooldown: 2.5, description: 'Exhales an astonishing dragon breath.' },

  // Late-game & High-level Moves (Lv 35+)
  flamethrower: { id: 'm_flm', name: 'Flamethrower', type: 'Fire', power: 90, accuracy: 100, cooldown: 3.2, description: 'Intense blast of fire with burn potential.' },
  hydropump: { id: 'm_hdp', name: 'Hydro Pump', type: 'Water', power: 110, accuracy: 80, cooldown: 4.2, description: 'High-pressure water cannon.' },
  solarbeam: { id: 'm_slb', name: 'Solar Beam', type: 'Grass', power: 120, accuracy: 100, cooldown: 4.8, description: 'Condensed sunlight energy beam.' },
  energyball: { id: 'm_enb', name: 'Energy Ball', type: 'Grass', power: 90, accuracy: 100, cooldown: 3.2, description: 'Draws power from nature and fires a sphere.' },
  thunderbolt: { id: 'm_thb', name: 'Thunderbolt', type: 'Electric', power: 90, accuracy: 100, cooldown: 3.2, description: 'Powerful shock with stun potential.' },
  dragonclaw: { id: 'm_dcl', name: 'Dragon Claw', type: 'Dragon', power: 80, accuracy: 100, cooldown: 2.8, description: 'Sharp claws slash through targets.' },
  shadowball: { id: 'm_shb', name: 'Shadow Ball', type: 'Ghost', power: 80, accuracy: 100, cooldown: 3.0, description: 'Dark shadowy sphere.' },
  psychic: { id: 'm_psy', name: 'Psychic', type: 'Psychic', power: 90, accuracy: 100, cooldown: 3.2, description: 'Strong telekinetic wave.' },
  icebeam: { id: 'm_icb', name: 'Ice Beam', type: 'Ice', power: 90, accuracy: 100, cooldown: 3.6, description: 'Freezing ray.' },
  earthquake: { id: 'm_eqk', name: 'Earthquake', type: 'Ground', power: 100, accuracy: 100, cooldown: 4.0, description: 'Massive tremors.' },
  moonblast: { id: 'm_mbl', name: 'Moonblast', type: 'Fairy', power: 95, accuracy: 100, cooldown: 3.5, description: 'Borrowing the power of the moon.' },
  aurasphere: { id: 'm_asp', name: 'Aura Sphere', type: 'Fighting', power: 80, accuracy: 100, cooldown: 2.5, description: 'Pure inner aura blast.' },
  darkpulse: { id: 'm_dps', name: 'Dark Pulse', type: 'Dark', power: 80, accuracy: 100, cooldown: 3.0, description: 'Releases a horrible aura of thoughts.' },
  flashcannon: { id: 'm_fcn', name: 'Flash Cannon', type: 'Steel', power: 80, accuracy: 100, cooldown: 3.0, description: 'Fires a beam of light from polished steel.' },
  sludgebomb: { id: 'm_sbm', name: 'Sludge Bomb', type: 'Poison', power: 90, accuracy: 100, cooldown: 3.2, description: 'Unsanitary sludge is hurled at the target.' },
  bravebird: { id: 'm_bbd', name: 'Brave Bird', type: 'Flying', power: 100, accuracy: 100, cooldown: 3.8, description: 'Dives tucking its wings in courageously.' },
  stoneedge: { id: 'm_sed', name: 'Stone Edge', type: 'Rock', power: 100, accuracy: 80, cooldown: 3.8, description: 'Stabs the foe with sharpened stone.' },
  bugbuzz: { id: 'm_bbz', name: 'Bug Buzz', type: 'Bug', power: 90, accuracy: 100, cooldown: 3.2, description: 'Vibrates wings to generate sound waves.' },
  hyperbeam: { id: 'm_hbm', name: 'Hyper Beam', type: 'Normal', power: 120, accuracy: 90, cooldown: 4.8, description: 'A devastating normal beam of pure energy.' },
};

// Generates 100% level-appropriate moves (e.g. Lv 10 Treecko gets Pound, Absorb, Quick Attack; Lv 36+ gets Energy Ball / Solar Beam)
export function getMovesForTypeAndLevel(type: ElementalType, level: number): Move[] {
  const gentle = { ...GENTLE_TAP_MOVE };
  const RM = REALISTIC_MOVES;

  if (level < 16) {
    // Early game: Lv 1-15
    switch (type) {
      case 'Fire': return [gentle, RM.ember, RM.scratch];
      case 'Water': return [gentle, RM.watergun, RM.tackle];
      case 'Grass': return [gentle, RM.absorb, RM.vinewhip];
      case 'Electric': return [gentle, RM.thundershock, RM.tackle];
      case 'Ice': return [gentle, RM.powder_snow, RM.tackle];
      case 'Fighting': return [gentle, RM.karatechop, RM.tackle];
      case 'Poison': return [gentle, RM.poisonsting, RM.scratch];
      case 'Ground': return [gentle, RM.mudslap, RM.tackle];
      case 'Flying': return [gentle, RM.gust, RM.tackle];
      case 'Psychic': return [gentle, RM.confusion, RM.pound];
      case 'Bug': return [gentle, RM.bugbite, RM.tackle];
      case 'Rock': return [gentle, RM.rockthrow, RM.tackle];
      case 'Ghost': return [gentle, RM.astonish, RM.scratch];
      case 'Dragon': return [gentle, RM.twister, RM.scratch];
      case 'Steel': return [gentle, RM.metalclaw, RM.tackle];
      case 'Fairy': return [gentle, RM.disarmingvoice, RM.pound];
      case 'Dark': return [gentle, RM.bite, RM.scratch];
      default: return [gentle, RM.tackle, RM.pound];
    }
  } else if (level < 35) {
    // Mid game: Lv 16-34
    switch (type) {
      case 'Fire': return [gentle, RM.flamewheel, RM.headbutt];
      case 'Water': return [gentle, RM.waterpulse, RM.headbutt];
      case 'Grass': return [gentle, RM.megadrain, RM.magicalleaf];
      case 'Electric': return [gentle, RM.spark, RM.headbutt];
      case 'Ice': return [gentle, RM.aurorabeam, RM.headbutt];
      case 'Fighting': return [gentle, RM.brickbreak, RM.headbutt];
      case 'Poison': return [gentle, RM.sludgebomb_early, RM.headbutt];
      case 'Ground': return [gentle, RM.bulldoze, RM.headbutt];
      case 'Flying': return [gentle, RM.aircutter, RM.headbutt];
      case 'Psychic': return [gentle, RM.psybeam, RM.headbutt];
      case 'Bug': return [gentle, RM.signalbeam, RM.headbutt];
      case 'Rock': return [gentle, RM.rockslide, RM.headbutt];
      case 'Ghost': return [gentle, RM.shadowsneak, RM.headbutt];
      case 'Dragon': return [gentle, RM.dragonbreath, RM.headbutt];
      case 'Steel': return [gentle, RM.ironhead_early, RM.headbutt];
      case 'Fairy': return [gentle, RM.drainingkiss, RM.headbutt];
      case 'Dark': return [gentle, RM.faintattack, RM.headbutt];
      default: return [gentle, RM.headbutt, RM.tackle];
    }
  } else {
    // Late game: Lv 35+
    switch (type) {
      case 'Fire': return [gentle, RM.flamethrower, RM.flamewheel];
      case 'Water': return [gentle, RM.hydropump, RM.waterpulse];
      case 'Grass': return [gentle, RM.energyball, RM.solarbeam];
      case 'Electric': return [gentle, RM.thunderbolt, RM.spark];
      case 'Ice': return [gentle, RM.icebeam, RM.aurorabeam];
      case 'Fighting': return [gentle, RM.aurasphere, RM.brickbreak];
      case 'Poison': return [gentle, RM.sludgebomb, RM.sludgebomb_early];
      case 'Ground': return [gentle, RM.earthquake, RM.bulldoze];
      case 'Flying': return [gentle, RM.bravebird, RM.aircutter];
      case 'Psychic': return [gentle, RM.psychic, RM.psybeam];
      case 'Bug': return [gentle, RM.bugbuzz, RM.signalbeam];
      case 'Rock': return [gentle, RM.stoneedge, RM.rockslide];
      case 'Ghost': return [gentle, RM.shadowball, RM.shadowsneak];
      case 'Dragon': return [gentle, RM.dragonclaw, RM.dragonbreath];
      case 'Steel': return [gentle, RM.flashcannon, RM.metalclaw];
      case 'Fairy': return [gentle, RM.moonblast, RM.drainingkiss];
      case 'Dark': return [gentle, RM.darkpulse, RM.faintattack];
      default: return [gentle, RM.hyperbeam, RM.headbutt];
    }
  }
}

export function getMovesForType(type: ElementalType, level: number = 5): Move[] {
  return getMovesForTypeAndLevel(type, level);
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
  const moves = getMovesForTypeAndLevel(types[0], level);
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
