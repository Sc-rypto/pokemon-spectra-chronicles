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

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'damage' | 'catch' | 'faint' | 'level' | 'prismatic';
}

export class GameStateManager {
  private static instance: GameStateManager;

  // Real Economy Wallet
  public pokeDollars: number = 3200;
  public prismaticShards: number = 220;

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

  // Squad (5 Slots) & Active Battler Index (Tallgrass 1v1 Format)
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

  // Tallgrass Inventory (Capture Orbs, Potions, Candies)
  public inventory: InventoryItem[] = [...TALLGRASS_SHOP_CATALOG];

  // Global Player Marketplace (Zero bots)
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

  // Active Main-Series Gym Battle Session (Modal Arena)
  public activeGymBattle: GymBattleSession | null = null;

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
    this.initStarterSquad();
    this.startCombatLoop();
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

  private initStarterSquad() {
    const charizard = createPokemonInstanceByDex(6, 12);
    const pikachu = createPokemonInstanceByDex(25, 10);
    const blastoise = createPokemonInstanceByDex(9, 11);
    const venusaur = createPokemonInstanceByDex(3, 10);
    const lucario = createPokemonInstanceByDex(448, 12, 'Radiant');

    this.squad = [charizard, pikachu, blastoise, venusaur, lucario];
    this.squad.forEach(p => this.pokedexCaught.add(p.dexNumber));

    this.buddy = createPokemonInstanceByDex(778, 10, 'Shiny');
    this.buddyData.pokemonId = this.buddy.id;
    this.pokedexCaught.add(this.buddy.dexNumber);

    this.pcBox.push(createPokemonInstanceByDex(133, 8)); // Eevee
    this.pcBox.push(createPokemonInstanceByDex(94, 12, 'Ethereal')); // Gengar
    this.pcBox.push(createPokemonInstanceByDex(143, 12)); // Snorlax
    this.pcBox.push(createPokemonInstanceByDex(10, 5)); // Caterpie

    this.init1v1Combatants();
  }

  public getCurrentGymLeader(): GymLeader | null {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    if (!currentRegion) return null;
    const gym = currentRegion.gyms[this.currentCityIndex] || currentRegion.gyms.find(g => !g.defeated) || currentRegion.gyms[0];
    return gym;
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
    this.activeBattlerSlot = slotIdx;
    const active = this.squad[slotIdx];
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
    this.addLog(`Switched active partner: Go, ${active.speciesName}!`, 'level');
    this.notify();
  }

  private init1v1Combatants() {
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

  // Realistic Spawning: Species per region, gates region legendaries until all 8 region gyms are defeated
  public spawnWildEncounter(forceSupernova: boolean = false) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const [minLvl, maxLvl] = currentRegion.levelRange;
    const currentGym = this.getCurrentGymLeader();
    const cityTargetLvl = currentGym ? Math.max(minLvl, currentGym.levelRequirement - 3) : minLvl;

    const wildLevel = Math.min(
      maxLvl,
      Math.max(minLvl, Math.floor(cityTargetLvl - 2 + Math.random() * 4))
    );

    const allGymsDefeated = currentRegion.gyms.every(g => g.defeated);
    const [dexMin, dexMax] = currentRegion.dexRange;

    let chosenDex: number;
    // If all gyms defeated in region, 5% chance of region legendary encounter
    if (allGymsDefeated && currentRegion.legendaryDex && currentRegion.legendaryDex.length > 0 && Math.random() < 0.05) {
      const legList = currentRegion.legendaryDex;
      chosenDex = legList[Math.floor(Math.random() * legList.length)];
    } else {
      // Pick non-legendary wild species in range
      let candidate = dexMin + Math.floor(Math.random() * (dexMax - dexMin + 1));
      if (currentRegion.legendaryDex && currentRegion.legendaryDex.includes(candidate)) {
        candidate = dexMin + 1; // fall back to basic starter/common
      }
      chosenDex = candidate;
    }

    const tier: PrismaticTier = forceSupernova ? 'Supernova' : undefined as any;
    const wildPokemon = createPokemonInstanceByDex(
      chosenDex,
      wildLevel,
      tier,
      this.buddyData.passiveTree.prismaticResonanceTier
    );

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

    if (wildPokemon.prismaticTier !== 'Standard') {
      this.addLog(
        `A rare ${wildPokemon.prismaticTier} ${wildPokemon.speciesName} (Lv. ${wildPokemon.level}) appeared in the Meadow!`,
        'prismatic'
      );
    }
  }

  // Realistic Slowed Combat Engine (~2.5s-3.5s Deliberate Pacing)
  private startCombatLoop() {
    if (this.combatTimer) clearInterval(this.combatTimer);

    // Run tick every 100ms
    this.combatTimer = window.setInterval(() => {
      this.onCombatTick();
    }, 100);
  }

  private onCombatTick() {
    const now = performance.now();
    const delta = (now - this.lastTickTimestamp) / 1000;
    this.lastTickTimestamp = now;

    // Reset combat motion decay
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

    // Pause overworld loop when gym battle modal is active
    if (this.activeGymBattle) {
      return;
    }

    if (!this.isBattling || !this.playerCombatant || !this.wildCombatant) {
      return;
    }

    // 1. Revive player if fainted
    if (this.playerCombatant.currentHp <= 0) {
      const nextLivingIdx = this.squad.findIndex(p => p.stats.hp > 0 && p.id !== this.playerCombatant?.pokemon.id);
      if (nextLivingIdx !== -1) {
        this.switchActiveBattler(nextLivingIdx);
      } else {
        this.squad.forEach(p => p.stats.hp = p.stats.maxHp);
        this.switchActiveBattler(0);
        this.addLog('Nurse Joy restored your squad to full health!', 'level');
      }
    }

    // 2. Slowed Turn Execution: Partner attacks roughly every 2.8s
    const isWildLowHp = this.wildCombatant.currentHp < this.wildCombatant.maxHp * 0.25;
    const moves = this.playerCombatant.pokemon.moves;

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

    // Deliberate 2.8s cadence
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

    // 5. Wild faint resolution
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

      this.spawnWildEncounter();
    }

    this.notify();
  }

  // Move Execution with clean motion (idle bob, forward lunge, hit shake)
  public executeTallgrassMove(attacker: Active1v1Combatant, target: Active1v1Combatant, move: Move) {
    const lvl = attacker.pokemon.level;
    const atk = attacker.pokemon.stats.atk;
    const def = target.pokemon.stats.def;

    const typeMult = calculateTypeMultiplier(move.type, target.pokemon.types);
    const rawDmg = Math.floor(((((2 * lvl / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50) + 2) * typeMult);
    const variance = 0.88 + Math.random() * 0.24;
    let damage = Math.max(1, Math.floor(rawDmg * variance));

    // Tallgrass Gentle Tap Mechanic
    if (move.isGentleTap && damage >= target.currentHp) {
      damage = Math.max(1, target.currentHp - 1);
    }

    target.currentHp = Math.max(0, target.currentHp - damage);

    // Natural Pokémon combat motion (forward lunge, hit shake)
    attacker.lungeX = attacker.isPlayer ? 16 : -16;
    target.shakeX = attacker.isPlayer ? 10 : -10;

    let effectivenessText = '';
    if (typeMult >= 2.0) effectivenessText = ' (Super effective!)';
    else if (typeMult <= 0.5 && typeMult > 0) effectivenessText = ' (Not very effective)';
    else if (typeMult === 0) effectivenessText = ' (No effect!)';

    if (move.isGentleTap) {
      this.addLog(`${attacker.pokemon.speciesName} used Gentle Tap! Target preserved at ${target.currentHp} HP.`, 'level');
    } else {
      this.addLog(`${attacker.pokemon.speciesName} used ${move.name}${effectivenessText}! (-${damage} HP)`, 'damage');
    }

    if (target.currentHp <= 0 && attacker.isPlayer) {
      this.gainExp(attacker.pokemon, target.pokemon.level * 45);
      this.addLog(`${attacker.pokemon.speciesName} defeated wild ${target.pokemon.speciesName}!`, 'faint');
    }

    this.notify();
  }

  // Capture calculation using species catchRate and orb multiplier
  public calculateCatchOdds(enemy: Active1v1Combatant, ballMultiplier: number = 1.0): number {
    if (ballMultiplier >= 255.0) return 100;
    const speciesRate = enemy.pokemon.catchRate || 100; // 3 to 255
    const hpFactor = 1 - (enemy.currentHp / Math.max(1, enemy.maxHp)); // 0 when full, ~0.99 when 1 HP
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
      this.pcBox.push(enemy.pokemon);

      if (enemy.pokemon.prismaticTier !== 'Standard') {
        this.prismaticLog.push({
          tier: enemy.pokemon.prismaticTier,
          species: enemy.pokemon.speciesName,
          level: enemy.pokemon.level,
          timestamp: Date.now(),
        });
      }

      this.addLog(
        `Captured ${enemy.pokemon.prismaticTier !== 'Standard' ? enemy.pokemon.prismaticTier + ' ' : ''}${enemy.pokemon.speciesName} (Lv. ${enemy.pokemon.level}) with ${ballItem.name}!`,
        'catch'
      );
      this.spawnWildEncounter();
    } else {
      this.addLog(`The wild ${enemy.pokemon.speciesName} broke free from the ${ballItem.name}!`, 'level');
    }
    this.notify();
  }

  // Hard Level Cap Enforced
  public gainExp(pokemon: PokemonData, expAmount: number) {
    const cap = this.getHardLevelCap();
    if (pokemon.level >= cap) {
      pokemon.currentExp = 0;
      return;
    }

    pokemon.currentExp += expAmount;
    if (pokemon.currentExp >= pokemon.expToNextLevel) {
      pokemon.level++;
      pokemon.currentExp = 0;
      pokemon.expToNextLevel = pokemon.level * 100;
      pokemon.stats = calculatePokemonStats(pokemon.baseStats, pokemon.ivs, pokemon.evs, pokemon.level);

      if (this.playerCombatant && this.playerCombatant.pokemon.id === pokemon.id) {
        this.playerCombatant.maxHp = pokemon.stats.maxHp;
        this.playerCombatant.currentHp = pokemon.stats.maxHp;
      }

      this.addLog(`${pokemon.speciesName} grew to Lv. ${pokemon.level}!`, 'level');
    }
    this.notify();
  }

  // START AUTHENTIC GYM BATTLE SESSION
  public startGymBattle(gym: GymLeader) {
    const playerFirst = this.squad[this.activeBattlerSlot] || this.squad[0];
    const leaderFirst = gym.party[0];

    // Compute leader initial HP
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
      turnPhase: 'player_choose',
      battleDialog: `Leader ${gym.name}: "I am the Gym Leader of ${gym.cityName}! Show me the bond between you and your Pokémon!" Leader ${gym.name} sent out ${leaderFirst.name}!`,
      isCompleted: false,
    };

    this.notify();
  }

  public executeGymBattleTurn(playerMove: Move) {
    const session = this.activeGymBattle;
    if (!session || session.turnPhase !== 'player_choose') return;

    session.turnPhase = 'player_attack';
    const playerPkmn = this.squad[session.trainerCurrentPokemonIdx];
    const leaderPkmn = session.gymLeader.party[session.leaderCurrentPokemonIdx];

    // 1. Player Attack
    const typeMult = calculateTypeMultiplier(playerMove.type, leaderPkmn.types);
    const rawDmg = Math.floor(((((2 * playerPkmn.level / 5 + 2) * playerMove.power * (playerPkmn.stats.atk / 65)) / 50) + 2) * typeMult);
    const damage = Math.max(1, Math.floor(rawDmg * (0.9 + Math.random() * 0.2)));

    session.leaderCurrentHp = Math.max(0, session.leaderCurrentHp - damage);

    let eff = '';
    if (typeMult >= 2.0) eff = " It's super effective!";
    else if (typeMult <= 0.5 && typeMult > 0) eff = " It's not very effective...";

    session.battleDialog = `${playerPkmn.speciesName} used ${playerMove.name}!${eff} Dealt ${damage} damage to ${leaderPkmn.name}!`;
    this.notify();

    // Check if Leader Pokemon fainted
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
          // Gym Victory!
          session.turnPhase = 'victory';
          session.battleDialog = `You defeated Gym Leader ${session.gymLeader.name}! "Remarkable strength! You have earned the ${session.gymLeader.badgeName}!"`;
          this.notify();
          return;
        }
      }

      // 2. Leader Counter Attack
      session.turnPhase = 'leader_attack';
      const enemyDmg = Math.floor(((((2 * leaderPkmn.level / 5 + 2) * 60 * (65 / Math.max(1, playerPkmn.stats.def))) / 50) + 2) * (0.85 + Math.random() * 0.3));
      session.playerCurrentHp = Math.max(0, session.playerCurrentHp - enemyDmg);
      playerPkmn.stats.hp = session.playerCurrentHp;

      session.battleDialog = `Leader ${session.gymLeader.name}'s ${leaderPkmn.name} struck back! ${playerPkmn.speciesName} took ${enemyDmg} damage!`;
      this.notify();

      setTimeout(() => {
        if (session.playerCurrentHp <= 0) {
          // Check next squad member
          const nextIdx = this.squad.findIndex((p, idx) => idx > session.trainerCurrentPokemonIdx && p.stats.hp > 0);
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

    // Squad Exp bonus & Full heal
    this.squad.forEach(p => {
      p.stats.hp = p.stats.maxHp;
      this.gainExp(p, session.gymLeader.levelRequirement * 80);
    });

    // Unlock next gym or next region
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const nextGym = currentRegion.gyms.find(g => !g.defeated);
    if (nextGym) {
      nextGym.unlocked = true;
    } else {
      if (this.currentRegionIndex < REGIONS_DATA.length - 1) {
        this.maxUnlockedRegionIndex = Math.max(this.maxUnlockedRegionIndex, this.currentRegionIndex + 1);
        REGIONS_DATA[this.currentRegionIndex + 1].gyms[0].unlocked = true;
      }
    }

    this.addLog(`Earned the ${session.gymLeader.badgeName}! Level Cap increased!`, 'prismatic');
    this.activeGymBattle = null;
    this.notify();
  }

  public forfeitGymBattle() {
    this.squad.forEach(p => p.stats.hp = p.stats.maxHp);
    this.activeGymBattle = null;
    this.notify();
  }

  // Teleport to city / switch region
  public travelToCity(regionIdx: number, cityIdx: number) {
    if (regionIdx < 0 || regionIdx >= REGIONS_DATA.length) return;
    this.currentRegionIndex = regionIdx;
    this.currentCityIndex = cityIdx;
    this.waveNumber = 1;
    this.spawnWildEncounter();
    const city = REGIONS_DATA[regionIdx].gyms[cityIdx];
    this.addLog(`Traveled to ${city.cityName} in ${REGIONS_DATA[regionIdx].name}!`, 'level');
    this.notify();
  }

  // Swap squad member with PC Box
  public swapSquadWithPC(squadIdx: number, pcIdx: number) {
    if (squadIdx < 0 || squadIdx >= this.squad.length) return;
    if (pcIdx < 0 || pcIdx >= this.pcBox.length) return;

    const temp = this.squad[squadIdx];
    this.squad[squadIdx] = this.pcBox[pcIdx];
    this.pcBox[pcIdx] = temp;

    if (this.activeBattlerSlot === squadIdx) {
      this.switchActiveBattler(squadIdx);
    }
    this.notify();
  }

  public setBuddy(pokemon: PokemonData) {
    this.buddy = pokemon;
    this.buddyData.pokemonId = pokemon.id;
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
