# Pokémon: Spectra Chronicles — System Architecture & Handover Guide

## 1. Overview
**Pokémon: Spectra Chronicles** is an original continuous 3D WebGL auto-battler RPG inspired by titles like *Tallgrass*. It renders non-stop real-time battles in a 3D WebGL viewport (Three.js) overlaid with a responsive, modern app-style bottom dock and interactive drawers.

---

## 2. File & Directory Layout
```
pokemon spectra chronicles/
├── src/
│   ├── types/
│   │   └── game.ts                 # Core interfaces (PokemonData, IVs/EVs, Shaders, Combatants, Raids)
│   ├── data/
│   │   └── pokemonCatalog.ts       # Gen 1-9 Species catalog, stat calculation formulas, 9-region metadata
│   ├── engine/
│   │   ├── ProceduralPokemonMesh.ts # Procedural 3D Pokémon archetypes & particle aura generator
│   │   ├── WorldSceneManager.ts    # Three.js 3D viewport, camera sway, dynamic lighting & floating combat text
│   │   └── shaders/
│   │       └── prismaticShaders.ts # GLSL shaders for Standard, Shiny, Radiant, Ethereal, and Supernova tiers
│   ├── state/
│   │   └── GameStateManager.ts     # Global singleton: continuous 100ms combat loop, auto-catch, level-caps
│   ├── components/
│   │   ├── CanvasViewport.tsx      # WebGL container + 2D floating damage text projection overlay
│   │   ├── navigation/
│   │   │   └── BottomDock.tsx      # Persistent bottom dock navbar with collapsible state
│   │   └── drawers/
│   │       ├── BattleTab.tsx       # Live combat stream, rules engine & "Summon Supernova" button
│   │       ├── SquadBuddyTab.tsx   # 5-slot lineup, IV/EV matrix, move priority config & buddy passives
│   │       ├── WorldTab.tsx        # 9-Region continuum (Lv. 1-900) & Gym Leader badge unlocks
│   │       ├── ShopTab.tsx         # PokéMart & Prismatic Shard Bazaar
│   │       └── SocialHubTab.tsx    # GTS auction house, Wonder Trade Rift, 4-player Raid, Leaderboards
│   ├── App.tsx                     # Main application layout coordinating 3D scene & UI drawers
│   └── main.tsx                    # React 19 entrypoint
```

---

## 3. Key Systems & Mechanics Implemented

### 1. Continuous Auto-Combat Engine (`GameStateManager.ts`)
- Runs continuously at 10 ticks per second (100ms intervals).
- Real-time move cooldowns and priority tiers (Tier 1 High, Tier 2 Mid, Tier 3 Low).
- Continuous Stat Scaling Formula:
  $$\text{Scaled Stat} = \left\lfloor\left(\frac{2 \times \text{Base} + \text{IV} + \lfloor\frac{\text{EV}}{4}\rfloor}{100} \times \text{Level}\right)\right\rfloor + 10$$
- Region Level Cap Lock: XP locks at local undefeated Gym Leader level thresholds until beaten.

### 2. Prismatic Color Shaders (`prismaticShaders.ts`)
- **Radiant (1/16,384):** Inverted/neon color-shift palette with pulsating wave & celestial aura particles.
- **Ethereal (1/32,768):** Translucent procedural galaxy/crystal starfield shader.
- **Supernova (1/65,536):** Obsidian & gold flame corona shader with vertex displacement and flame noise.
- **Test Trigger:** A dedicated **"Summon Supernova (Demo)"** button is present in the `⚔️ Battle` tab to instantly summon a wild Supernova entity onto the battlefield!

### 3. Buddy & Auto-Catch Rules Engine
- Walking buddy stands alongside the trainer behind the squad in the 3D scene.
- Upgradeable passive branches: *Prismatic Resonance*, *Auto-Dowsing*, and *Gold Hoarder*.
- Conditional auto-catch criteria: ball inventory management, Prismatic-only targeting, and uncollected dex catching.

### 4. Social & Multiplayer Systems
- **GTS:** Searchable network listings filterable by price and Prismatic Tier.
- **Wonder Trade Rift:** Interactive mystery trade portal transmitting specimens across dimensional rifts.
- **Co-Op Raids:** Real-time 4-player cooperative raid against scaling Cosmic bosses.

---

## 4. How to Run Locally
Run the development server:
```bash
npm run dev
```
Open the printed local URL (typically `http://localhost:5173/`).
