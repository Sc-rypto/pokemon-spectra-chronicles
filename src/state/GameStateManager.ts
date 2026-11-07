import {
  PokemonData,
  Active1v1Combatant,
  AutoCatchSettings,
  BuddyData,
  PrismaticTier,
  Move,
  InventoryItem,
  MarketListing,
  RaidBossState,
  GymBattleSession,
  GymLeader,
  RogueRewardOption,
} from '../types/game';
import {
  REGIONS_DATA,
  createPokemonInstanceByDex,
  calculatePokemonStats,
  getPokemonSpriteUrls,
  calculateTypeMultiplier,
  ASSET_ICONS,
} from '../data/pokemonCatalog';
import { TALLGRASS_SHOP_CATALOG } from '../data/tallgrassItems';
import { getCityEncounters } from '../data/cityWildEncounters';
import { generateRogueRewardBatch } from '../data/rogueRewardsData';

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'damage' | 'catch' | 'faint' | 'level' | 'prismatic';
}

export class GameStateManager {
  private static instance: GameStateManager;

  // Player Profile & Onboarding
  public trainerName: string = 'Trainer';
  public hasCompletedOnboarding: boolean = false;

  // Real Economy Wallet
  public pokeDollars: number = 1000;
  public prismaticShards: number = 50;

  // Regions, Cities & Gym Badges
  public currentRegionIndex: number = 0;
  public currentCityIndex: number = 0;
  public maxUnlockedRegionIndex: number = 0;

  // Waves beaten in current city (requires 5 waves to unlock city Gym Leader)
  public cityWavesBeaten: Record<number, number> = {};

  // Collection
  public pokedexCaught: Set<number> = new Set();
  public prismaticLog: {
    tier: PrismaticTier;
    species: string;
    level: number;
    timestamp: number;
  }[] = [];

  // Squad (5 Slots) & Active Battler Index (Starts with ONLY 1 starter)
  public squad: PokemonData[] = [];
  public activeBattlerSlot: number = 0;
  public pcBox: PokemonData[] = [];

  // Walking Companion
  public buddy: PokemonData | null = null;
  public buddyData: BuddyData = {
    pokemonId: '',
    affectionLevel: 1,
    passiveTree: {
      prismaticResonanceTier: 0,
      autoDowsingTier: 0,
      hasteAuraTier: 0,
      goldHoarderTier: 0,
    },
  };

  // Auto-Catch Settings
  public autoCatchSettings: AutoCatchSettings = {
    enabled: true,
    targetPrismaticOnly: false,
    minTierToThrow: 'Standard',
    catchUnregistered: true,
    autoFaintStandardDuplicates: false,
    preferredBall: 'poke',
  };

  // Tallgrass Inventory
  public inventory: InventoryItem[] = [...TALLGRASS_SHOP_CATALOG];

  // Global Player Marketplace
  public marketListings: MarketListing[] = [];

  // Playable Overworld Raid Boss
  public activeRaid: RaidBossState = {
    id: 'raid_alpha_mewtwo',
    name: 'Prismatic Rift Mega-Mewtwo',
    dexNumber: 150,
    tier: 'Omega Prismatic',
    level: 100,
    element: 'Psychic',
    maxHp: 150000,
    currentHp: 150000,
    prismaticTier: 'Supernova',
    active: true,
    totalDamageDealt: 0,
    spriteUrl: getPokemonSpriteUrls(150, 'Supernova').sprite,
    artworkUrl: getPokemonSpriteUrls(150, 'Supernova').artwork,
  };

  // 1v1 Meadow Combat State
  public isBattling: boolean = true;
  public waveNumber: number = 1;
  public playerCombatant: Active1v1Combatant | null = null;
  public wildCombatant: Active1v1Combatant | null = null;
  public combatLogs: CombatLogEntry[] = [];

  // Cooldown timers
  public wildRespawnCooldownRemaining: number = 0; // seconds before next wild spawns

  // Active Main-Series Gym Battle Session
  public activeGymBattle: GymBattleSession | null = null;

  // PokéRogue Reward Modal State
  public currentRogueRewardOptions: RogueRewardOption[] | null = null;

  // Selected Throwing Ball for manual capture
  public selectedThrowingBall: string = 'b1';

  // Reactive listeners
  private subscribers: Array<() => void> = [];
  private combatTimer: number | null = null;
  private lastTickTimestamp: number = performance.now();

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  private constructor() {
    this.checkSavedSession();
    this.startCombatLoop();
  }

  private checkSavedSession() {
    try {
      const saved = localStorage.getItem('spectra_save_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hasCompletedOnboarding && parsed.squad?.length > 0) {
          this.trainerName = parsed.trainerName || 'Trainer';
          this.hasCompletedOnboarding = true;
          this.squad = parsed.squad;
          this.pcBox = parsed.pcBox || [];
          this.pokeDollars = parsed.pokeDollars || 1000;
          this.prismaticShards = parsed.prismaticShards || 50;
          this.currentRegionIndex = parsed.currentRegionIndex || 0;
          this.currentCityIndex = parsed.currentCityIndex || 0;
          this.cityWavesBeaten = parsed.cityWavesBeaten || {};
          this.pokedexCaught = new Set(parsed.pokedexCaught || [this.squad[0].dexNumber]);
          this.init1v1Combatants();
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default: Needs onboarding
    this.hasCompletedOnboarding = false;
  }

  public completeOnboarding(chosenName: string, starterDex: number) {
    this.trainerName = chosenName;
    this.hasCompletedOnboarding = true;

    // Start with ONLY 1 Starter Pokemon at Lv. 5
    const starter = createPokemonInstanceByDex(starterDex, 5);
    this.squad = [starter];
    this.activeBattlerSlot = 0;
    this.pcBox = [];
    this.pokedexCaught.add(starter.dexNumber);

    this.currentRegionIndex = 0;
    this.currentCityIndex = 0;
    this.cityWavesBeaten = {};

    this.addLog(`Welcome to the Pokémon world, ${this.trainerName}! You received ${starter.speciesName}!`, 'prismatic');
    this.init1v1Combatants();
    this.saveGame();
    this.notify();
  }

  public saveGame() {
    try {
      const payload = {
        trainerName: this.trainerName,
        hasCompletedOnboarding: this.hasCompletedOnboarding,
        squad: this.squad,
        pcBox: this.pcBox,
        pokeDollars: this.pokeDollars,
        prismaticShards: this.prismaticShards,
        currentRegionIndex: this.currentRegionIndex,
        currentCityIndex: this.currentCityIndex,
        cityWavesBeaten: this.cityWavesBeaten,
        pokedexCaught: Array.from(this.pokedexCaught),
      };
      localStorage.setItem('spectra_save_v1', JSON.stringify(payload));
    } catch {
      // ignore storage failure
    }
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  public notify() {
    this.subscribers.forEach(cb => cb());
  }

  public getCurrentGymLeader(): GymLeader | null {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    if (!currentRegion) return null;
    return currentRegion.gyms[this.currentCityIndex] || currentRegion.gyms[0];
  }

  // Hard Level Cap = next undefeated gym leader's ace pokemon level
  public getHardLevelCap(): number {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const undefeatedGym = currentRegion.gyms.find(g => !g.defeated);
    if (undefeatedGym) {
      return undefeatedGym.levelRequirement;
    }
    return currentRegion.levelRange[1];
  }

  public getWavesBeatenInCurrentCity(): number {
    const gym = this.getCurrentGymLeader();
    if (!gym) return 0;
    return this.cityWavesBeaten[gym.id] || 0;
  }

  public switchActiveBattler(slotIdx: number) {
    if (slotIdx < 0 || slotIdx >= this.squad.length) return;
    const target = this.squad[slotIdx];
    if (target.isFainted) return;

    this.activeBattlerSlot = slotIdx;
    this.playerCombatant = {
      pokemon: target,
      isPlayer: true,
      currentHp: target.stats.hp,
      maxHp: target.stats.maxHp,
      x: 22,
      y: 60,
      targetX: 22,
      targetY: 60,
      facing: 'right',
      wanderTimer: 3.0,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: performance.now(),
    };
    this.addLog(`Go, ${target.speciesName}!`, 'level');
    this.notify();
  }

  private init1v1Combatants() {
    if (this.squad.length === 0) return;
    const active = this.squad[this.activeBattlerSlot] || this.squad[0];
    this.playerCombatant = {
      pokemon: active,
      isPlayer: true,
      currentHp: active.stats.hp,
      maxHp: active.stats.maxHp,
      x: 22,
      y: 60,
      targetX: 22,
      targetY: 60,
      facing: 'right',
      wanderTimer: 3.0,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: performance.now(),
    };

    this.spawnWildEncounter();
  }

  // Realistic city-bound spawning: Every 10th wave is a Boss/Alpha battle
  public spawnWildEncounter(forceSupernova: boolean = false) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const currentGym = this.getCurrentGymLeader();
    const gymId = currentGym?.id || 1;

    // Check if wave is a Boss / Alpha Encounter (every 10th wave, e.g. 10, 20, 30...)
    const isBossWave = this.waveNumber > 0 && this.waveNumber % 10 === 0;

    // Fetch realistic encounters for this city
    const possibleEncounters = getCityEncounters(
      gymId,
      currentRegion.dexRange[0],
      currentRegion.dexRange[1],
      currentGym ? currentGym.levelRequirement - 4 : 5
    );

    // Roll based on weight
    const totalWeight = possibleEncounters.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenEncounter = possibleEncounters[0];

    for (const enc of possibleEncounters) {
      if (roll < enc.weight) {
        chosenEncounter = enc;
        break;
      }
      roll -= enc.weight;
    }

    const baseLevel = chosenEncounter.minLvl + Math.floor(Math.random() * (chosenEncounter.maxLvl - chosenEncounter.minLvl + 1));
    const wildLevel = isBossWave ? baseLevel + 4 : baseLevel;
    const tier: PrismaticTier = forceSupernova ? 'Supernova' : (isBossWave && Math.random() < 0.25 ? 'Radiant' : undefined as any);

    const wildPokemon = createPokemonInstanceByDex(
      chosenEncounter.dex,
      wildLevel,
      tier,
      this.buddyData.passiveTree.prismaticResonanceTier
    );

    // If Boss Wave, mark as Alpha with 2.2x Max HP
    if (isBossWave) {
      wildPokemon.isAlpha = true;
      wildPokemon.stats.maxHp = Math.floor(wildPokemon.stats.maxHp * 2.2);
      wildPokemon.stats.hp = wildPokemon.stats.maxHp;
      wildPokemon.stats.atk = Math.floor(wildPokemon.stats.atk * 1.3);
    }

    this.wildCombatant = {
      pokemon: wildPokemon,
      isPlayer: false,
      currentHp: wildPokemon.stats.hp,
      maxHp: wildPokemon.stats.maxHp,
      x: 75,
      y: 42,
      targetX: 75,
      targetY: 42,
      facing: 'left',
      wanderTimer: 3.5,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: performance.now(),
    };

    if (isBossWave) {
      this.addLog(`⚠️ WARNING: A gigantic Alpha Boss ${wildPokemon.speciesName} (Lv. ${wildPokemon.level}) has appeared!`, 'prismatic');
    } else if (wildPokemon.prismaticTier !== 'Standard') {
      this.addLog(
        `A rare ${wildPokemon.prismaticTier} ${wildPokemon.speciesName} (Lv. ${wildPokemon.level}) appeared!`,
        'prismatic'
      );
    }
  }

  private startCombatLoop() {
    if (this.combatTimer) clearInterval(this.combatTimer);
    this.combatTimer = window.setInterval(() => {
      this.onCombatTick();
    }, 100);
  }

  private onCombatTick() {
    const now = performance.now();
    const delta = (now - this.lastTickTimestamp) / 1000;
    this.lastTickTimestamp = now;

    // Check fainted party members cooldown respawn (12 seconds realistic recovery)
    let stateChanged = false;
    this.squad.forEach((pkmn, idx) => {
      if (pkmn.isFainted && pkmn.faintedUntilTimestamp && now >= pkmn.faintedUntilTimestamp) {
        pkmn.isFainted = false;
        pkmn.faintedUntilTimestamp = undefined;
        pkmn.stats.hp = pkmn.stats.maxHp;
        this.addLog(`${pkmn.speciesName} recovered full health!`, 'level');
        stateChanged = true;
        if (!this.playerCombatant || this.playerCombatant.currentHp <= 0) {
          this.switchActiveBattler(idx);
        }
      }
    });

    // Check wild respawn cooldown
    if (this.wildRespawnCooldownRemaining > 0) {
      this.wildRespawnCooldownRemaining = Math.max(0, this.wildRespawnCooldownRemaining - delta);
      if (this.wildRespawnCooldownRemaining === 0) {
        this.spawnWildEncounter();
        stateChanged = true;
      }
    }

    if (this.playerCombatant) {
      this.playerCombatant.lungeX *= 0.85;
      this.playerCombatant.shakeX *= 0.82;
      if (Math.abs(this.playerCombatant.lungeX) < 0.2) this.playerCombatant.lungeX = 0;
      if (Math.abs(this.playerCombatant.shakeX) < 0.2) this.playerCombatant.shakeX = 0;
    }

    if (this.wildCombatant) {
      this.wildCombatant.lungeX *= 0.85;
      this.wildCombatant.shakeX *= 0.82;
      if (Math.abs(this.wildCombatant.lungeX) < 0.2) this.wildCombatant.lungeX = 0;
      if (Math.abs(this.wildCombatant.shakeX) < 0.2) this.wildCombatant.shakeX = 0;
    }

    if (this.activeGymBattle || !this.isBattling || !this.playerCombatant || !this.wildCombatant) {
      if (stateChanged) this.notify();
      return;
    }

    // 1. Check if active battler fainted
    if (this.playerCombatant.currentHp <= 0) {
      const activePkmn = this.playerCombatant.pokemon;
      activePkmn.isFainted = true;
      activePkmn.faintedUntilTimestamp = now + 12000; // 12 seconds recovery cooldown
      this.addLog(`${activePkmn.speciesName} fainted! Needs 12s to recover.`, 'faint');

      // Switch to next conscious squad member if available
      const nextLivingIdx = this.squad.findIndex(p => !p.isFainted && p.stats.hp > 0);
      if (nextLivingIdx !== -1) {
        this.switchActiveBattler(nextLivingIdx);
      } else {
        this.playerCombatant = null;
        this.addLog('All squad Pokémon have fainted! Waiting for recovery...', 'faint');
      }
      this.notify();
      return;
    }

    // 2. Slowed Partner Turn Execution (~2.8s cadence)
    const moves = this.playerCombatant.pokemon.moves;
    const isWildLowHp = this.wildCombatant.currentHp < this.wildCombatant.maxHp * 0.25;

    let chosenMove = moves.find(m => (this.playerCombatant!.attackCooldowns[m.id] || 0) <= 0);
    if (isWildLowHp) {
      const gentle = moves.find(m => m.isGentleTap);
      if (gentle && (this.playerCombatant.attackCooldowns[gentle.id] || 0) <= 0) {
        chosenMove = gentle;
      }
    }

    moves.forEach(m => {
      const cd = this.playerCombatant!.attackCooldowns[m.id] || 0;
      if (cd > 0) this.playerCombatant!.attackCooldowns[m.id] = Math.max(0, cd - delta);
    });

    if (chosenMove && (now - this.playerCombatant.lastAttackTimestamp) > 2800) {
      this.playerCombatant.lastAttackTimestamp = now;
      this.playerCombatant.attackCooldowns[chosenMove.id] = 2.8;
      this.executeTallgrassMove(this.playerCombatant, this.wildCombatant, chosenMove);
    }

    // 3. Wild Pokémon counter-attack (3.2s cadence)
    const wildMove = this.wildCombatant.pokemon.moves[1] || this.wildCombatant.pokemon.moves[0];
    const wCd = this.wildCombatant.attackCooldowns['default'] || 0;
    if (wCd <= 0 && (now - this.wildCombatant.lastAttackTimestamp) > 3200) {
      this.wildCombatant.lastAttackTimestamp = now;
      this.wildCombatant.attackCooldowns['default'] = 3.2;
      this.executeTallgrassMove(this.wildCombatant, this.playerCombatant, wildMove as Move);
    } else {
      this.wildCombatant.attackCooldowns['default'] = Math.max(0, wCd - delta);
    }

    // 4. Auto-catch check
    if (this.autoCatchSettings.enabled && this.wildCombatant.currentHp > 0) {
      const isPrismatic = this.wildCombatant.pokemon.prismaticTier !== 'Standard';
      const isUnreg = !this.pokedexCaught.has(this.wildCombatant.pokemon.dexNumber);
      const lowHp = this.wildCombatant.currentHp < this.wildCombatant.maxHp * 0.35;

      const shouldThrow =
        isPrismatic ||
        (this.autoCatchSettings.catchUnregistered && isUnreg) ||
        (!this.autoCatchSettings.targetPrismaticOnly && lowHp);

      if (shouldThrow && Math.random() < 0.12) {
        this.attemptCatch(this.wildCombatant);
      }
    }

    // 5. Wild faint resolution: 1.8s cooldown before next wild spawn
    if (this.wildCombatant.currentHp <= 0) {
      this.waveNumber++;
      const currentGym = this.getCurrentGymLeader();
      if (currentGym) {
        this.cityWavesBeaten[currentGym.id] = (this.cityWavesBeaten[currentGym.id] || 0) + 1;
      }

      const goldAward = Math.floor(120 * (1 + this.buddyData.passiveTree.goldHoarderTier * 0.4) * (1 + this.currentRegionIndex * 0.5));
      this.pokeDollars += goldAward;

      if (Math.random() < 0.35 + this.buddyData.passiveTree.autoDowsingTier * 0.15) {
        const shardsAward = 6 + Math.floor(Math.random() * 8);
        this.prismaticShards += shardsAward;
      }

      // Check PokéRogue Item Pick (Trigger every 5 waves or after an Alpha Boss battle)
      if (this.waveNumber % 5 === 0) {
        this.currentRogueRewardOptions = generateRogueRewardBatch(this.waveNumber);
      }

      // 1.8s respawn cooldown
      this.wildCombatant = null;
      this.wildRespawnCooldownRemaining = 1.8;
      this.saveGame();
    }

    this.notify();
  }

  // Authentic move execution with genuine type multiplier (0x, 0.5x, 1x, 2x, 4x)
  public executeTallgrassMove(attacker: Active1v1Combatant, target: Active1v1Combatant, move: Move) {
    const lvl = attacker.pokemon.level;
    const atk = attacker.pokemon.stats.atk;
    const def = target.pokemon.stats.def;

    const typeMult = calculateTypeMultiplier(move.type, target.pokemon.types);
    const rawDmg = Math.floor(((((2 * lvl / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50) + 2) * typeMult);
    const variance = 0.88 + Math.random() * 0.24;
    let damage = Math.max(1, Math.floor(rawDmg * variance));

    // Gentle tap guarantees leaving at least 1 HP
    if (move.isGentleTap && damage >= target.currentHp) {
      damage = Math.max(1, target.currentHp - 1);
    }

    target.currentHp = Math.max(0, target.currentHp - damage);

    attacker.lungeX = attacker.isPlayer ? 16 : -16;
    target.shakeX = attacker.isPlayer ? 10 : -10;

    let effectivenessText = '';
    if (typeMult >= 2.0) effectivenessText = ' (Super effective!)';
    else if (typeMult <= 0.5 && typeMult > 0) effectivenessText = ' (Not very effective)';
    else if (typeMult === 0) effectivenessText = ' (It had no effect!)';

    if (move.isGentleTap) {
      this.addLog(`${attacker.pokemon.speciesName} used Gentle Tap! Preserved target at ${target.currentHp} HP.`, 'level');
    } else {
      this.addLog(`${attacker.pokemon.speciesName} used ${move.name}${effectivenessText}! (-${damage} HP)`, 'damage');
    }

    if (target.currentHp <= 0 && attacker.isPlayer) {
      // Realistic XP yield based on defeated species base yield and level
      const xpYield = Math.floor((target.pokemon.level * 60) / 7);
      this.gainExp(attacker.pokemon, xpYield);
      this.addLog(`${attacker.pokemon.speciesName} defeated wild ${target.pokemon.speciesName}! (+${xpYield} EXP)`, 'faint');
    }

    this.notify();
  }

  public calculateCatchOdds(enemy: Active1v1Combatant, ballMultiplier: number = 1.0): number {
    if (ballMultiplier >= 255.0) return 100;
    const speciesRate = enemy.pokemon.catchRate || 100;
    const hpFactor = 1 - (enemy.currentHp / Math.max(1, enemy.maxHp));
    const baseFraction = (speciesRate / 255.0) * (0.3 + (hpFactor * 0.7));
    const finalRate = Math.min(0.99, baseFraction * ballMultiplier);
    return Math.max(1, Math.floor(finalRate * 100));
  }

  public throwCaptureOrb(ballId?: string) {
    if (!this.wildCombatant || this.wildCombatant.currentHp <= 0) return;
    const targetBallId = ballId || this.selectedThrowingBall || 'b1';
    const ballItem = this.inventory.find(i => i.id === targetBallId && i.count > 0);
    if (!ballItem) return;

    this.attemptCatch(this.wildCombatant, ballItem);
  }

  private attemptCatch(enemy: Active1v1Combatant, specificBall?: InventoryItem) {
    const ballItem = specificBall || this.inventory.find(i => i.id === this.selectedThrowingBall && i.count > 0) || this.inventory.find(i => i.category === 'orbs' && i.count > 0);
    if (!ballItem || ballItem.count <= 0) return;

    ballItem.count--;
    const multiplier = ballItem.catchMultiplier || 1.0;
    const oddsPercent = this.calculateCatchOdds(enemy, multiplier);

    if (Math.random() * 100 < oddsPercent) {
      this.pokedexCaught.add(enemy.pokemon.dexNumber);
      
      // If squad has room (< 5), add directly to squad; else to PC box
      if (this.squad.length < 5) {
        this.squad.push(enemy.pokemon);
      } else {
        this.pcBox.push(enemy.pokemon);
      }

      // Yield catch XP to active battler
      if (this.playerCombatant) {
        const catchXp = Math.floor((enemy.pokemon.level * 45) / 7);
        this.gainExp(this.playerCombatant.pokemon, catchXp);
      }

      this.addLog(
        `Gotcha! ${enemy.pokemon.speciesName} (Lv. ${enemy.pokemon.level}) was caught!`,
        'catch'
      );

      // Trigger 1.8s cooldown
      this.wildCombatant = null;
      this.wildRespawnCooldownRemaining = 1.8;

      // Check PokéRogue Item Pick on catch as well (every 5 waves)
      this.waveNumber++;
      const currentGym = this.getCurrentGymLeader();
      if (currentGym) {
        this.cityWavesBeaten[currentGym.id] = (this.cityWavesBeaten[currentGym.id] || 0) + 1;
      }
      if (this.waveNumber % 5 === 0) {
        this.currentRogueRewardOptions = generateRogueRewardBatch(this.waveNumber);
      }

      this.saveGame();
    } else {
      this.addLog(`The wild ${enemy.pokemon.speciesName} broke free!`, 'level');
    }
    this.notify();
  }

  // Realistic Pokémon Leveling Curve with Hard Level Cap
  public gainExp(pokemon: PokemonData, expAmount: number) {
    const cap = this.getHardLevelCap();
    if (pokemon.level >= cap) {
      pokemon.currentExp = 0;
      return;
    }

    pokemon.currentExp += expAmount;
    while (pokemon.currentExp >= pokemon.expToNextLevel && pokemon.level < cap) {
      pokemon.currentExp -= pokemon.expToNextLevel;
      pokemon.level++;
      // Realistic Medium-Fast Exp Curve (level^3 / 1.2)
      pokemon.expToNextLevel = Math.floor((pokemon.level ** 2) * 20);
      pokemon.stats = calculatePokemonStats(pokemon.baseStats, pokemon.ivs, pokemon.evs, pokemon.level);

      if (this.playerCombatant && this.playerCombatant.pokemon.id === pokemon.id) {
        this.playerCombatant.maxHp = pokemon.stats.maxHp;
        this.playerCombatant.currentHp = pokemon.stats.maxHp;
      }

      this.addLog(`${pokemon.speciesName} grew to Lv. ${pokemon.level}!`, 'level');
    }

    if (pokemon.level >= cap) {
      pokemon.currentExp = 0;
    }
    this.notify();
  }

  public dismissRogueReward() {
    this.currentRogueRewardOptions = null;
    this.saveGame();
    this.notify();
  }

  // Gym Leaders only challengeable after wave requirement is met
  public canChallengeGymLeader(gym: GymLeader): boolean {
    const wavesBeaten = this.cityWavesBeaten[gym.id] || 0;
    return wavesBeaten >= gym.wavesRequiredToChallenge;
  }

  public startGymBattle(gym: GymLeader) {
    if (!this.canChallengeGymLeader(gym)) {
      this.addLog(`You must clear ${gym.wavesRequiredToChallenge} waves in ${gym.cityName} before challenging Leader ${gym.name}!`, 'level');
      return;
    }

    const playerFirst = this.squad[this.activeBattlerSlot] || this.squad[0];
    const leaderFirst = gym.party[0];

    const leaderMaxHp = Math.floor((((2 * 65 + 15) / 100) * leaderFirst.level) + 10 + leaderFirst.level + 15);

    this.activeGymBattle = {
      gymId: gym.id,
      gymLeader: gym,
      trainerCurrentPokemonIdx: this.activeBattlerSlot,
      leaderCurrentPokemonIdx: 0,
      leaderCurrentHp: leaderMaxHp,
      leaderMaxHp: leaderMaxHp,
      playerCurrentHp: playerFirst.stats.hp,
      playerMaxHp: playerFirst.stats.maxHp,
      turnPhase: 'intro',
      battleDialog: `Leader ${gym.name}: "I am ${gym.name}, the Gym Leader of ${gym.cityName}! Show me the bond with your Pokémon!" Leader ${gym.name} sent out ${leaderFirst.name}!`,
      isCompleted: false,
    };

    this.notify();
  }

  public advanceGymIntro() {
    if (!this.activeGymBattle || this.activeGymBattle.turnPhase !== 'intro') return;
    this.activeGymBattle.turnPhase = 'player_choose';
    this.notify();
  }

  public executeGymBattleTurn(playerMove: Move) {
    const session = this.activeGymBattle;
    if (!session || session.turnPhase !== 'player_choose') return;

    session.turnPhase = 'player_attack';
    const playerPkmn = this.squad[session.trainerCurrentPokemonIdx];
    const leaderPkmn = session.gymLeader.party[session.leaderCurrentPokemonIdx];

    const typeMult = calculateTypeMultiplier(playerMove.type, leaderPkmn.types);
    const rawDmg = Math.floor(((((2 * playerPkmn.level / 5 + 2) * playerMove.power * (playerPkmn.stats.atk / 65)) / 50) + 2) * typeMult);
    const damage = Math.max(1, Math.floor(rawDmg * (0.9 + Math.random() * 0.2)));

    session.leaderCurrentHp = Math.max(0, session.leaderCurrentHp - damage);

    let eff = '';
    if (typeMult >= 2.0) eff = " Super effective!";
    else if (typeMult <= 0.5 && typeMult > 0) eff = " Not very effective...";

    session.battleDialog = `${playerPkmn.speciesName} used ${playerMove.name}!${eff} Dealt ${damage} damage to ${leaderPkmn.name}!`;
    this.notify();

    setTimeout(() => {
      if (session.leaderCurrentHp <= 0) {
        if (session.leaderCurrentPokemonIdx + 1 < session.gymLeader.party.length) {
          session.leaderCurrentPokemonIdx++;
          const nextLeaderPkmn = session.gymLeader.party[session.leaderCurrentPokemonIdx];
          session.leaderMaxHp = Math.floor((((2 * 75 + 15) / 100) * nextLeaderPkmn.level) + 10 + nextLeaderPkmn.level + 15);
          session.leaderCurrentHp = session.leaderMaxHp;
          session.turnPhase = 'player_choose';
          session.battleDialog = `Leader ${session.gymLeader.name}'s ${leaderPkmn.name} fainted! Leader sent out ${nextLeaderPkmn.name}!`;
          this.notify();
          return;
        } else {
          session.turnPhase = 'victory';
          session.battleDialog = `You defeated Gym Leader ${session.gymLeader.name}! "Remarkable strength! You have earned the ${session.gymLeader.badgeName}!"`;
          this.notify();
          return;
        }
      }

      session.turnPhase = 'leader_attack';
      const enemyDmg = Math.floor(((((2 * leaderPkmn.level / 5 + 2) * 55 * (60 / Math.max(1, playerPkmn.stats.def))) / 50) + 2) * (0.85 + Math.random() * 0.3));
      session.playerCurrentHp = Math.max(0, session.playerCurrentHp - enemyDmg);
      playerPkmn.stats.hp = session.playerCurrentHp;

      session.battleDialog = `Leader ${session.gymLeader.name}'s ${leaderPkmn.name} struck back! ${playerPkmn.speciesName} took ${enemyDmg} damage!`;
      this.notify();

      setTimeout(() => {
        if (session.playerCurrentHp <= 0) {
          const nextIdx = this.squad.findIndex((p, idx) => idx > session.trainerCurrentPokemonIdx && !p.isFainted && p.stats.hp > 0);
          if (nextIdx !== -1) {
            session.trainerCurrentPokemonIdx = nextIdx;
            const nextP = this.squad[nextIdx];
            session.playerCurrentHp = nextP.stats.hp;
            session.playerMaxHp = nextP.stats.maxHp;
            session.turnPhase = 'player_choose';
            session.battleDialog = `${playerPkmn.speciesName} fainted! Go, ${nextP.speciesName}!`;
          } else {
            session.turnPhase = 'defeat';
            session.battleDialog = `All of your Pokémon fainted! You lost the Gym battle...`;
          }
        } else {
          session.turnPhase = 'player_choose';
        }
        this.notify();
      }, 1000);
    }, 1000);
  }

  public claimGymVictory() {
    const session = this.activeGymBattle;
    if (!session) return;

    session.gymLeader.defeated = true;
    this.pokeDollars += session.gymLeader.rewardDollars;
    this.prismaticShards += session.gymLeader.rewardShards;

    this.squad.forEach(p => {
      p.isFainted = false;
      p.stats.hp = p.stats.maxHp;
      this.gainExp(p, session.gymLeader.levelRequirement * 80);
    });

    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const nextGymIdx = currentRegion.gyms.findIndex(g => !g.defeated);
    if (nextGymIdx !== -1) {
      currentRegion.gyms[nextGymIdx].unlocked = true;
    } else {
      if (this.currentRegionIndex < REGIONS_DATA.length - 1) {
        this.maxUnlockedRegionIndex = Math.max(this.maxUnlockedRegionIndex, this.currentRegionIndex + 1);
        REGIONS_DATA[this.currentRegionIndex + 1].gyms[0].unlocked = true;
      }
    }

    this.addLog(`Earned the ${session.gymLeader.badgeName}! Level Cap increased!`, 'prismatic');
    this.activeGymBattle = null;
    this.saveGame();
    this.notify();
  }

  public forfeitGymBattle() {
    this.squad.forEach(p => p.stats.hp = p.stats.maxHp);
    this.activeGymBattle = null;
    this.notify();
  }

  // City Travel: ONLY allow travel if target city is unlocked (previous gym defeated)
  public travelToCity(regionIdx: number, cityIdx: number): boolean {
    if (regionIdx < 0 || regionIdx >= REGIONS_DATA.length) return false;
    const region = REGIONS_DATA[regionIdx];
    const targetGym = region.gyms[cityIdx];

    // Check if player has unlocked this city
    // City 0 is always unlocked if region is unlocked; city N requires gym N-1 to be defeated
    const isUnlocked = cityIdx === 0 ? regionIdx <= this.maxUnlockedRegionIndex : region.gyms[cityIdx - 1]?.defeated;

    if (!isUnlocked) {
      this.addLog(`Cannot travel to ${targetGym.cityName}! You must defeat the previous Gym Leader first!`, 'level');
      return false;
    }

    this.currentRegionIndex = regionIdx;
    this.currentCityIndex = cityIdx;
    this.waveNumber = 1;
    this.spawnWildEncounter();
    this.addLog(`Traveled to ${targetGym.cityName}!`, 'level');
    this.saveGame();
    this.notify();
    return true;
  }

  public swapSquadWithPC(squadIdx: number, pcIdx: number) {
    if (squadIdx < 0 || squadIdx >= this.squad.length) return;
    if (pcIdx < 0 || pcIdx >= this.pcBox.length) return;

    const temp = this.squad[squadIdx];
    this.squad[squadIdx] = this.pcBox[pcIdx];
    this.pcBox[pcIdx] = temp;

    if (this.activeBattlerSlot === squadIdx) {
      this.switchActiveBattler(squadIdx);
    }
    this.saveGame();
    this.notify();
  }

  public setBuddy(pokemon: PokemonData) {
    this.buddy = pokemon;
    this.buddyData.pokemonId = pokemon.id;
    this.saveGame();
    this.notify();
  }

  public strikeRaidBoss() {
    if (!this.activeRaid.active) return;
    const playerAtk = this.squad.reduce((sum, p) => sum + p.stats.atk, 0);
    const dmg = Math.floor(playerAtk * (2.2 + Math.random() * 0.6));

    this.activeRaid.currentHp = Math.max(0, this.activeRaid.currentHp - dmg);
    this.activeRaid.totalDamageDealt += dmg;

    const goldEarned = Math.floor(dmg * 0.15);
    const shardsEarned = Math.floor(dmg * 0.005);
    this.pokeDollars += goldEarned;
    this.prismaticShards += shardsEarned;

    this.addLog(`Struck Raid Boss for ${dmg.toLocaleString()} DMG! Earned ₽${goldEarned} and ${shardsEarned} Shards.`, 'damage');

    if (this.activeRaid.currentHp <= 0) {
      this.addLog(`Defeated ${this.activeRaid.name}! Awarded +5,000 Shards!`, 'prismatic');
      this.prismaticShards += 5000;
      this.pokeDollars += 50000;
      this.activeRaid.currentHp = this.activeRaid.maxHp;
    }

    this.saveGame();
    this.notify();
  }

  public addLog(message: string, type: CombatLogEntry['type']) {
    const entry: CombatLogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    this.combatLogs.unshift(entry);
    if (this.combatLogs.length > 50) this.combatLogs.pop();
    this.notify();
  }
}
