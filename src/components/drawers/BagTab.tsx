import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { InventoryItem, PokemonData } from '../../types/game';
import { ASSET_ICONS, getPrismaticSpriteStyle } from '../../data/pokemonCatalog';
import { Backpack, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface BagTabProps {
  state: GameStateManager;
}

type BagPocket = 'items' | 'medicine' | 'balls' | 'berries';

export const BagTab: React.FC<BagTabProps> = ({ state }) => {
  const [activePocket, setActivePocket] = useState<BagPocket>('items');
  const [selectedItemId, setSelectedItemId] = useState<string>('stone_thunder');
  const [actionNotice, setActionNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [targetPokemonId, setTargetPokemonId] = useState<string | null>(null);

  // Group inventory items by pockets
  const pocketItems = state.inventory.filter(item => {
    if (activePocket === 'items') {
      return item.pocket === 'items' || item.category === 'materials' && !item.id.startsWith('m1') && !item.id.startsWith('m2');
    }
    if (activePocket === 'medicine') {
      return item.pocket === 'medicine' || item.category === 'potions';
    }
    if (activePocket === 'balls') {
      return item.pocket === 'balls' || item.category === 'orbs' || item.category === 'balls';
    }
    if (activePocket === 'berries') {
      return item.pocket === 'berries' || item.id.startsWith('m1') || item.id.startsWith('m2');
    }
    return true;
  });

  const selectedItem = state.inventory.find(i => i.id === selectedItemId) || pocketItems[0] || state.inventory[0];

  const handleUseItem = (pokemonId: string) => {
    if (!selectedItem) return;
    const res = state.useItemOnPokemon(selectedItem.id, pokemonId);
    showNotice(res.message, !res.success);
  };

  const showNotice = (msg: string, isError = false) => {
    setActionNotice({ text: msg, isError });
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Determine ABLE / UNABLE for Pokémon with selected item
  const checkPokemonUsability = (pkmn: PokemonData, item: InventoryItem | undefined): { able: boolean; statusLabel?: string } => {
    if (!item || !item.usableOnPokemon || item.count <= 0) return { able: false };
    if (pkmn.isFainted) {
      if (item.effectType === 'revive') return { able: true, statusLabel: 'FNT' };
      return { able: false, statusLabel: 'FNT' };
    }
    if (item.effectType === 'heal_hp' || item.effectType === 'full_heal') {
      return { able: pkmn.stats.hp < pkmn.stats.maxHp };
    }
    if (item.effectType === 'rare_candy') {
      return { able: pkmn.level < state.getHardLevelCap() };
    }
    if (item.effectType === 'exp_candy') {
      return { able: pkmn.level < state.getHardLevelCap() };
    }
    if (item.effectType === 'evolution') {
      return { able: true };
    }
    return { able: false };
  };

  return (
    <div className="space-y-3 font-pokemon-ds">
      {/* 1. RETRO DS TOP POCKET BAR (Matches attached screenshot: Medicine, Items, Balls, Berries) */}
      <div className="bg-slate-900/95 p-3 rounded-2xl border-2 border-slate-700/80 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Backpack className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-widest">TRAINER BAG</h2>
            <div className="text-[10px] text-slate-400 font-mono">Select item & use on party Pokémon</div>
          </div>
        </div>

        {/* Pocket selection icons matching Gen 4 DS */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActivePocket('items')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activePocket === 'items'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Items & Evolution Stones Pocket"
          >
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png" alt="Items" className="w-4 h-4 object-contain" />
            <span className="hidden sm:inline">Items</span>
          </button>

          <button
            onClick={() => setActivePocket('medicine')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activePocket === 'medicine'
                ? 'bg-indigo-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Medicine Pocket"
          >
            <img src={ASSET_ICONS.potion} alt="Medicine" className="w-4 h-4 object-contain" />
            <span className="hidden sm:inline">Medicine</span>
          </button>

          <button
            onClick={() => setActivePocket('balls')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activePocket === 'balls'
                ? 'bg-rose-500 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Poké Balls Pocket"
          >
            <img src={ASSET_ICONS.pokeBall} alt="Balls" className="w-4 h-4 object-contain" />
            <span className="hidden sm:inline">Balls</span>
          </button>

          <button
            onClick={() => setActivePocket('berries')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activePocket === 'berries'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Berries & Candies Pocket"
          >
            <img src={ASSET_ICONS.rareCandy} alt="Candies" className="w-4 h-4 object-contain" />
            <span className="hidden sm:inline">Candies</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          actionNotice.isError ? 'bg-rose-950/90 text-rose-300 border-rose-500/50' : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
        }`}>
          {actionNotice.isError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* 2. MAIN SPLIT DS VIEW: PARTY POKÉMON (LEFT) + ITEM LIST (RIGHT) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pokemon-ds-dot-bg p-3.5 rounded-3xl border-4 border-amber-600/60 shadow-2xl">
        {/* LEFT COLUMN: 6 PARTY SLOTS WITH HP BARS & ABLE/UNABLE PILLS (Directly like DS screen) */}
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] uppercase font-black text-slate-950 tracking-wider px-1">
            PARTY POKÉMON
          </div>

          <div className="space-y-1.5">
            {state.squad.map((pkmn, idx) => {
              const hpPercent = Math.max(0, (pkmn.stats.hp / pkmn.stats.maxHp) * 100);
              const isFainted = pkmn.isFainted || pkmn.stats.hp <= 0;
              const usability = checkPokemonUsability(pkmn, selectedItem);
              const isSelectedTarget = targetPokemonId === pkmn.id;

              return (
                <div
                  key={pkmn.id}
                  onClick={() => {
                    setTargetPokemonId(pkmn.id);
                    if (selectedItem?.usableOnPokemon) {
                      handleUseItem(pkmn.id);
                    }
                  }}
                  className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelectedTarget
                      ? 'bg-amber-100 border-amber-600 shadow-md ring-2 ring-amber-500/50'
                      : 'bg-slate-950/90 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={pkmn.spriteUrl}
                        alt={pkmn.speciesName}
                        className="w-8 h-8 object-contain shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = pkmn.artworkUrl;
                        }}
                      />
                      <div className="leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-black truncate max-w-[90px] ${isSelectedTarget ? 'text-slate-950' : 'text-white'}`}>
                            {pkmn.speciesName}
                          </span>
                          {isFainted && (
                            <span className="text-[9px] bg-red-600 text-white font-extrabold px-1 rounded">
                              FNT
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${isSelectedTarget ? 'text-amber-800' : 'text-amber-400'}`}>
                          Lv. {pkmn.level}
                        </span>
                      </div>
                    </div>

                    {/* ABLE / UNABLE Pill (DS Authentic) */}
                    <div className="text-right">
                      {selectedItem?.usableOnPokemon ? (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                          usability.able
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {usability.able ? 'ABLE' : 'UNABLE'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 font-bold">
                          {pkmn.stats.hp}/{pkmn.stats.maxHp}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-700 mt-1.5">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isFainted ? 'bg-red-600' : hpPercent <= 25 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: RETRO ITEM LIST (x 1, x 2, x 15) */}
        <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/95 p-3 rounded-2xl border-2 border-slate-700">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Backpack size={14} /> POCKET: {activePocket.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {pocketItems.length} types stored
              </span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {pocketItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  This pocket is empty. Visit the PokéMart to purchase items!
                </div>
              ) : (
                pocketItems.map(item => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                          : 'bg-slate-900/80 text-slate-200 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={item.icon} alt={item.name} className="w-6 h-6 object-contain" />
                        <span className="text-xs font-bold">{item.name}</span>
                      </div>
                      <span className={`text-xs font-mono font-black ${isSelected ? 'text-slate-950' : 'text-amber-400'}`}>
                        x {item.count}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Action when an item is selected */}
          {selectedItem && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                {selectedItem.usableOnPokemon ? 'Tap any ABLE party Pokémon to use' : 'Item ready in bag'}
              </span>
              <span className="text-amber-400 font-mono font-bold">
                Owned: {selectedItem.count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. RETRO BOTTOM ITEM DESCRIPTION WINDOW (DS Style with large item icon & description) */}
      {selectedItem && (
        <div className="bg-slate-900/95 p-3.5 rounded-2xl border-2 border-slate-700 shadow-xl flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-950 p-2 border-2 border-slate-700 shrink-0 flex items-center justify-center">
            <img src={selectedItem.icon} alt={selectedItem.name} className="w-12 h-12 object-contain drop-shadow" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-amber-400">{selectedItem.name}</h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ₽{selectedItem.price.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {selectedItem.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
