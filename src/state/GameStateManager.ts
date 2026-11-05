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
} from '../types/game';
import {
  REGIONS_DATA,
  createPokemonInstanceByDex,
  calculatePokemonStats,
  getPokemonSpriteUrls,
  calculateTypeMultiplier,
  ASSET_ICONS,
} from '../data/pokemonCatalog';

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

  // Regions & Gym Badges
  public currentRegionIndex: number = 0;
  public maxUnlockedRegionIndex: number = 0;

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
  
  // Walking Buddy
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

  // Real Inventory (Official Capture Orbs & Potions)
  public inventory: InventoryItem[] = [
    { id: 'b1', name: 'Capture Orb', category: 'balls', count: 40, price: 200, description: 'Standard capture sphere used to safely secure weakened Pokémon in the Meadow.', icon: ASSET_ICONS.pokeBall, catchMultiplier: 1.0 },
    { id: 'b2', name: 'Great Orb', category: 'balls', count: 12, price: 600, description: 'Reinforced capture sphere with higher odds.', icon: ASSET_ICONS.greatBall, catchMultiplier: 1.5 },
    { id: 'b3', name: 'Ultra Orb', category: 'balls', count: 5, price: 1200, description: 'High-performance capture orb designed for difficult catches.', icon: ASSET_ICONS.ultraBall, catchMultiplier: 2.0 },
    { id: 'b4', name: 'Prism Orb', category: 'balls', count: 1, price: 5000, shardPrice: 150, description: 'Guarantees 100% capture rate on any Pokémon or Prismatic variant.', icon: ASSET_ICONS.masterBall, catchMultiplier: 255.0 },
    { id: 'p1', name: 'Super Potion', category: 'potions', count: 15, price: 700, description: 'Restores 100 HP to your active battler.', icon: ASSET_ICONS.potion },
    { id: 'm1', name: 'Prismatic Shard', category: 'materials', count: 18, price: 0, shardPrice: 0, description: 'Rare dimensional material.', icon: ASSET_ICONS.prismaticShard },
  ];

  // Real Player Marketplace (Zero bots)
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

  // Floating Combat Numbers & Attack Laser Beams
  public floatingTexts: { id: string; text: string; color: string; x: number; y: number; opacity: number }[] = [];
  public attackBeams: { id: string; fromX: number; fromY: number; toX: number; toY: number; color: string; life: number }[] = [];

  // Selected Throwing Ball for manual capture
  public selectedThrowingBall: string = 'b1';

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

  public notify() {
    this.subscribers.forEach(cb => cb());
  }

  private initStarterSquad() {
    const charizard = createPokemonInstanceByDex(6, 15);
    const pikachu = createPokemonInstanceByDex(25, 12);
    const blastoise = createPokemonInstanceByDex(9, 14);
    const venusaur = createPokemonInstanceByDex(3, 13);
    const lucario = createPokemonInstanceByDex(448, 16, 'Radiant');

    this.squad = [charizard, pikachu, blastoise, venusaur, lucario];
    this.squad.forEach(p => this.pokedexCaught.add(p.dexNumber));

    this.buddy = createPokemonInstanceByDex(778, 12, 'Shiny');
    this.buddyData.pokemonId = this.buddy.id;
    this.pokedexCaught.add(this.buddy.dexNumber);

    this.pcBox.push(createPokemonInstanceByDex(133, 10)); // Eevee
    this.pcBox.push(createPokemonInstanceByDex(94, 18, 'Ethereal')); // Gengar

    this.init1v1Combatants();
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
      wanderTimer: 2.0,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: 0,
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
      wanderTimer: 2.0,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: 0,
    };

    this.spawnWildEncounter();
  }

  public spawnWildEncounter(forceSupernova: boolean = false) {
    const currentRegion = REGIONS_DATA[this.currentRegionIndex];
    const [minLvl, maxLvl] = currentRegion.levelRange;
    const wildLevel = Math.min(
      maxLvl,
      Math.floor(minLvl + (this.waveNumber % 25) * ((maxLvl - minLvl) / 25) + Math.random() * 4)
    );

    const [dexMin, dexMax] = currentRegion.dexRange;
    const randomDex = dexMin + Math.floor(Math.random() * (dexMax - dexMin + 1));
    const tier: PrismaticTier = forceSupernova ? 'Supernova' : undefined as any;

    const wildPokemon = createPokemonInstanceByDex(
      randomDex,
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
      wanderTimer: 2.5,
      lungeX: 0,
      shakeX: 0,
      attackCooldowns: {},
      lastAttackTimestamp: 0,
    };

    if (wildPokemon.prismaticTier !== 'Standard') {
      this.addLog(
        `⚡ A wild ${wildPokemon.prismaticTier} ${wildPokemon.speciesName} (Lv. ${wildPokemon.level}) appeared in the Meadow!`,
        'prismatic'
      );
    }

    this.notify();
  }

  private startCombatLoop() {
    this.combatTimer = window.setInterval(() => {
      this.process1v1Tick(0.1);
    }, 100);
  }

  private process1v1Tick(delta: number) {
    const now = Date.now();

    // 1. UPDATE MEADOW ROAMING & SHAKE / LUNGE TIMERS
    const updateUnitMotion = (c: Active1v1Combatant, minX: number, maxX: number) => {
      if (c.lungeX !== 0) {
        c.lungeX *= 0.75;
        if (Math.abs(c.lungeX) < 0.2) c.lungeX = 0;
      }
      if (c.shakeX !== 0) {
        c.shakeX *= -0.7;
        if (Math.abs(c.shakeX) < 0.2) c.shakeX = 0;
      }

      c.wanderTimer -= delta;
      if (c.wanderTimer <= 0) {
        c.wanderTimer = 2.0 + Math.random() * 3.0;
        c.targetX = minX + Math.random() * (maxX - minX);
        c.targetY = 35 + Math.random() * 35;
      }

      const dx = c.targetX - c.x;
      const dy = c.targetY - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.4) {
        const step = Math.min(dist, 4.0 * delta);
        c.x += (dx / dist) * step;
        c.y += (dy / dist) * step;
      }
    };

    if (this.playerCombatant) updateUnitMotion(this.playerCombatant, 15, 35);
    if (this.wildCombatant) updateUnitMotion(this.wildCombatant, 65, 82);

    // Update floating damage texts & attack beams
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.8;
      ft.opacity -= 0.04;
      if (ft.opacity <= 0) this.floatingTexts.splice(i, 1);
    }
    for (let i = this.attackBeams.length - 1; i >= 0; i--) {
      const b = this.attackBeams[i];
      b.life -= delta * 4;
      if (b.life <= 0) this.attackBeams.splice(i, 1);
    }

    if (!this.isBattling || !this.playerCombatant || !this.wildCombatant) {
      this.notify();
      return;
    }

    // 2. CHECK REVIVE IF PLAYER FAINTED
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

    // 3. TALLGRASS BATTLE TICK: Player auto-attack or manual trigger
    // Tallgrass Mechanic: If wild is low HP (<25%), prefer "Gentle Tap" so as NOT to knock it out!
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

    if (chosenMove && (now - this.playerCombatant.lastAttackTimestamp) > (chosenMove.cooldown * 650)) {
      this.playerCombatant.lastAttackTimestamp = now;
      this.playerCombatant.attackCooldowns[chosenMove.id] = chosenMove.cooldown;
      this.executeTallgrassMove(this.playerCombatant, this.wildCombatant, chosenMove);
    }

    // 4. Wild Pokemon counter-attack
    const wildMove = this.wildCombatant.pokemon.moves[1] || this.wildCombatant.pokemon.moves[0];
    const wCd = this.wildCombatant.attackCooldowns['default'] || 0;
    if (wCd <= 0) {
      this.wildCombatant.attackCooldowns['default'] = 2.4;
      this.executeTallgrassMove(this.wildCombatant, this.playerCombatant, wildMove as Move);
    } else {
      this.wildCombatant.attackCooldowns['default'] = Math.max(0, wCd - delta);
    }

    // 5. AUTO-CATCH TRIGGER CHECK
    if (this.autoCatchSettings.enabled && this.wildCombatant.currentHp > 0) {
      const isPrismatic = this.wildCombatant.pokemon.prismaticTier !== 'Standard';
      const isUnreg = !this.pokedexCaught.has(this.wildCombatant.pokemon.dexNumber);
      const lowHp = this.wildCombatant.currentHp < this.wildCombatant.maxHp * 0.45;

      const shouldThrow =
        (isPrismatic) ||
        (this.autoCatchSettings.catchUnregistered && isUnreg) ||
        (!this.autoCatchSettings.targetPrismaticOnly && lowHp);

      if (shouldThrow && Math.random() < 0.22) {
        this.attemptCatch(this.wildCombatant);
      }
    }

    // 6. WILD FAINT RESOLUTION
    if (this.wildCombatant.currentHp <= 0) {
      this.waveNumber++;
      const goldAward = Math.floor(140 * (1 + this.buddyData.passiveTree.goldHoarderTier * 0.4) * (1 + this.currentRegionIndex * 0.6));
      this.pokeDollars += goldAward;

      if (Math.random() < 0.4 + this.buddyData.passiveTree.autoDowsingTier * 0.15) {
        const shardsAward = 8 + Math.floor(Math.random() * 10);
        this.prismaticShards += shardsAward;
      }

      this.spawnWildEncounter();
    }

    this.notify();
  }

  // TALLGRASS MOVE EXECUTION (Gentle Tap, Finishing Risk, Type Multiplier)
  public executeTallgrassMove(attacker: Active1v1Combatant, target: Active1v1Combatant, move: Move) {
    const lvl = attacker.pokemon.level;
    const atk = attacker.pokemon.stats.atk;
    const def = target.pokemon.stats.def;

    // Type effectiveness multiplier (0x, 0.5x, 1x, 2x, 4x)
    const typeMult = calculateTypeMultiplier(move.type, target.pokemon.types);
    const rawDmg = Math.floor(((((2 * lvl / 5 + 2) * move.power * (atk / Math.max(1, def))) / 50) + 2) * typeMult);
    const variance = 0.85 + Math.random() * 0.3;
    let damage = Math.max(1, Math.floor(rawDmg * variance));

    // TALLGRASS GENTLE TAP MECHANIC:
    // Guarantees leaving target with at least 1 HP, NEVER knocking it out accidentally!
    if (move.isGentleTap && damage >= target.currentHp) {
      damage = Math.max(1, target.currentHp - 1);
    }

    target.currentHp = Math.max(0, target.currentHp - damage);

    // Dynamic animations: forward attack lunge and recoil shake
    attacker.lungeX = attacker.isPlayer ? 14 : -14;
    target.shakeX = attacker.isPlayer ? 8 : -8;

    const beamColor = move.type === 'Fire' ? '#f97316' : move.type === 'Water' ? '#38bdf8' : move.type === 'Electric' ? '#facc15' : move.type === 'Grass' ? '#4ade80' : '#c084fc';
    this.attackBeams.push({
      id: `beam_${Date.now()}`,
      fromX: attacker.x,
      fromY: attacker.y,
      toX: target.x,
      toY: target.y,
      color: beamColor,
      life: 1.0,
    });

    let effectivenessText = '';
    if (typeMult >= 2.0) effectivenessText = ' (Super effective!)';
    else if (typeMult <= 0.5 && typeMult > 0) effectivenessText = ' (Not very effective)';
    else if (typeMult === 0) effectivenessText = ' (No effect!)';

    this.floatingTexts.push({
      id: `dmg_${Date.now()}_${Math.random()}`,
      text: `-${damage}${typeMult >= 2.0 ? '!' : ''}`,
      color: typeMult >= 2.0 ? '#fbbf24' : attacker.isPlayer ? '#ef4444' : '#f97316',
      x: target.x,
      y: target.y - 8,
      opacity: 1.0,
    });

    if (move.isGentleTap) {
      this.addLog(`✨ ${attacker.pokemon.speciesName} used Gentle Tap! Target weakened safely to ${target.currentHp} HP.`, 'level');
    } else {
      this.addLog(`${attacker.pokemon.speciesName} used ${move.name}${effectivenessText}! Dealt ${damage} DMG.`, 'damage');
    }

    if (target.currentHp <= 0) {
      if (attacker.isPlayer) {
        this.gainExp(attacker.pokemon, target.pokemon.level * 50);
        this.addLog(`${attacker.pokemon.speciesName} fainted wild ${target.pokemon.speciesName}!`, 'faint');
      }
    }
    this.notify();
  }

  // TALLGRASS CAPTURE MECHANIC
  public throwCaptureOrb(ballId?: string) {
    if (!this.wildCombatant || this.wildCombatant.currentHp <= 0) return;
    const targetBallId = ballId || this.selectedThrowingBall || 'b1';
    const ballItem = this.inventory.find(i => i.id === targetBallId && i.count > 0);
    if (!ballItem) return;

    this.attemptCatch(this.wildCombatant, ballItem);
  }

  // Calculate catch odds (HP percentage + Capture Orb multiplier)
  public calculateCatchOdds(enemy: Active1v1Combatant, ballMultiplier: number = 1.0): number {
    if (ballMultiplier >= 255.0) return 100;
    const hpFactor = 1 - (enemy.currentHp / enemy.maxHp);
    const baseRate = 0.35 + (hpFactor * 0.55); // 35% base up to 90% when target is at 1 HP
    const finalRate = Math.min(0.98, baseRate * (ballMultiplier / 1.0));
    return Math.floor(finalRate * 100);
  }

  private attemptCatch(enemy: Active1v1Combatant, specificBall?: InventoryItem) {
    const ballItem = specificBall || this.inventory.find(i => i.id === (
      this.autoCatchSettings.preferredBall === 'ultra' ? 'b3' :
      this.autoCatchSettings.preferredBall === 'prismatic' ? 'b4' :
      this.autoCatchSettings.preferredBall === 'great' ? 'b2' : 'b1'
    )) || this.inventory.find(i => i.category === 'balls' && i.count > 0);

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
        `🎉 Successfully captured ${enemy.pokemon.prismaticTier !== 'Standard' ? enemy.pokemon.prismaticTier + ' ' : ''}${enemy.pokemon.speciesName} (Lv. ${enemy.pokemon.level}) with ${ballItem.name}!`,
        'catch'
      );

      this.floatingTexts.push({
        id: `c_${Date.now()}`,
        text: 'CAUGHT! ⭐',
        color: '#eab308',
        x: enemy.x,
        y: enemy.y - 12,
        opacity: 1.0,
      });

      this.spawnWildEncounter();
    } else {
      this.floatingTexts.push({
        id: `f_${Date.now()}`,
        text: 'Broke free!',
        color: '#94a3b8',
        x: enemy.x,
        y: enemy.y - 12,
        opacity: 1.0,
      });
    }
    this.notify();
  }

  // Playable Overworld Raid Attack
  public strikeRaidBoss() {
    if (!this.activeRaid.active) return;
    const playerAtk = this.squad.reduce((sum, p) => sum + p.stats.atk, 0);
    const dmg = Math.floor(playerAtk * (2.0 + Math.random() * 0.8));

    this.activeRaid.currentHp = Math.max(0, this.activeRaid.currentHp - dmg);
    this.activeRaid.totalDamageDealt += dmg;

    const goldEarned = Math.floor(dmg * 0.15);
    const shardsEarned = Math.floor(dmg * 0.005);
    this.pokeDollars += goldEarned;
    this.prismaticShards += shardsEarned;

    this.addLog(`⚔️ Struck Raid Boss for ${dmg.toLocaleString()} DMG! Earned ₽${goldEarned} and ${shardsEarned} 💎`, 'damage');

    if (this.activeRaid.currentHp <= 0) {
      this.addLog(`🏆 RAID VICTORY: Defeated ${this.activeRaid.name}! Awarded +5,000 Shards & Legendary Dex entry!`, 'prismatic');
      this.prismaticShards += 5000;
      this.pokeDollars += 50000;
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

      if (this.playerCombatant && this.playerCombatant.pokemon.id === pokemon.id) {
        this.playerCombatant.maxHp = pokemon.stats.maxHp;
        this.playerCombatant.currentHp = pokemon.stats.maxHp;
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
    this.spawnWildEncounter();
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

    if (this.activeBattlerSlot === squadIndex) {
      this.switchActiveBattler(squadIndex);
    }
    this.notify();
  }

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
