import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { getPrismaticSpriteStyle, TYPE_PALETTES } from '../../data/pokemonCatalog';
import { Compass, ArrowRightLeft, Shield, Sparkles, HeartPulse } from 'lucide-react';

interface SquadBuddyTabProps {
  state: GameStateManager;
}

export const SquadBuddyTab: React.FC<SquadBuddyTabProps> = ({ state }) => {
  const [selectedSquadSlot, setSelectedSquadSlot] = useState<number>(state.activeBattlerSlot);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);

  const selectedPokemon = state.squad[selectedSquadSlot] || state.squad[0];
  const selectedStyle = selectedPokemon ? getPrismaticSpriteStyle(selectedPokemon.prismaticTier) : null;

  return (
    <div className="space-y-6">
      {/* 1. SQUAD SELECTION ROSTER (5 SLOTS) */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Squad ({state.squad.length}/5 Pokémon)
          </span>
          <span className="text-xs text-indigo-400 font-medium">
            Tap a slot to switch active battler or swap with PC Box
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {[0, 1, 2, 3, 4].map(idx => {
            const pkmn = state.squad[idx];
            if (!pkmn) {
              return (
                <div
                  key={`empty_${idx}`}
                  className="p-2.5 rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/40 text-center flex flex-col items-center justify-center h-36 text-slate-600 text-xs font-mono"
                >
                  <span>Slot #{idx + 1}</span>
                  <span className="text-[10px] text-slate-700 mt-1">Empty</span>
                </div>
              );
            }

            const isActiveBattler = state.activeBattlerSlot === idx;
            const isSelected = selectedSquadSlot === idx;
            const style = getPrismaticSpriteStyle(pkmn.prismaticTier);

            return (
              <button
                key={pkmn.id}
                onClick={() => {
                  setSelectedSquadSlot(idx);
                  if (!pkmn.isFainted) {
                    state.switchActiveBattler(idx);
                  }
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all relative flex flex-col items-center justify-between h-36 ${
                  pkmn.isFainted
                    ? 'bg-rose-950/30 border-rose-500/50 opacity-70'
                    : isActiveBattler
                    ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/50 text-white shadow-xl'
                    : isSelected
                    ? 'bg-slate-800 border-slate-600 text-slate-200'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-full flex items-center justify-between px-1">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold">Lv.{pkmn.level}</span>
                  {pkmn.isFainted ? (
                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Fainted
                    </span>
                  ) : isActiveBattler && (
                    <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      1v1 Active
                    </span>
                  )}
                </div>

                <img
                  src={pkmn.spriteUrl}
                  alt={pkmn.speciesName}
                  style={{ filter: style.filterStyle }}
                  className="w-14 h-14 md:w-16 md:h-16 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = pkmn.artworkUrl;
                  }}
                />

                <div className="w-full truncate px-1">
                  <div className="font-extrabold text-xs text-white truncate">{pkmn.speciesName}</div>
                  <div className="text-[10px] text-slate-400 truncate">{pkmn.types.join('/')}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SELECTED POKEMON DETAILS & COMPANION ACTIONS */}
      {selectedPokemon && (
        <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedPokemon.spriteUrl}
                alt={selectedPokemon.speciesName}
                style={{ filter: selectedStyle?.filterStyle || 'none' }}
                className="w-16 h-16 object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedPokemon.artworkUrl;
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-base md:text-lg">{selectedPokemon.speciesName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedStyle?.badgeClass}`}>
                    {selectedPokemon.prismaticTier}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Dex #{selectedPokemon.dexNumber}</span>
                  <span>•</span>
                  <span>Nature: {selectedPokemon.nature}</span>
                  <span>•</span>
                  <div className="flex gap-1">
                    {selectedPokemon.types.map(t => (
                      <span
                        key={t}
                        className="px-1.5 py-0.2 rounded font-bold text-[9px] text-white"
                        style={{ backgroundColor: TYPE_PALETTES[t]?.primary || '#666' }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => state.setBuddy(selectedPokemon)}
                className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Compass size={14} /> Set Companion
              </button>
            </div>
          </div>

          {/* Six Core Stats Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">HP</span>
              <span className="font-extrabold text-emerald-400 text-sm">{selectedPokemon.stats.maxHp}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.hp}/31</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">ATK</span>
              <span className="font-extrabold text-rose-400 text-sm">{selectedPokemon.stats.atk}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.atk}/31</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">DEF</span>
              <span className="font-extrabold text-sky-400 text-sm">{selectedPokemon.stats.def}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.def}/31</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">SP.ATK</span>
              <span className="font-extrabold text-purple-400 text-sm">{selectedPokemon.stats.spa}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spa}/31</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">SP.DEF</span>
              <span className="font-extrabold text-teal-400 text-sm">{selectedPokemon.stats.spd}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spd}/31</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold">SPEED</span>
              <span className="font-extrabold text-yellow-400 text-sm">{selectedPokemon.stats.spe}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spe}/31</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. PC BOX SELECTION & SWAP INTERFACE */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <h4 className="font-extrabold text-white text-sm">
              PC Storage Box ({state.pcBox.length} Pokémon Stored)
            </h4>
            <p className="text-xs text-slate-400">
              Select a stored Pokémon and swap with your active squad
            </p>
          </div>

          {selectedBoxIndex !== null && (
            <button
              onClick={() => {
                state.swapSquadWithPC(selectedSquadSlot, selectedBoxIndex);
                setSelectedBoxIndex(null);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all uppercase tracking-wider"
            >
              <ArrowRightLeft size={14} />
              <span>Swap with Slot #{selectedSquadSlot + 1}</span>
            </button>
          )}
        </div>

        {state.pcBox.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No Pokémon in your PC box yet. Catch wild Pokémon in the tall grass using Capture Orbs!
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {state.pcBox.map((pkmn, bIdx) => {
              const isSelected = selectedBoxIndex === bIdx;
              const style = getPrismaticSpriteStyle(pkmn.prismaticTier);

              return (
                <button
                  key={pkmn.id}
                  onClick={() => setSelectedBoxIndex(bIdx)}
                  className={`p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-between h-28 ${
                    isSelected
                      ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/50 text-white shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[9px] font-mono text-cyan-400 font-bold self-start">Lv.{pkmn.level}</span>
                  <img
                    src={pkmn.spriteUrl}
                    alt={pkmn.speciesName}
                    style={{ filter: style.filterStyle }}
                    className="w-11 h-11 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = pkmn.artworkUrl;
                    }}
                  />
                  <div className="w-full truncate text-[11px] font-bold text-slate-200 mt-1">
                    {pkmn.speciesName}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
