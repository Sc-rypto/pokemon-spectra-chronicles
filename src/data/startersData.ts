import { ElementalType } from '../types/game';

export interface StarterOption {
  dex: number;
  name: string;
  gen: number;
  type: ElementalType;
  region: string;
}

// All 27 Official Starter Pokémon across Generations 1 through 9
export const ALL_27_STARTERS: StarterOption[] = [
  // Gen 1: Kanto
  { dex: 1, name: 'Bulbasaur', gen: 1, type: 'Grass', region: 'Kanto' },
  { dex: 4, name: 'Charmander', gen: 1, type: 'Fire', region: 'Kanto' },
  { dex: 7, name: 'Squirtle', gen: 1, type: 'Water', region: 'Kanto' },

  // Gen 2: Johto
  { dex: 152, name: 'Chikorita', gen: 2, type: 'Grass', region: 'Johto' },
  { dex: 155, name: 'Cyndaquil', gen: 2, type: 'Fire', region: 'Johto' },
  { dex: 158, name: 'Totodile', gen: 2, type: 'Water', region: 'Johto' },

  // Gen 3: Hoenn
  { dex: 252, name: 'Treecko', gen: 3, type: 'Grass', region: 'Hoenn' },
  { dex: 255, name: 'Torchic', gen: 3, type: 'Fire', region: 'Hoenn' },
  { dex: 258, name: 'Mudkip', gen: 3, type: 'Water', region: 'Hoenn' },

  // Gen 4: Sinnoh
  { dex: 387, name: 'Turtwig', gen: 4, type: 'Grass', region: 'Sinnoh' },
  { dex: 390, name: 'Chimchar', gen: 4, type: 'Fire', region: 'Sinnoh' },
  { dex: 393, name: 'Piplup', gen: 4, type: 'Water', region: 'Sinnoh' },

  // Gen 5: Unova
  { dex: 495, name: 'Snivy', gen: 5, type: 'Grass', region: 'Unova' },
  { dex: 498, name: 'Tepig', gen: 5, type: 'Fire', region: 'Unova' },
  { dex: 501, name: 'Oshawott', gen: 5, type: 'Water', region: 'Unova' },

  // Gen 6: Kalos
  { dex: 650, name: 'Chespin', gen: 6, type: 'Grass', region: 'Kalos' },
  { dex: 653, name: 'Fennekin', gen: 6, type: 'Fire', region: 'Kalos' },
  { dex: 656, name: 'Froakie', gen: 6, type: 'Water', region: 'Kalos' },

  // Gen 7: Alola
  { dex: 722, name: 'Rowlet', gen: 7, type: 'Grass', region: 'Alola' },
  { dex: 725, name: 'Litten', gen: 7, type: 'Fire', region: 'Alola' },
  { dex: 728, name: 'Popplio', gen: 7, type: 'Water', region: 'Alola' },

  // Gen 8: Galar
  { dex: 810, name: 'Grookey', gen: 8, type: 'Grass', region: 'Galar' },
  { dex: 813, name: 'Scorbunny', gen: 8, type: 'Fire', region: 'Galar' },
  { dex: 816, name: 'Sobble', gen: 8, type: 'Water', region: 'Galar' },

  // Gen 9: Paldea
  { dex: 906, name: 'Sprigatito', gen: 9, type: 'Grass', region: 'Paldea' },
  { dex: 909, name: 'Fuecoco', gen: 9, type: 'Fire', region: 'Paldea' },
  { dex: 912, name: 'Quaxly', gen: 9, type: 'Water', region: 'Paldea' },
];
