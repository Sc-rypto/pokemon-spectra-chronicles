# Pokémon: Spectra Chronicles — Full Architecture & Operational Reference

## 1. Project Overview & Inspiration
**Pokémon: Spectra Chronicles** is a web-based continuous auto-battler RPG inspired directly by **Tallgrass** (`playtallgrass.com`), **DelugeRPG**, and **PokéIdle**. It combines 1v1 battle spaces, procedural Prismatic shader variants, player-driven economy systems, and progression across all 9 regions (Kanto through Paldea, covering all 1,025 Pokémon).

---

## 2. Architecture & File Layout
```
src/
├── types/
│   └── game.ts                # TypeScript interfaces (PokemonData, 1v1 Combatants, Prismatic Tiers, Raids)
├── data/
│   ├── allPokemonMeta.json    # Complete index of all 1,025 Pokemon across Gen 1-9
│   └── pokemonCatalog.ts      # Region maps, Gym Leaders, stat formulas, sprite loaders & item assets
├── state/
│   └── GameStateManager.ts    # Global game loop: 1v1 combat, XP scaling (Lv. 1-900), economy & auto-catch
├── services/
│   └── PokeApiService.ts      # PokeAPI integration for stats, types, moves, weight & heights
├── components/
│   ├── MeadowBattlefield.tsx  # Tallgrass 1v1 Meadow battle space with custom Prismatic sprites
│   ├── navigation/
│   │   └── BottomDock.tsx     # Fixed, non-collapsing navbar with integrated squad selector strip
│   └── drawers/
│       ├── BattleTab.tsx      # Auto-hunt rules engine & "Summon Supernova (Demo)" trigger
│       ├── SquadBuddyTab.tsx  # Team inspection, continuous IV/EV scaling matrix & Buddy passives
│       ├── WorldTab.tsx       # 9-Region continuum (Lv. 1-900) & Gym badge cap unlocks
│       ├── ShopTab.tsx        # Real PokeMart & Prismatic Bazaar
│       └── SocialHubTab.tsx   # Playable Overworld Raid Boss & real player marketplace (no bots)
├── App.tsx                    # Root layout mounting Meadow & non-collapsing views
└── main.tsx                   # React 19 bootstrap
```

---

## 3. Core Systems & Technical Implementations

### 1. Tallgrass 1v1 Meadow Battle Space ([`MeadowBattlefield.tsx`](file:///c:/Users/hrish/Downloads/pokemon%20spectra%20chronicles/src/components/MeadowBattlefield.tsx))
- **1-by-1 Combat Format:** You deploy exactly 1 active Pokémon from your 5-member squad onto the battlefield at a time against 1 wild opponent, with zero clumping or overlapping.
- **Fixed Team Selector Strip:** The bottom dock features a live team bar where you can click any of your 5 Pokémon to immediately swap them into battle.
- **Clean Attack Animations:** Units perform physical lunges forward during strikes, followed by directional recoil hit shakes, laser beam trajectories, and floating damage numbers.
- **Click-to-Catch:** Tap the wild opponent directly on the meadow or use the header capture button.

### 2. Custom Prismatic Variant Sprites ([`pokemonCatalog.ts`](file:///c:/Users/hrish/Downloads/pokemon%20spectra%20chronicles/src/data/pokemonCatalog.ts))
- **Custom Shaders & CSS Filters:**
  - **Supernova (1/65,536):** Dark obsidian body with molten solar corona amber flares (`filter: brightness(0.85) contrast(1.7) saturate(2.4) hue-rotate(335deg) drop-shadow(0 0 10px #f59e0b) drop-shadow(0 0 18px #ea580c)`).
  - **Ethereal (1/32,768):** Translucent cosmic crystal starfield glow (`filter: brightness(1.25) contrast(1.3) saturate(1.8) hue-rotate(180deg) drop-shadow(0 0 8px #06b6d4) drop-shadow(0 0 16px #3b82f6)`).
  - **Radiant (1/16,384):** Inverted neon color-shift celestial halo (`filter: brightness(1.15) contrast(1.5) saturate(2.0) hue-rotate(95deg) drop-shadow(0 0 8px #10b981) drop-shadow(0 0 14px #ec4899)`).
  - **Shiny (1/4,096):** Authentic shiny colorway with golden sparkle brilliance.

### 3. Pure Asset Sprites & Zero Emojis
- All emojis have been eliminated and replaced with high-resolution official asset sprites:
  - Poké Ball, Great Ball, Ultra Ball, Master Ball, Super Potion, Prismatic Scales/Shards, Gym Badges, and Amulet Coins.

### 4. Playable Overworld Raid & Player Economy ([`SocialHubTab.tsx`](file:///c:/Users/hrish/Downloads/pokemon%20spectra%20chronicles/src/components/drawers/SocialHubTab.tsx))
- **Interactive 150,000 HP Mega-Mewtwo Raid:** Directly playable on screen. Striking the boss yields live Poké-Dollars and Prismatic Shards, with a +5,000 Shard jackpot upon defeat.
- **Player Marketplace (Zero Bots):** All simulated bot listings were purged. The market displays only verified listings created by players from their PC Box.

---

## 4. Deployment Instructions
The application is hosted on GitHub Pages:
- **Repository:** `https://github.com/Sc-rypto/pokemon-spectra-chronicles.git`
- **Main Branch:** Up to date with latest commit `6050066`.
- **Live URL:** `https://sc-rypto.github.io/pokemon-spectra-chronicles/`
