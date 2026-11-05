import { PokemonData, PokemonIVs, PokemonEVs, PokemonStats, PrismaticTier, Move, ElementalType } from '../types/game';
import allPokemonRaw from '../data/allPokemonMeta.json';
import { TYPE_PALETTES, generateRandomIVs, calculatePokemonStats, rollPrismaticTier } from '../data/pokemonCatalog';

interface PokeApiCacheItem {
  dex: number;
  name: string;
  types: [ElementalType] | [ElementalType, ElementalType];
  baseStats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  moves: Move[];
  weight: number;
  height: number;
  spriteUrl: string;
}

class PokeApiService {
  private static instance: PokeApiService;
  private cache: Map<number, PokeApiCacheItem> = new Map();
  private pending: Map<number, Promise<PokeApiCacheItem>> = new Map();

  public static getInstance(): PokeApiService {
    if (!PokeApiService.instance) {
      PokeApiService.instance = new PokeApiService();
    }
    return PokeApiService.instance;
  }

  // Capitalize elemental type name
  private formatType(rawType: string): ElementalType {
    const capitalized = (rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase()) as ElementalType;
    return TYPE_PALETTES[capitalized] ? capitalized : 'Normal';
  }

  /**
   * Fetch live authentic data from PokeAPI with in-memory caching and fallback
   */
  public async getPokemonDetails(dexNumber: number): Promise<PokeApiCacheItem> {
    if (this.cache.has(dexNumber)) {
      return this.cache.get(dexNumber)!;
    }

    if (this.pending.has(dexNumber)) {
      return this.pending.get(dexNumber)!;
    }

    const promise = (async () => {
      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${dexNumber}`);
        if (!res.ok) throw new Error(`PokeAPI status ${res.status}`);
        const data = await res.json();

        // Parse official types
        const types: [ElementalType] | [ElementalType, ElementalType] = data.types.length >= 2
          ? [this.formatType(data.types[0].type.name), this.formatType(data.types[1].type.name)]
          : [this.formatType(data.types[0].type.name)];

        // Parse official base stats
        const getStat = (name: string) => {
          const found = data.stats.find((s: any) => s.stat.name === name);
          return found ? found.base_stat : 70;
        };

        const baseStats = {
          hp: getStat('hp'),
          atk: getStat('attack'),
          def: getStat('defense'),
          spa: getStat('special-attack'),
          spd: getStat('special-defense'),
          spe: getStat('speed'),
        };

        // Parse top signature moves from PokeAPI
        const moves: Move[] = data.moves.slice(0, 4).map((m: any, idx: number) => {
          const moveName = m.move.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return {
            id: `move_${m.move.name}_${idx}`,
            name: moveName,
            type: types[0],
            power: 60 + (idx * 20),
            cooldown: 2.0 + idx * 0.8,
            priorityTier: (idx === 0 ? 1 : idx === 1 ? 2 : 3) as 1 | 2 | 3,
            description: `Signature technique performed by ${data.name}.`,
          };
        });

        if (moves.length === 0) {
          moves.push({
            id: 'm_tackle',
            name: 'Tackle',
            type: 'Normal',
            power: 40,
            cooldown: 1.5,
            priorityTier: 3,
            description: 'A physical charge attack.',
          });
        }

        const item: PokeApiCacheItem = {
          dex: dexNumber,
          name: data.name.charAt(0).toUpperCase() + data.name.slice(1).replace('-', ' '),
          types,
          baseStats,
          moves,
          weight: data.weight,
          height: data.height,
          spriteUrl: data.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
        };

        this.cache.set(dexNumber, item);
        this.pending.delete(dexNumber);
        return item;
      } catch (_err) {
        // Fallback from prebuilt meta
        const meta = allPokemonRaw[dexNumber - 1] || allPokemonRaw[0];
        const item: PokeApiCacheItem = {
          dex: dexNumber,
          name: meta.name,
          types: ['Normal'],
          baseStats: { hp: 70, atk: 75, def: 70, spa: 75, spd: 70, spe: 75 },
          moves: [
            { id: 'm_fallback', name: 'Swift Attack', type: 'Normal', power: 60, cooldown: 2.5, priorityTier: 1, description: 'Rapid physical charge.' }
          ],
          weight: 100,
          height: 10,
          spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`,
        };
        this.cache.set(dexNumber, item);
        this.pending.delete(dexNumber);
        return item;
      }
    })();

    this.pending.set(dexNumber, promise);
    return promise;
  }

  /**
   * Instantiate an authentic Pokémon using PokeAPI data
   */
  public async createPokemon(
    dexNumber: number,
    level: number,
    forcedTier?: PrismaticTier,
    bonusResonance: number = 0
  ): Promise<PokemonData> {
    const details = await this.getPokemonDetails(dexNumber);
    const ivs = generateRandomIVs();
    const evs: PokemonEVs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    const stats = calculatePokemonStats(details.baseStats, ivs, evs, level);
    const tier = forcedTier || rollPrismaticTier(bonusResonance);
    const palette = TYPE_PALETTES[details.types[0]] || TYPE_PALETTES.Normal;

    // Determine region (Gen 1-9)
    let gen = 1;
    if (dexNumber > 905) gen = 9;
    else if (dexNumber > 809) gen = 8;
    else if (dexNumber > 721) gen = 7;
    else if (dexNumber > 649) gen = 6;
    else if (dexNumber > 493) gen = 5;
    else if (dexNumber > 386) gen = 4;
    else if (dexNumber > 251) gen = 3;
    else if (dexNumber > 151) gen = 2;

    return {
      id: `pk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      dexNumber,
      speciesName: details.name,
      level,
      currentExp: 0,
      expToNextLevel: level * 100,
      types: details.types,
      prismaticTier: tier,
      capturedAt: Date.now(),
      catchRegion: gen,
      baseStats: details.baseStats,
      ivs,
      evs,
      stats,
      moves: details.moves,
      nature: 'Hardy',
      modelArchetype: 'biped',
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      scale: 1.0,
    };
  }
}

export const pokeApiService = PokeApiService.getInstance();
