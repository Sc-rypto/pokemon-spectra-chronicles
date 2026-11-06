// Legendary Dex IDs gated per region until all 8 region gyms are defeated
export const REGION_LEGENDARIES: Record<number, number[]> = {
  1: [144, 145, 146, 150, 151], // Articuno, Zapdos, Moltres, Mewtwo, Mew
  2: [243, 244, 245, 249, 250, 251], // Raikou, Entei, Suicune, Lugia, Ho-Oh, Celebi
  3: [377, 378, 379, 380, 381, 382, 383, 384, 385, 386], // Regi trio, Latias/os, Kyogre, Groudon, Rayquaza, Jirachi, Deoxys
  4: [480, 481, 482, 483, 484, 485, 486, 487, 488, 490, 491, 492, 493], // Dialga, Palkia, Giratina, Arceus, etc.
  5: [638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649], // Swords of Justice, Kami trio, Reshiram, Zekrom, Kyurem
  6: [716, 717, 718, 719, 720, 721], // Xerneas, Yveltal, Zygarde, Diancie, Hoopa, Volcanion
  7: [785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802], // Tapus, Cosmog, Solgaleo, Lunala, Necrozma
  8: [888, 889, 890, 891, 892, 894, 895, 898], // Zacian, Zamazenta, Eternatus, Urshifu, Calyrex
  9: [1001, 1002, 1003, 1004, 1007, 1008, 1017, 1024, 1025], // Ruinous quartet, Koraidon, Miraidon, Ogerpon, Terapagos, Pecharunt
};

// Returns realistic catch rate and rarity tier based on Dex & legendary status
export function getSpeciesRarityAndCatchRate(dex: number): { catchRate: number; rarityTier: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' } {
  // Check if Dex is in any legendary list
  const isLegendary = Object.values(REGION_LEGENDARIES).some(arr => arr.includes(dex));
  if (isLegendary) {
    return { catchRate: 3, rarityTier: 'Legendary' };
  }

  // Common basic species (e.g. early routes, Caterpie, Pidgey, Rattata, starters, common bugs)
  const isCommonEarly = (dex <= 20) || (dex >= 161 && dex <= 170) || (dex >= 261 && dex <= 270) || (dex >= 396 && dex <= 405) || (dex >= 504 && dex <= 510) || (dex >= 821 && dex <= 830) || (dex >= 915 && dex <= 925);
  if (isCommonEarly) {
    return { catchRate: 255, rarityTier: 'Common' };
  }

  // Semi-rare / 3-stage final evolutions (Pseudo-legendaries, Dragonite, Tyranitar, Salamence, Metagross, Garchomp)
  const isPseudo = [149, 248, 373, 376, 445, 635, 706, 887, 998].includes(dex);
  if (isPseudo) {
    return { catchRate: 45, rarityTier: 'Rare' };
  }

  // Intermediate species
  if (dex % 3 === 0) {
    return { catchRate: 120, rarityTier: 'Uncommon' };
  }

  return { catchRate: 190, rarityTier: 'Common' };
}
