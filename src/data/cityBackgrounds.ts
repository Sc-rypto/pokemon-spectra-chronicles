// High-resolution thematic backgrounds for all Pokémon Regions and Cities
export const CITY_BACKGROUNDS: Record<number, string> = {
  // --- KANTO (Region 1) ---
  1: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop', // Pewter: Granite stone quarry / rocky terrain
  2: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', // Cerulean: Sparkling coastal cape
  3: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=1600&auto=format&fit=crop', // Vermilion: Sunny harbor & docks
  4: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop', // Celadon: Lush green gardens & cityscape
  5: 'https://images.unsplash.com/photo-1511497584788-87676104235f?q=80&w=1600&auto=format&fit=crop', // Fuchsia: Deep bamboo safari grove
  6: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop', // Saffron: Sleek metropolis skyline
  7: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop', // Cinnabar: Volcanic island caldera
  8: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop', // Viridian: Mountain pass & Champion plateau

  // --- JOHTO (Region 2) ---
  9: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop', // Violet: Ancient pagodas & gentle woods
  10: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop', // Azalea: Dense Ilex forest
  11: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&w=1600&auto=format&fit=crop', // Goldenrod: Bustling city center
  12: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop', // Ecruteak: Autumn shrine & sacred bell tower
  13: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop', // Cianwood: Rugged windy seashore
  14: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop', // Olivine: Sparkling harbor & lighthouse
  15: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1600&auto=format&fit=crop', // Mahogany: Frozen pines & lake of rage
  16: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop', // Blackthorn: Mist-shrouded dragon mountain

  // --- HOENN (Region 3) ---
  17: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=1600&auto=format&fit=crop', // Rustboro
  18: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', // Dewford
  19: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop', // Mauville
  20: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop', // Lavaridge
  21: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop', // Petalburg
  22: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop', // Fortree
  23: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop', // Mossdeep
  24: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop', // Sootopolis

  // --- SINNOH (Region 4) ---
  25: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
  31: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1600&auto=format&fit=crop',
  32: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?q=80&w=1600&auto=format&fit=crop',

  // --- GENERAL REGION FALLBACKS ---
};

export function getCityBackgroundUrl(gymId: number, regionId: number): string {
  if (CITY_BACKGROUNDS[gymId]) {
    return CITY_BACKGROUNDS[gymId];
  }
  // Region-based high-quality backdrop
  switch (regionId) {
    case 1: return 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1600&auto=format&fit=crop';
    case 2: return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop';
    case 3: return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop';
    case 4: return 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?q=80&w=1600&auto=format&fit=crop';
    case 5: return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1600&auto=format&fit=crop';
    case 6: return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop';
    case 7: return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop';
    case 8: return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1600&auto=format&fit=crop';
    default: return 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop';
  }
}
