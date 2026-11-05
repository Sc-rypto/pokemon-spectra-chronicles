import {
  PokemonData,
  ActiveCombatant,
  AutoCatchSettings,
  BuddyData,
  PrismaticTier,
  Move,
  InventoryItem,
  GTSListing,
  RaidBoss,
} from '../types/game';
import {
  REGIONS_DATA,
  createPokemonInstanceByDex,
  calculatePokemonStats,
} from '../data/pokemonCatalog';
import { pokeApiService } from '../services/PokeApiService';
import { WorldSceneManager } from '../engine/WorldSceneManager';
import * as THREE from 'three';

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'damage' | 'catch' | 'faint' | 'level' | 'prismatic';
}

export class GameStateManager {
  private static instance: GameStateManager;

  // Currencies
  public pokeDollars: number = 35000;
  public prismaticShards: number = 1200;

  // Regions & Level Caps
  public currentRegionIndex: number = 0; // 0 to 8 (Gen 1 to Gen 9)
  public maxUnlockedRegionIndex: number = 0;

  // Collection & Box
  public pokedexCaught: Set<number> = new Set();
  public prismaticLog: {
    tier: PrismaticTier;
    species: string;
    level: number;
    timestamp: number;
  }[] = [];

  // Squad (Active 5) & Buddy
  public squad: PokemonData[] = [];
  public pcBox: PokemonData[] = [];
  public buddy: PokemonData | null = null;
  public buddyData: BuddyData = {
    pokemonId: '',
    affectionLevel: 5,
    passiveTree: {
      prismaticResonanceTier: 2,
      autoDowsingTier: 2,
      hasteAuraTier: 1,
      goldHoarderTier: 2,
    },
  };

  // Auto-Catch Settings
  public autoCatchSettings: AutoCatchSettings = {
    enabled: true,
    targetPrismaticOnly: false,
    minTierToThrow: 'Standard',
    catchUnregistered: true,
    autoFaintStandardDuplicates: false,
    preferredBall: 'ultra',
  };

  // Inventory
  public inventory: InventoryItem[] = [
    { id: 'b1', name: 'Poké Ball', category: 'balls', count: 200, price: 200, description: 'Standard capture device.', icon: '🔴' },
    { id: 'b2', name: 'Great Ball', category: 'balls', count: 80, price: 600, description: 'Higher catch rate device.', icon: '🔵' },
    { id: 'b3', name: 'Ultra Ball', category: 'balls', count: 50, price: 1200, description: 'High-performance capture ball.', icon: '🟡' },
    { id: 'b4', name: 'Prismatic Sphere', category: 'balls', count: 12, price: 5000, shardPrice: 150, description: 'Guarantees catch on any Prismatic encounter.', icon: '💎' },
    { id: 'p1', name: 'Hyper Potion', category: 'potions', count: 50, price: 1500, description: 'Restores 200 HP to all squad members.', icon: '🧪' },
    { id: 's1', name: 'Supernova Holo-Shader', category: 'shaders', count: 1, price: 0, shardPrice: 1000, description: 'Cosmetic aura skin for squad leaders.', icon: '✨' },
    { id: 'm1', name: 'Prismatic Core Magnet', category: 'materials', count: 5, price: 0, shardPrice: 300, description: 'Lures rare dimensional rifts.', icon: '🧲' },
  ];

  // GTS Market Listings
  public gtsListings: GTSListing[] = [];

  // Active Raid Boss
  public activeRaid: RaidBoss = {
    id: 'raid_omega_rayquaza',
    name: 'Cosmic Mega-Rayquaza',
    tier: 'Omega',
    level: 350,
    element: 'Dragon',
    maxHp: 250000,
    currentHp: 182400,
    prismaticTier: 'Supernova',
    participants: [
      { id: 'p1', name: 'Red_Apex', damageDealt: 45200, avatarUrl: '🧢' },
      { id: 'p2', name: 'Cynthia_Sinnoh', damageDealt: 38900, avatarUrl: '⚡' },
      { id: 'p3', name: 'Steven_Stone', damageDealt: 51200, avatarUrl: '💎' },
      { id: 'p4', name: 'You (Player)', damageDealt: 47100, avatarUrl: '👑' },
    ],
    timeRemainingSeconds: 580,
  };

  // Continuous Auto-Combat State
  public isBattling: boolean = true;
  public waveNumber: number = 1;
  public activeEnemies: ActiveCombatant[] = [];
  public squadCombatants: ActiveCombatant[] = [];
  public combatLogs: CombatLogEntry[] = [];

  // Listeners
  private subscribers: Array<() => void> = [];
  public worldManager: WorldSceneManager | null = null;
  private combatTimer: number | null = null;

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  private constructor() {
    this.initDefaultSquad();
    this.initGTSListings();
    this.startCombatLoop();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  public bindWorldManager(wm: WorldSceneManager) {
    this.worldManager = wm;
    this.sync3DScene();
  }

  private initDefaultSquad() {
    // Starting lineup across multiple generations:
    // Dex 6: Charizard, Dex 25: Pikachu, Dex 448: Lucario, Dex 445: Garchomp, Dex 9: Blastoise
    const charizard = createPokemonInstanceByDex(6, 48);
    const pikachu = createPokemonInstanceByDex(25, 42);
    const lucario = createPokemonInstanceByDex(448, 45, 'Radiant');
    const garchomp = createPokemonInstanceByDex(445, 46);
    const blastoise = createPokemonInstanceByDex(9, 44);

    this.squad = [charizard, pikachu, lucario, garchomp, blastoise];
    this.squad.forEach(p => this.pokedexCaught.add(p.dexNumber));

    // Walking buddy: Dex 778 Mimikyu (Shiny)
    this.buddy = createPokemonInstanceByDex(778, 40, 'Shiny');
    this.buddyData.pokemonId = this.buddy.id;
    this.pokedexCaught.add(this.buddy.dexNumber);

    // Initial PC Box specimens: Dex 3 Venusaur, Dex 94 Gengar, Dex 150 Mewtwo (Ethereal)
    this.pcBox.push(createPokemonInstanceByDex(3, 35));
    this.pcBox.push(createPokemonInstanceByDex(94, 38));
    this.pcBox.push(createPokemonInstanceByDex(150, 50, 'Ethereal'));
    this.pcBox.push(createPokemonInstanceByDex(384, 70, 'Supernova')); // Rayquaza

    // Fetch PokeAPI real moves & stats asynchronously to upgrade default squad seamlessly
    this.enrichSquadWithPokeApi();
    this.initCombatants();
  }

  private async enrichSquadWithPokeApi() {
    for (const p of this.squad) {
      try {
        const details = await pokeApiService.getPokemonDetails(p.dexNumber);
        if (details.moves.length > 0) p.moves = details.moves;
        p.speciesName = details.name;
      } catch (_e) {
        // silent fallback
      }
    }
    this.notify();
  }

  private initGTSListings() {
    const listEntries = [
      { dex: 150, lvl: 70, tier: 'Ethereal' as PrismaticTier, price: 450, curr: 'shards' as const },
      { dex: 384, lvl: 150, tier: 'Supernova' as PrismaticTier, price: 1200, curr: 'shards' as const },
      { dex: 448, lvl: 100, tier: 'Radiant' as PrismaticTier, price: 85000, curr: 'dollars' as const },
      { dex: 6, lvl: 85, tier: 'Shiny' as PrismaticTier, price: 35000, curr: 'dollars' as const },
      { dex: 249, lvl: 90, tier: 'Ethereal' as PrismaticTier, price: 600, curr: 'shards' as const },
      { dex: 1007, lvl: 120, tier: 'Supernova' as PrismaticTier, price: 2000, curr: 'shards' as const },
    ];

    this.gtsListings = listEntries.map((item, idx) => ({
      id: `gts_${idx}_${Date.now()}`,
      sellerName: `Trainer_Red_${idx + 10}`,
      pokemon: createPokemonInstanceByDex(item.dex, item.lvl, item.tier),
      price: item.price,
      currency: item.curr,
      listedTimestamp: Date.now() - idx * 3600000,
    }));
  }

  private initCombatants() {
    this.squadCombatants = this.squad.map((p, idx) => ({
      pokemon: p,
      isPlayer: true,
      positionSlot: idx,
      currentHp: p.stats.hp,
      maxHp: p.stats.maxHp,
      attackCooldowns: {},
      lastAttackTimestamp: 0,
      isFainted: false,
      visual3dId: p.id,
    }));

    this.spawnEnemyWave();
  }

  /**
   * Spawns wild Pokémon from the entire Gen 1-9 catalog (all 1025 Pokémon)
   * filtered by the player's active region!
   */
  public spawnEnemyWave(forceSupernova: boolean = false) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const [minLvl, maxLvl] = currentRegion.levelRange;
    const waveLevel = Math.min(
      maxLvl,
      Math.floor(minLvl + (this.waveNumber % 30) * ((maxLvl - minLvl) / 30) + Math.random() * 5)
    );

    // Generation dex range bounds:
    // Gen 1: 1-151, Gen 2: 152-251, Gen 3: 252-386, Gen 4: 387-493, Gen 5: 494-649, Gen 6: 650-721, Gen 7: 722-809, Gen 8: 810-905, Gen 9: 906-1025
    const genRanges: [number, number][] = [
      [1, 151],
      [152, 251],
      [252, 386],
      [387, 493],
      [494, 649],
      [650, 721],
      [722, 809],
      [810, 905],
      [906, 1025],
    ];

    const [dexMin, dexMax] = genRanges[this.currentRegionIndex] || [1, 151];
    const enemyCount = 2 + Math.floor(Math.random() * 2); // 2 to 3 per wave
    this.activeEnemies = [];

    for (let i = 0; i < enemyCount; i++) {
      // Pick random dex from region's full generation pool
      const randomDex = dexMin + Math.floor(Math.random() * (dexMax - dexMin + 1));
      const tier: PrismaticTier = (i === 0 && forceSupernova)
        ? 'Supernova'
        : undefined as any;

      const enemyPkmn = createPokemonInstanceByDex(
        randomDex,
        waveLevel,
        tier,
        this.buddyData.passiveTree.prismaticResonanceTier
      );

      this.activeEnemies.push({
        pokemon: enemyPkmn,
        isPlayer: false,
        positionSlot: i,
        currentHp: enemyPkmn.stats.hp,
        maxHp: enemyPkmn.stats.maxHp,
        attackCooldowns: {},
        lastAttackTimestamp: 0,
        isFainted: false,
        visual3dId: `enemy_${this.waveNumber}_${i}_${Date.now()}`,
      });

      if (enemyPkmn.prismaticTier !== 'Standard') {
        this.addLog(
          `⚡ A wild ${enemyPkmn.prismaticTier} ${enemyPkmn.speciesName} (Dex #${enemyPkmn.dexNumber}, Lv. ${enemyPkmn.level}) appeared!`,
          'prismatic'
        );
      }
    }

    if (this.worldManager) {
      this.worldManager.syncEnemies(this.activeEnemies);
    }
    this.notify();
  }

  private startCombatLoop() {
    this.combatTimer = window.setInterval(() => {
      if (!this.isBattling) return;
      this.processCombatTick(0.1);
    }, 100);
  }

  private processCombatTick(delta: number) {
    const now = Date.now();

    // Check revive if all fainted
    const allSquadFainted = this.squadCombatants.every(c => c.isFainted);
    if (allSquadFainted) {
      this.squadCombatants.forEach(c => {
        c.isFainted = false;
        c.currentHp = c.maxHp;
      });
      this.addLog('Nurse Joy restored your squad to full vitality!', 'level');
    }

    // 1. Squad attack step
    this.squadCombatants.forEach(attacker => {
      if (attacker.isFainted) return;

      const aliveEnemies = this.activeEnemies.filter(e => !e.isFainted);
      if (aliveEnemies.length === 0) return;
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];

      const sortedMoves = [...attacker.pokemon.moves].sort((a, b) => a.priorityTier - b.priorityTier);
      const readyMove = sortedMoves.find(m => {
        const cd = attacker.attackCooldowns[m.id] || 0;
        return cd <= 0;
      });

      attacker.pokemon.moves.forEach(m => {
        const currentCd = attacker.attackCooldowns[m.id] || 0;
        if (currentCd > 0) {
          attacker.attackCooldowns[m.id] = Math.max(0, currentCd - delta);
        }
      });

      if (readyMove && (now - attacker.lastAttackTimestamp) > (readyMove.cooldown * 750)) {
        attacker.lastAttackTimestamp = now;
        attacker.attackCooldowns[readyMove.id] = readyMove.cooldown;
        this.executeAttack(attacker, target, readyMove);
      }
    });

    // 2. Enemy attack step
    this.activeEnemies.forEach(enemy => {
      if (enemy.isFainted) return;

      const aliveSquad = this.squadCombatants.filter(s => !s.isFainted);
      if (aliveSquad.length === 0) return;
      const target = aliveSquad[Math.floor(Math.random() * aliveSquad.length)];

      const move = enemy.pokemon.moves[0] || { name: 'Tackle', power: 40, type: 'Normal', cooldown: 2.0 };
      const cd = enemy.attackCooldowns['default'] || 0;
      if (cd <= 0) {
        enemy.attackCooldowns['default'] = 2.0;
        this.executeAttack(enemy, target, move as Move);
      } else {
        enemy.attackCooldowns['default'] = Math.max(0, cd - delta);
      }
    });

    // 3. Auto-Catch checks
    this.activeEnemies.forEach(enemy => {
      if (enemy.isFainted) return;

      if (this.autoCatchSettings.enabled && this.inventory.find(i => i.category === 'balls' && i.count > 0)) {
        const isPrismatic = enemy.pokemon.prismaticTier !== 'Standard';
        const isUnregistered = !this.pokedexCaught.has(enemy.pokemon.dexNumber);

        const shouldThrow =
          (isPrismatic) ||
          (this.autoCatchSettings.catchUnregistered && isUnregistered) ||
          (!this.autoCatchSettings.targetPrismaticOnly && enemy.currentHp < enemy.maxHp * 0.4);

        if (shouldThrow && Math.random() < 0.28) {
          this.attemptCapture(enemy);
        }
      }
    });

    // 4. Wave resolution
    if (this.activeEnemies.length > 0 && this.activeEnemies.every(e => e.isFainted)) {
      this.waveNumber++;
      const goldAward = Math.floor(180 * (1 + this.buddyData.passiveTree.goldHoarderTier * 0.35) * (1 + this.currentRegionIndex * 0.5));
      this.pokeDollars += goldAward;

      if (Math.random() < 0.35 + this.buddyData.passiveTree.autoDowsingTier * 0.1) {
        const shardsAward = 8 + Math.floor(Math.random() * 12);
        this.prismaticShards += shardsAward;
      }

      this.spawnEnemyWave();
    }
  }

  private executeAttack(attacker: ActiveCombatant, target: ActiveCombatant, move: Move) {
    const lvl = attacker.pokemon.level;
    const atk = attacker.pokemon.stats.atk;
    const def = target.pokemon.stats.def;
    const baseDmg = Math.floor((((2 * lvl / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50) + 2);
    const variance = 0.85 + Math.random() * 0.3;
    const damage = Math.max(1, Math.floor(baseDmg * variance));

    target.currentHp = Math.max(0, target.currentHp - damage);

    if (this.worldManager) {
      const fromMesh = attacker.isPlayer
        ? this.worldManager.playerMeshes.get(attacker.pokemon.id)
        : this.worldManager.enemyMeshes.get(attacker.visual3dId);

      const targetMesh = target.isPlayer
        ? this.worldManager.playerMeshes.get(target.pokemon.id)
        : this.worldManager.enemyMeshes.get(target.visual3dId);

      if (fromMesh && targetMesh) {
        this.worldManager.triggerAttackFx(fromMesh.group.position, targetMesh.group.position, move.type);
        this.worldManager.addFloatingText(
          `-${damage}`,
          attacker.isPlayer ? '#ef4444' : '#f97316',
          targetMesh.group.position.clone().add(new THREE.Vector3(0, 1.6, 0))
        );
      }
    }

    if (target.currentHp <= 0) {
      target.isFainted = true;
      if (attacker.isPlayer) {
        this.gainExp(attacker.pokemon, target.pokemon.level * 50);
        this.addLog(`${attacker.pokemon.speciesName} fainted wild ${target.pokemon.speciesName}!`, 'faint');
      }
    }
  }

  private attemptCapture(enemy: ActiveCombatant) {
    const ballItem = this.inventory.find(i => i.id === (
      this.autoCatchSettings.preferredBall === 'ultra' ? 'b3' :
      this.autoCatchSettings.preferredBall === 'prismatic' ? 'b4' :
      this.autoCatchSettings.preferredBall === 'great' ? 'b2' : 'b1'
    )) || this.inventory.find(i => i.category === 'balls' && i.count > 0);

    if (!ballItem || ballItem.count <= 0) return;
    ballItem.count--;

    const isMasterBallTier = ballItem.id === 'b4';
    const hpFactor = 1 - (enemy.currentHp / enemy.maxHp);
    const catchRate = isMasterBallTier ? 1.0 : (0.4 + hpFactor * 0.5);

    if (Math.random() < catchRate) {
      enemy.isFainted = true;
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
        `🎉 Successfully caught ${enemy.pokemon.prismaticTier !== 'Standard' ? enemy.pokemon.prismaticTier + ' ' : ''}${enemy.pokemon.speciesName} (Dex #${enemy.pokemon.dexNumber}, Lv. ${enemy.pokemon.level}) with ${ballItem.name}!`,
        'catch'
      );

      if (this.worldManager) {
        const mesh = this.worldManager.enemyMeshes.get(enemy.visual3dId);
        if (mesh) {
          this.worldManager.addFloatingText('CAUGHT! ⭐', '#eab308', mesh.group.position.clone().add(new THREE.Vector3(0, 2.0, 0)));
        }
      }
    } else {
      if (this.worldManager) {
        const mesh = this.worldManager.enemyMeshes.get(enemy.visual3dId);
        if (mesh) {
          this.worldManager.addFloatingText('Broke free!', '#9ca3af', mesh.group.position.clone().add(new THREE.Vector3(0, 2.0, 0)));
        }
      }
    }
    this.notify();
  }

  public gainExp(pokemon: PokemonData, expAmount: number) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const currentGym = currentRegion.gyms.find(g => !g.defeated);
    const maxCap = currentGym ? currentGym.levelRequirement : currentRegion.levelRange[1];

    if (pokemon.level >= maxCap) {
      return;
    }

    pokemon.currentExp += expAmount;
    if (pokemon.currentExp >= pokemon.expToNextLevel) {
      pokemon.level++;
      pokemon.currentExp = 0;
      pokemon.expToNextLevel = pokemon.level * 100;
      pokemon.stats = calculatePokemonStats(pokemon.baseStats, pokemon.ivs, pokemon.evs, pokemon.level);

      const combatant = this.squadCombatants.find(c => c.pokemon.id === pokemon.id);
      if (combatant) {
        combatant.maxHp = pokemon.stats.maxHp;
        combatant.currentHp = pokemon.stats.maxHp;
      }

      this.addLog(`⭐ ${pokemon.speciesName} leveled up to Lv. ${pokemon.level}!`, 'level');
    }
    this.notify();
  }

  public switchRegion(regionIndex: number) {
    if (regionIndex < 0 || regionIndex >= REGIONS_DATA.length) return;
    this.currentRegionIndex = regionIndex;
    const region = REGIONS_DATA[regionIndex];
    if (this.worldManager) {
      this.worldManager.setBiome(region);
    }
    this.waveNumber = 1;
    this.spawnEnemyWave();
    this.addLog(`🌍 Traveled to Region ${region.id}: ${region.name} (${region.generation})`, 'prismatic');
    this.notify();
  }

  public defeatGymLeader(gymId: number) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const gym = currentRegion.gyms.find(g => g.id === gymId);
    if (!gym || gym.defeated) return;

    gym.defeated = true;
    this.prismaticShards += gym.rewardShards;
    this.pokeDollars += gym.rewardShards * 50;

    const nextGym = currentRegion.gyms.find(g => !g.defeated);
    if (nextGym) {
      nextGym.unlocked = true;
    } else {
      if (this.currentRegionIndex < REGIONS_DATA.length - 1) {
        this.maxUnlockedRegionIndex = Math.max(this.maxUnlockedRegionIndex, this.currentRegionIndex + 1);
        REGIONS_DATA[this.currentRegionIndex + 1].gyms[0].unlocked = true;
      }
    }

    this.addLog(`🏆 Defeated Gym Leader ${gym.name}! Earned ${gym.badgeName} and unlocked Level Cap!`, 'prismatic');
    this.notify();
  }

  public setBuddy(pokemon: PokemonData) {
    this.buddy = pokemon;
    this.buddyData.pokemonId = pokemon.id;
    if (this.worldManager) {
      this.worldManager.syncSquad(this.squad, this.buddy);
    }
    this.notify();
  }

  public swapSquadMember(squadIndex: number, pcBoxIndex: number) {
    if (squadIndex < 0 || squadIndex >= this.squad.length) return;
    if (pcBoxIndex < 0 || pcBoxIndex >= this.pcBox.length) return;

    const currentSquadPkmn = this.squad[squadIndex];
    const newSquadPkmn = this.pcBox[pcBoxIndex];

    this.squad[squadIndex] = newSquadPkmn;
    this.pcBox[pcBoxIndex] = currentSquadPkmn;

    this.initCombatants();
    this.sync3DScene();
    this.notify();
  }

  public sync3DScene() {
    if (this.worldManager) {
      this.worldManager.syncSquad(this.squad, this.buddy || undefined);
      this.worldManager.syncEnemies(this.activeEnemies);
    }
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
