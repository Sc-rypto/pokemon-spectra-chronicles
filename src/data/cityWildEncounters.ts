export interface CityWildEncounter {
  dex: number;
  name: string;
  weight: number; // spawn weight
  minLvl: number;
  maxLvl: number;
}

// Map each Gym / City ID (1 to 72) to realistic wild species that actually belong to that city's ecosystem
export const CITY_ENCOUNTERS_DATA: Record<number, CityWildEncounter[]> = {
  // --- KANTO (Region 1) ---
  // 1: Pewter City (Route 2 / Viridian Forest / Diglett's Cave approach, Lv 3-10)
  1: [
    { dex: 16, name: 'Pidgey', weight: 30, minLvl: 3, maxLvl: 7 },
    { dex: 19, name: 'Rattata', weight: 30, minLvl: 3, maxLvl: 6 },
    { dex: 10, name: 'Caterpie', weight: 20, minLvl: 3, maxLvl: 5 },
    { dex: 13, name: 'Weedle', weight: 20, minLvl: 3, maxLvl: 5 },
    { dex: 74, name: 'Geodude', weight: 10, minLvl: 6, maxLvl: 9 },
  ],
  // 2: Cerulean City (Route 4 / Route 24 / Cerulean Cape, Lv 10-16)
  2: [
    { dex: 43, name: 'Oddish', weight: 25, minLvl: 11, maxLvl: 15 },
    { dex: 69, name: 'Bellsprout', weight: 25, minLvl: 11, maxLvl: 15 },
    { dex: 63, name: 'Abra', weight: 10, minLvl: 10, maxLvl: 13 },
    { dex: 54, name: 'Psyduck', weight: 20, minLvl: 12, maxLvl: 16 },
    { dex: 120, name: 'Staryu', weight: 15, minLvl: 12, maxLvl: 16 },
    { dex: 129, name: 'Magikarp', weight: 20, minLvl: 8, maxLvl: 14 },
  ],
  // 3: Vermilion City (Route 6 / 11 / Diglett's Cave, Lv 15-22)
  3: [
    { dex: 50, name: 'Diglett', weight: 30, minLvl: 15, maxLvl: 20 },
    { dex: 96, name: 'Drowzee', weight: 25, minLvl: 14, maxLvl: 19 },
    { dex: 21, name: 'Spearow', weight: 20, minLvl: 14, maxLvl: 18 },
    { dex: 100, name: 'Voltorb', weight: 15, minLvl: 16, maxLvl: 21 },
    { dex: 98, name: 'Krabby', weight: 20, minLvl: 15, maxLvl: 20 },
  ],
  // 4: Celadon City (Route 7 / 8 / Route 16, Lv 20-28)
  4: [
    { dex: 37, name: 'Vulpix', weight: 20, minLvl: 20, maxLvl: 25 },
    { dex: 58, name: 'Growlithe', weight: 20, minLvl: 20, maxLvl: 25 },
    { dex: 52, name: 'Meowth', weight: 25, minLvl: 20, maxLvl: 26 },
    { dex: 56, name: 'Mankey', weight: 20, minLvl: 21, maxLvl: 26 },
    { dex: 114, name: 'Tangela', weight: 15, minLvl: 22, maxLvl: 28 },
  ],
  // 5: Fuchsia City (Safari Zone periphery / Route 15, Lv 26-34)
  5: [
    { dex: 48, name: 'Venonat', weight: 25, minLvl: 26, maxLvl: 32 },
    { dex: 109, name: 'Koffing', weight: 20, minLvl: 27, maxLvl: 32 },
    { dex: 88, name: 'Grimer', weight: 20, minLvl: 27, maxLvl: 33 },
    { dex: 102, name: 'Exeggcute', weight: 15, minLvl: 28, maxLvl: 33 },
    { dex: 111, name: 'Rhyhorn', weight: 15, minLvl: 29, maxLvl: 34 },
  ],
  // 6: Saffron City (Silph Co. / Route 5, Lv 32-40)
  6: [
    { dex: 64, name: 'Kadabra', weight: 20, minLvl: 32, maxLvl: 38 },
    { dex: 66, name: 'Machop', weight: 25, minLvl: 32, maxLvl: 37 },
    { dex: 81, name: 'Magnemite', weight: 25, minLvl: 33, maxLvl: 39 },
    { dex: 106, name: 'Hitmonlee', weight: 10, minLvl: 35, maxLvl: 40 },
    { dex: 107, name: 'Hitmonchan', weight: 10, minLvl: 35, maxLvl: 40 },
  ],
  // 7: Cinnabar Island (Pokémon Mansion / Sea Route 20, Lv 38-46)
  7: [
    { dex: 77, name: 'Ponyta', weight: 25, minLvl: 38, maxLvl: 44 },
    { dex: 126, name: 'Magmar', weight: 15, minLvl: 40, maxLvl: 45 },
    { dex: 109, name: 'Koffing', weight: 25, minLvl: 38, maxLvl: 43 },
    { dex: 72, name: 'Tentacool', weight: 25, minLvl: 38, maxLvl: 45 },
    { dex: 86, name: 'Seel', weight: 20, minLvl: 39, maxLvl: 45 },
  ],
  // 8: Viridian City (Giovanni's final challenge & Route 22, Lv 44-52)
  8: [
    { dex: 111, name: 'Rhyhorn', weight: 25, minLvl: 44, maxLvl: 50 },
    { dex: 34, name: 'Nidoking', weight: 15, minLvl: 45, maxLvl: 52 },
    { dex: 31, name: 'Nidoqueen', weight: 15, minLvl: 45, maxLvl: 52 },
    { dex: 51, name: 'Dugtrio', weight: 20, minLvl: 45, maxLvl: 51 },
    { dex: 75, name: 'Graveler', weight: 25, minLvl: 45, maxLvl: 50 },
  ],

  // --- JOHTO (Region 2) ---
  // 9: Violet City (Sprout Tower & Route 31, Lv 50-58)
  9: [
    { dex: 161, name: 'Sentret', weight: 30, minLvl: 50, maxLvl: 55 },
    { dex: 163, name: 'Hoothoot', weight: 30, minLvl: 50, maxLvl: 55 },
    { dex: 165, name: 'Ledyba', weight: 20, minLvl: 51, maxLvl: 56 },
    { dex: 167, name: 'Spinarak', weight: 20, minLvl: 51, maxLvl: 56 },
    { dex: 179, name: 'Mareep', weight: 20, minLvl: 52, maxLvl: 57 },
  ],
  // 10: Azalea Town (Ilex Forest & Slowpoke Well, Lv 56-64)
  10: [
    { dex: 79, name: 'Slowpoke', weight: 30, minLvl: 56, maxLvl: 62 },
    { dex: 194, name: 'Wooper', weight: 25, minLvl: 57, maxLvl: 63 },
    { dex: 204, name: 'Pineco', weight: 20, minLvl: 58, maxLvl: 63 },
    { dex: 123, name: 'Scyther', weight: 15, minLvl: 59, maxLvl: 64 },
    { dex: 214, name: 'Heracross', weight: 15, minLvl: 59, maxLvl: 64 },
  ],
  // 11: Goldenrod City (National Park & Route 35, Lv 62-72)
  11: [
    { dex: 193, name: 'Yanma', weight: 25, minLvl: 63, maxLvl: 69 },
    { dex: 209, name: 'Snubbull', weight: 25, minLvl: 63, maxLvl: 70 },
    { dex: 183, name: 'Marill', weight: 25, minLvl: 64, maxLvl: 70 },
    { dex: 241, name: 'Miltank', weight: 15, minLvl: 66, maxLvl: 72 },
    { dex: 128, name: 'Tauros', weight: 15, minLvl: 66, maxLvl: 72 },
  ],
  // 12: Ecruteak City (Burned Tower & Bell Tower, Lv 70-80)
  12: [
    { dex: 92, name: 'Gastly', weight: 30, minLvl: 70, maxLvl: 77 },
    { dex: 93, name: 'Haunter', weight: 20, minLvl: 73, maxLvl: 79 },
    { dex: 109, name: 'Koffing', weight: 25, minLvl: 71, maxLvl: 78 },
    { dex: 218, name: 'Slugma', weight: 20, minLvl: 72, maxLvl: 78 },
    { dex: 200, name: 'Misdreavus', weight: 15, minLvl: 74, maxLvl: 80 },
  ],
  // 13: Cianwood City (Whirl Islands approach / coastal Route 41, Lv 78-88)
  13: [
    { dex: 223, name: 'Remoraid', weight: 25, minLvl: 78, maxLvl: 85 },
    { dex: 211, name: 'Qwilfish', weight: 25, minLvl: 79, maxLvl: 86 },
    { dex: 226, name: 'Mantine', weight: 20, minLvl: 80, maxLvl: 87 },
    { dex: 90, name: 'Shellder', weight: 20, minLvl: 79, maxLvl: 86 },
    { dex: 62, name: 'Poliwrath', weight: 15, minLvl: 82, maxLvl: 88 },
  ],
  // 14: Olivine City (Route 39 pastures & Harbor, Lv 86-96)
  14: [
    { dex: 81, name: 'Magnemite', weight: 30, minLvl: 86, maxLvl: 92 },
    { dex: 82, name: 'Magneton', weight: 20, minLvl: 89, maxLvl: 95 },
    { dex: 179, name: 'Mareep', weight: 25, minLvl: 86, maxLvl: 93 },
    { dex: 180, name: 'Flaaffy', weight: 20, minLvl: 88, maxLvl: 94 },
    { dex: 208, name: 'Steelix', weight: 15, minLvl: 90, maxLvl: 96 },
  ],
  // 15: Mahogany Town (Lake of Rage & Ice Path, Lv 94-106)
  15: [
    { dex: 220, name: 'Swinub', weight: 30, minLvl: 94, maxLvl: 102 },
    { dex: 225, name: 'Delibird', weight: 20, minLvl: 95, maxLvl: 103 },
    { dex: 215, name: 'Sneasel', weight: 20, minLvl: 96, maxLvl: 104 },
    { dex: 130, name: 'Gyarados', weight: 20, minLvl: 98, maxLvl: 106 },
    { dex: 221, name: 'Piloswine', weight: 15, minLvl: 98, maxLvl: 106 },
  ],
  // 16: Blackthorn City (Dragon's Den & Route 45, Lv 104-118)
  16: [
    { dex: 147, name: 'Dratini', weight: 25, minLvl: 105, maxLvl: 114 },
    { dex: 148, name: 'Dragonair', weight: 20, minLvl: 110, maxLvl: 118 },
    { dex: 207, name: 'Gligar', weight: 25, minLvl: 105, maxLvl: 115 },
    { dex: 227, name: 'Skarmory', weight: 20, minLvl: 108, maxLvl: 116 },
    { dex: 231, name: 'Phanpy', weight: 25, minLvl: 104, maxLvl: 112 },
  ],
};

// Generates fallback themed encounters for any region/city ID (1 to 72)
export function getCityEncounters(gymId: number, regionDexMin: number, regionDexMax: number, targetLevel: number): CityWildEncounter[] {
  if (CITY_ENCOUNTERS_DATA[gymId]) {
    return CITY_ENCOUNTERS_DATA[gymId];
  }

  // Procedural realistic generation for higher gens (Hoenn through Paldea)
  const minLvl = Math.max(3, targetLevel - 5);
  const maxLvl = targetLevel + 2;
  const range = regionDexMax - regionDexMin;

  const result: CityWildEncounter[] = [];
  for (let i = 0; i < 5; i++) {
    const dex = regionDexMin + Math.floor(((gymId * 17 + i * 19) % range));
    result.push({
      dex,
      name: `Species #${dex}`,
      weight: 20,
      minLvl,
      maxLvl,
    });
  }
  return result;
}
