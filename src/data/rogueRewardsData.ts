import { RogueRewardOption } from '../types/game';
import { ASSET_ICONS } from './pokemonCatalog';

export function generateRogueRewardBatch(currentWave: number): RogueRewardOption[] {
  const allPool: Array<Omit<RogueRewardOption, 'id' | 'applyReward'> & { onSelect: (state: any) => void }> = [
    {
      name: '5x Great Orbs',
      category: 'orbs',
      description: 'Sturdy high-performance capture spheres with a 1.5x catch multiplier.',
      icon: ASSET_ICONS.greatBall,
      rarity: 'Common',
      onSelect: (state) => {
        const item = state.inventory.find((i: any) => i.id === 'b2');
        if (item) item.count += 5;
        state.addLog('Received 5x Great Orbs from battle reward!', 'catch');
      },
    },
    {
      name: '3x Ultra Orbs',
      category: 'orbs',
      description: 'High-grade spheres with a 2.0x catch multiplier for rare wild Pokémon.',
      icon: ASSET_ICONS.ultraBall,
      rarity: 'Great',
      onSelect: (state) => {
        const item = state.inventory.find((i: any) => i.id === 'b3');
        if (item) item.count += 3;
        state.addLog('Received 3x Ultra Orbs from battle reward!', 'catch');
      },
    },
    {
      name: '1x Master Prism Orb',
      category: 'orbs',
      description: 'Guarantees 100% capture rate on any Pokémon or Legendary variant.',
      icon: ASSET_ICONS.masterBall,
      rarity: 'Master',
      onSelect: (state) => {
        const item = state.inventory.find((i: any) => i.id === 'b5') || state.inventory.find((i: any) => i.id === 'b4');
        if (item) item.count += 1;
        state.addLog('Incredible! Received 1x Master Prism Orb!', 'prismatic');
      },
    },
    {
      name: '3x Super Potions',
      category: 'potions',
      description: 'Restores 100 HP to your active partner Pokémon.',
      icon: ASSET_ICONS.potion,
      rarity: 'Common',
      onSelect: (state) => {
        const item = state.inventory.find((i: any) => i.id === 'p1');
        if (item) item.count += 3;
        state.addLog('Received 3x Super Potions!', 'level');
      },
    },
    {
      name: '2x Max Potions',
      category: 'potions',
      description: 'Fully heals your active partner to full max health.',
      icon: ASSET_ICONS.maxPotion,
      rarity: 'Great',
      onSelect: (state) => {
        const item = state.inventory.find((i: any) => i.id === 'p2');
        if (item) item.count += 2;
        state.addLog('Received 2x Max Potions!', 'level');
      },
    },
    {
      name: 'Exp. Candy L',
      category: 'candy',
      description: 'Gives a massive surge of 10,000 EXP to your active battler.',
      icon: ASSET_ICONS.expCandyL,
      rarity: 'Great',
      onSelect: (state) => {
        if (state.playerCombatant) {
          state.gainExp(state.playerCombatant.pokemon, 10000);
        }
        state.addLog('Used Exp. Candy L! Squad surged with EXP!', 'level');
      },
    },
    {
      name: 'Rare Candy',
      category: 'candy',
      description: 'Instantly increases your active Pokémon’s level by 1.',
      icon: ASSET_ICONS.rareCandy,
      rarity: 'Ultra',
      onSelect: (state) => {
        if (state.playerCombatant) {
          state.gainExp(state.playerCombatant.pokemon, state.playerCombatant.pokemon.expToNextLevel || 1000);
        }
        state.addLog('Fed Rare Candy! Level raised by 1!', 'level');
      },
    },
    {
      name: '₽1,500 Poké-Dollars',
      category: 'money',
      description: 'Quick cash pouch to spend at the PokéMart or Tallgrass Orb store.',
      icon: ASSET_ICONS.currencyCoin,
      rarity: 'Common',
      onSelect: (state) => {
        state.pokeDollars += 1500;
        state.addLog('Claimed ₽1,500 Poké-Dollars bounty!', 'level');
      },
    },
    {
      name: '50x Prismatic Shards',
      category: 'shards',
      description: 'Exotic dimensional fragments used for rare upgrades and bazaar trades.',
      icon: ASSET_ICONS.prismaticShard,
      rarity: 'Ultra',
      onSelect: (state) => {
        state.prismaticShards += 50;
        state.addLog('Claimed 50x Prismatic Shards!', 'prismatic');
      },
    },
    {
      name: 'Protein (Permanent +5 ATK)',
      category: 'stat_booster',
      description: 'Nutritional drink that permanently buffs the Attack stat of your active partner.',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protein.png',
      rarity: 'Ultra',
      onSelect: (state) => {
        if (state.playerCombatant) {
          state.playerCombatant.pokemon.stats.atk += 5;
          state.addLog(`Protein boosted ${state.playerCombatant.pokemon.speciesName}'s ATK by +5!`, 'level');
        }
      },
    },
    {
      name: 'Carbos (Permanent +5 SPEED)',
      category: 'stat_booster',
      description: 'Nutritional drink that permanently buffs the Speed stat of your active partner.',
      icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/carbos.png',
      rarity: 'Ultra',
      onSelect: (state) => {
        if (state.playerCombatant) {
          state.playerCombatant.pokemon.stats.spe += 5;
          state.addLog(`Carbos boosted ${state.playerCombatant.pokemon.speciesName}'s SPD by +5!`, 'level');
        }
      },
    },
  ];

  // Shuffle and pick 3 unique items
  const shuffled = [...allPool].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  return picked.map((item, idx) => ({
    id: `reward_${Date.now()}_${idx}`,
    name: item.name,
    category: item.category,
    description: item.description,
    icon: item.icon,
    rarity: item.rarity,
    applyReward: item.onSelect,
  }));
}
