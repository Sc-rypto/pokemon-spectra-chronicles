import {
  PokemonData,
  ActiveCombatant,
  AutoCatchSettings,
  BuddyData,
  PrismaticTier,
  Move,
  InventoryItem,
  MarketListing,
  RaidBossState,
} from '../types/game';
import {
  REGIONS_DATA,
  createPokemonInstanceByDex,
  calculatePokemonStats,
  getPokemonSpriteUrls,
} from '../data/pokemonCatalog';
import { pokeApiService } from '../services/PokeApiService';

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'damage' | 'catch' | 'faint' | 'level' | 'prismatic';
}

export class GameStateManager {
  private static instance: GameStateManager;

  // Real Economy: Player Earned Wallet
  public pokeDollars: number = 2500;
  public prismaticShards: number = 150;

  // Regions & Level Caps
  public currentRegionIndex: number = 0; // 0 to 8
  public maxUnlockedRegionIndex: number = 0;

  // Collection
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

  // Real Inventory (Economy Driven: Purchased or Looted)
  public inventory: InventoryItem[] = [
    { id: 'b1', name: 'Poké Ball', category: 'balls', count: 25, price: 200, description: 'Standard capture device for wild encounters.', icon: '🔴' },
    { id: 'b2', name: 'Great Ball', category: 'balls', count: 5, price: 600, description: 'Higher capture rate ball.', icon: '🔵' },
    { id: 'b3', name: 'Ultra Ball', category: 'balls', count: 0, price: 1200, description: 'High-performance capture ball.', icon: '🟡' },
    { id: 'b4', name: 'Prismatic Sphere', category: 'balls', count: 1, price: 5000, shardPrice: 150, description: 'Guarantees catch on any encounter.', icon: '💎' },
    { id: 'p1', name: 'Super Potion', category: 'potions', count: 10, price: 700, description: 'Restores 100 HP to all squad members.', icon: '🧪' },
    { id: 's1', name: 'Supernova Shader Aura', category: 'shaders', count: 0, price: 0, shardPrice: 1000, description: 'Unlocks Cosmic flame aura cosmetics.', icon: '✨' },
  ];

  // Real User Market Listings (Zero fake bots)
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
    spriteUrl: getPokemonSpriteUrls(150).sprite,
    artworkUrl: getPokemonSpriteUrls(150).artwork,
  };

  // Continuous Auto-Combat State
  public isBattling: boolean = true;
  public waveNumber: number = 1;
  public activeEnemies: ActiveCombatant[] = [];
  public squadCombatants: ActiveCombatant[] = [];
  public combatLogs: CombatLogEntry[] = [];

  // Active Battle Visual Attack Beams & Float Texts
  public visualEffects: { id: string; fromX: number; fromY: number; toX: number; toY: number; color: string; life: number }[] = [];
  public floatingTexts: { id: string; text: string; color: string; x: number; y: number; opacity: number }[] = [];

  // Reactive listeners
  private subscribers: Array<() => void> = [];
  private combatTimer: number | null = null;

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

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  // Authentic Starter Lineup like Tallgrass: Starter + Companions
  private initStarterSquad() {
    // Kanto starters: Dex 6 Charizard, Dex 9 Blastoise, Dex 3 Venusaur, Dex 25 Pikachu, Dex 448 Lucario
    const charizard = createPokemonInstanceByDex(6, 12);
    const pikachu = createPokemonInstanceByDex(25, 10);
    const blastoise = createPokemonInstanceByDex(9, 11);
    const venusaur = createPokemonInstanceByDex(3, 10);
    const lucario = createPokemonInstanceByDex(448, 12, 'Radiant');

    this.squad = [charizard, pikachu, blastoise, venusaur, lucario];
    this.squad.forEach(p => this.pokedexCaught.add(p.dexNumber));

    // Walking buddy: Dex 778 Mimikyu (Shiny)
    this.buddy = createPokemonInstanceByDex(778, 10, 'Shiny');
    this.buddyData.pokemonId = this.buddy.id;
    this.pokedexCaught.add(this.buddy.dexNumber);

    // Initial PC Box specimens
    this.pcBox.push(createPokemonInstanceByDex(133, 8)); // Eevee
    this.pcBox.push(createPokemonInstanceByDex(94, 15, 'Ethereal')); // Gengar

    this.initCombatants();
  }

  private initCombatants() {
    // 5 squad slots positioned on the LEFT side of the meadow
    const playerSlots = [
      { x: 14, y: 22 },
      { x: 26, y: 38 },
      { x: 12, y: 55 },
      { x: 24, y: 72 },
      { x: 14, y: 85 },
    ];

    this.squadCombatants = this.squad.map((p, idx) => {
      const slot = playerSlots[idx] || playerSlots[0];
      return {
        pokemon: p,
        isPlayer: true,
        positionSlot: idx,
        currentHp: p.stats.hp,
        maxHp: p.stats.maxHp,
        x: slot.x,
        y: slot.y,
        targetX: slot.x,
        targetY: slot.y,
        facing: 'right',
        wanderTimer: Math.random() * 2,
        attackCooldowns: {},
        lastAttackTimestamp: 0,
        isFainted: false,
        visualId: p.id,
        lungeProgress: 0,
        shakeTimer: 0,
      };
    });

    this.spawnEnemyWave();
  }

  /**
   * Spawns 2 to 4 wild Pokémon on the RIGHT side of the meadow,
   * roaming and engaging freely across screen!
   */
  public spawnEnemyWave(forceSupernova: boolean = false) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const [minLvl, maxLvl] = currentRegion.levelRange;
    const waveLevel = Math.min(
      maxLvl,
      Math.floor(minLvl + (this.waveNumber % 20) * ((maxLvl - minLvl) / 20) + Math.random() * 3)
    );

    const [dexMin, dexMax] = currentRegion.dexRange;
    const enemyCount = 2 + Math.floor(Math.random() * 2); // 2 to 3 enemies per wave
    this.activeEnemies = [];

    const enemySlots = [
      { x: 80, y: 25 },
      { x: 68, y: 48 },
      { x: 82, y: 70 },
      { x: 70, y: 85 },
    ];

    for (let i = 0; i < enemyCount; i++) {
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

      const slot = enemySlots[i] || enemySlots[0];

      this.activeEnemies.push({
        pokemon: enemyPkmn,
        isPlayer: false,
        positionSlot: i,
        currentHp: enemyPkmn.stats.hp,
        maxHp: enemyPkmn.stats.maxHp,
        x: slot.x,
        y: slot.y,
        targetX: slot.x,
        targetY: slot.y,
        facing: 'left',
        wanderTimer: Math.random() * 2,
        attackCooldowns: {},
        lastAttackTimestamp: 0,
        isFainted: false,
        visualId: `enemy_${this.waveNumber}_${i}_${Date.now()}`,
        lungeProgress: 0,
        shakeTimer: 0,
      });

      if (enemyPkmn.prismaticTier !== 'Standard') {
        this.addLog(
          `⚡ A wild ${enemyPkmn.prismaticTier} ${enemyPkmn.speciesName} (Dex #${enemyPkmn.dexNumber}, Lv. ${enemyPkmn.level}) appeared in the Meadow!`,
          'prismatic'
        );
      }
    }

    this.notify();
  }

  private startCombatLoop() {
    this.combatTimer = window.setInterval(() => {
      this.processCombatTick(0.1);
    }, 100);
  }

  private processCombatTick(delta: number) {
    const now = Date.now();

    // 1. UPDATE FREE-ROAMING MEADOW MOVEMENT FOR ALL COMBATANTS
    const updateUnitMovement = (c: ActiveCombatant, minX: number, maxX: number) => {
      if (c.isFainted) return;

      // Decrement timers
      if (c.lungeProgress > 0) {
        c.lungeProgress = Math.max(0, c.lungeProgress - delta * 3.0);
      }
      if (c.shakeTimer > 0) {
        c.shakeTimer = Math.max(0, c.shakeTimer - delta * 3.0);
      }

      c.wanderTimer -= delta;
      if (c.wanderTimer <= 0) {
        c.wanderTimer = 1.8 + Math.random() * 3.0;
        // Wander freely within their designated zone
        c.targetX = minX + Math.random() * (maxX - minX);
        c.targetY = 18 + Math.random() * 68;
        c.facing = c.targetX >= c.x ? 'right' : 'left';
      }

      // Smooth step towards wander target
      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0.5) {
        const speed = (c.isPlayer ? 4.5 : 5.5) * delta;
        c.x += (dx / dist) * Math.min(dist, speed);
        c.y += (dy / dist) * Math.min(dist, speed);
      }
    };

    // Player squad roams in the left 10% - 45% of the meadow
    this.squadCombatants.forEach(s => updateUnitMovement(s, 8, 42));
    // Wild enemies roam in the right 55% - 90% of the meadow
    this.activeEnemies.forEach(e => updateUnitMovement(e, 58, 90));

    // Update floating combat numbers & visual attack beams
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.6;
      ft.opacity -= 0.035;
      if (ft.opacity <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.visualEffects.length - 1; i >= 0; i--) {
      const fx = this.visualEffects[i];
      fx.life -= delta * 4;
      if (fx.life <= 0) this.visualEffects.splice(i, 1);
    }

    if (!this.isBattling) {
      this.notify();
      return;
    }

    // Revive check
    const allSquadFainted = this.squadCombatants.every(c => c.isFainted);
    if (allSquadFainted) {
      this.squadCombatants.forEach(c => {
        c.isFainted = false;
        c.currentHp = c.maxHp;
      });
      this.addLog('Nurse Joy restored your squad to full vitality!', 'level');
    }

    // 2. SQUAD AUTO-ATTACK
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

      if (readyMove && (now - attacker.lastAttackTimestamp) > (readyMove.cooldown * 700)) {
        attacker.lastAttackTimestamp = now;
        attacker.attackCooldowns[readyMove.id] = readyMove.cooldown;
        this.executeAttack(attacker, target, readyMove);
      }
    });

    // 3. ENEMY ATTACK
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

    // 4. AUTO-CATCH RULES
    this.activeEnemies.forEach(enemy => {
      if (enemy.isFainted) return;

      if (this.autoCatchSettings.enabled && this.inventory.find(i => i.category === 'balls' && i.count > 0)) {
        const isPrismatic = enemy.pokemon.prismaticTier !== 'Standard';
        const isUnregistered = !this.pokedexCaught.has(enemy.pokemon.dexNumber);

        const shouldThrow =
          (isPrismatic) ||
          (this.autoCatchSettings.catchUnregistered && isUnregistered) ||
          (!this.autoCatchSettings.targetPrismaticOnly && enemy.currentHp < enemy.maxHp * 0.45);

        if (shouldThrow && Math.random() < 0.25) {
          this.attemptCapture(enemy);
        }
      }
    });

    // 5. WAVE CLEAR & REWARDS
    if (this.activeEnemies.length > 0 && this.activeEnemies.every(e => e.isFainted)) {
      this.waveNumber++;
      const goldAward = Math.floor(120 * (1 + this.buddyData.passiveTree.goldHoarderTier * 0.4) * (1 + this.currentRegionIndex * 0.6));
      this.pokeDollars += goldAward;

      if (Math.random() < 0.35 + this.buddyData.passiveTree.autoDowsingTier * 0.12) {
        const shardsAward = 6 + Math.floor(Math.random() * 8);
        this.prismaticShards += shardsAward;
      }

      this.spawnEnemyWave();
    }

    this.notify();
  }

  private executeAttack(attacker: ActiveCombatant, target: ActiveCombatant, move: Move) {
    const lvl = attacker.pokemon.level;
    const atk = attacker.pokemon.stats.atk;
    const def = target.pokemon.stats.def;
    const baseDmg = Math.floor((((2 * lvl / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50) + 2);
    const variance = 0.85 + Math.random() * 0.3;
    const damage = Math.max(1, Math.floor(baseDmg * variance));

    target.currentHp = Math.max(0, target.currentHp - damage);

    // Trigger physical dash forward and hit reaction shake
    attacker.lungeProgress = 1.0;
    target.shakeTimer = 1.0;

    // Visual beam & damage pop
    const beamColor = move.type === 'Fire' ? '#f97316' : move.type === 'Water' ? '#38bdf8' : move.type === 'Electric' ? '#facc15' : move.type === 'Grass' ? '#4ade80' : '#c084fc';
    this.visualEffects.push({
      id: `fx_${Date.now()}_${Math.random()}`,
      fromX: attacker.x,
      fromY: attacker.y,
      toX: target.x,
      toY: target.y,
      color: beamColor,
      life: 1.0,
    });

    this.floatingTexts.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      text: `-${damage}`,
      color: attacker.isPlayer ? '#ef4444' : '#f97316',
      x: target.x,
      y: target.y - 4,
      opacity: 1.0,
    });

    if (target.currentHp <= 0) {
      target.isFainted = true;
      if (attacker.isPlayer) {
        this.gainExp(attacker.pokemon, target.pokemon.level * 45);
        this.addLog(`${attacker.pokemon.speciesName} fainted wild ${target.pokemon.speciesName}!`, 'faint');
      }
    }
  }

  public manualThrowBall(ballId: string, enemyVisualId?: string) {
    const ballItem = this.inventory.find(i => i.id === ballId && i.count > 0);
    if (!ballItem) return;

    const aliveEnemies = this.activeEnemies.filter(e => !e.isFainted);
    if (aliveEnemies.length === 0) return;

    const target = (enemyVisualId ? aliveEnemies.find(e => e.visualId === enemyVisualId) : null) || aliveEnemies[0];
    this.attemptCapture(target, ballItem);
  }

  private attemptCapture(enemy: ActiveCombatant, specificBall?: InventoryItem) {
    const ballItem = specificBall || this.inventory.find(i => i.id === (
      this.autoCatchSettings.preferredBall === 'ultra' ? 'b3' :
      this.autoCatchSettings.preferredBall === 'prismatic' ? 'b4' :
      this.autoCatchSettings.preferredBall === 'great' ? 'b2' : 'b1'
    )) || this.inventory.find(i => i.category === 'balls' && i.count > 0);

    if (!ballItem || ballItem.count <= 0) return;
    ballItem.count--;

    const isMaster = ballItem.id === 'b4';
    const hpFactor = 1 - (enemy.currentHp / enemy.maxHp);
    const catchRate = isMaster ? 1.0 : (0.4 + hpFactor * 0.55);

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
        `🎉 Successfully captured ${enemy.pokemon.prismaticTier !== 'Standard' ? enemy.pokemon.prismaticTier + ' ' : ''}${enemy.pokemon.speciesName} (Lv. ${enemy.pokemon.level}) with ${ballItem.name}!`,
        'catch'
      );

      this.floatingTexts.push({
        id: `c_${Date.now()}`,
        text: 'CAUGHT! ⭐',
        color: '#eab308',
        x: enemy.x,
        y: enemy.y - 6,
        opacity: 1.0,
      });
    } else {
      this.floatingTexts.push({
        id: `f_${Date.now()}`,
        text: 'Broke free!',
        color: '#94a3b8',
        x: enemy.x,
        y: enemy.y - 6,
        opacity: 1.0,
      });
    }
    this.notify();
  }

  // Playable Overworld Raid Attack
  public strikeRaidBoss() {
    if (!this.activeRaid.active) return;
    const playerAtk = this.squad.reduce((sum, p) => sum + p.stats.atk, 0);
    const dmg = Math.floor(playerAtk * (1.8 + Math.random() * 0.8));

    this.activeRaid.currentHp = Math.max(0, this.activeRaid.currentHp - dmg);
    this.activeRaid.totalDamageDealt += dmg;

    // Real economy rewards per raid strike
    const goldEarned = Math.floor(dmg * 0.15);
    const shardsEarned = Math.floor(dmg * 0.005);
    this.pokeDollars += goldEarned;
    this.prismaticShards += shardsEarned;

    this.addLog(`⚔️ Struck Raid Boss for ${dmg.toLocaleString()} DMG! Earned ₽${goldEarned} and ${shardsEarned} 💎`, 'damage');

    if (this.activeRaid.currentHp <= 0) {
      this.addLog(`🏆 RAID VICTORY: Defeated ${this.activeRaid.name}! Awarded +5,000 Shards & Legendary Dex entry!`, 'prismatic');
      this.prismaticShards += 5000;
      this.pokeDollars += 50000;
      // Reset for next tier
      this.activeRaid.currentHp = this.activeRaid.maxHp;
    }

    this.notify();
  }

  public gainExp(pokemon: PokemonData, expAmount: number) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const currentGym = currentRegion.gyms.find(g => !g.defeated);
    const maxCap = currentGym ? currentGym.levelRequirement : currentRegion.levelRange[1];

    if (pokemon.level >= maxCap) return;

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
    this.pokeDollars += gym.rewardDollars;

    const nextGym = currentRegion.gyms.find(g => !g.defeated);
    if (nextGym) {
      nextGym.unlocked = true;
    } else {
      if (this.currentRegionIndex < REGIONS_DATA.length - 1) {
        this.maxUnlockedRegionIndex = Math.max(this.maxUnlockedRegionIndex, this.currentRegionIndex + 1);
        REGIONS_DATA[this.currentRegionIndex + 1].gyms[0].unlocked = true;
      }
    }

    this.addLog(`🏆 Defeated Gym Leader ${gym.name}! Earned ${gym.badgeName} (+₽${gym.rewardDollars.toLocaleString()}) and unlocked Level Cap!`, 'prismatic');
    this.notify();
  }

  public setBuddy(pokemon: PokemonData) {
    this.buddy = pokemon;
    this.buddyData.pokemonId = pokemon.id;
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
    this.notify();
  }

  // Real Player Marketplace Listing
  public listPokemonOnMarket(pcIndex: number, price: number, currency: 'dollars' | 'shards') {
    if (pcIndex < 0 || pcIndex >= this.pcBox.length) return;
    const pkmn = this.pcBox.splice(pcIndex, 1)[0];
    this.marketListings.push({
      id: `list_${Date.now()}_${Math.random()}`,
      sellerTrainerName: 'You (Player)',
      isPlayerListing: true,
      pokemon: pkmn,
      price,
      currency,
      listedTimestamp: Date.now(),
    });
    this.addLog(`Listed ${pkmn.speciesName} on the Global Market for ${price} ${currency}!`, 'catch');
    this.notify();
  }

  public cancelMarketListing(listingId: string) {
    const idx = this.marketListings.findIndex(l => l.id === listingId);
    if (idx !== -1) {
      const listing = this.marketListings.splice(idx, 1)[0];
      this.pcBox.push(listing.pokemon);
      this.addLog(`Reclaimed ${listing.pokemon.speciesName} to PC Box.`, 'level');
      this.notify();
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
