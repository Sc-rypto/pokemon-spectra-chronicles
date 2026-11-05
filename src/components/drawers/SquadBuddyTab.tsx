import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { getPrismaticSpriteStyle } from '../../data/pokemonCatalog';
import { Compass, Sparkles, ArrowRightLeft, Shield } from 'lucide-react';

interface SquadBuddyTabProps {
  state: GameStateManager;
}

export const SquadBuddyTab: React.FC<SquadBuddyTabProps> = ({ state }) => {
  const [selectedSlot, setSelectedSlot] = useState<number>(state.activeBattlerSlot);
  const selectedPokemon = state.squad[selectedSlot] || state.squad[0];
  const selectedStyle = getPrismaticSpriteStyle(selectedPokemon.prismaticTier);

  return (
    <div className="space-y-4">
      {/* 5 Squad Members Roster */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Battle Squad (5 Team Slots)
          </span>
          <span className="text-[11px] text-slate-500">Tap to inspect or switch active battler</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {state.squad.map((pkmn, idx) => {
            const isActive = state.activeBattlerSlot === idx;
            const style = getPrismaticSpriteStyle(pkmn.prismaticTier);
            return (
              <button
                key={pkmn.id}
                onClick={() => {
                  setSelectedSlot(idx);
                  state.switchActiveBattler(idx);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all relative flex flex-col items-center justify-between h-32 ${
                  isActive
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-xl'
                    : selectedSlot === idx
                    ? 'bg-slate-800/80 border-slate-600 text-slate-200'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <img
                  src={pkmn.spriteUrl}
                  alt={pkmn.speciesName}
                  style={{ filter: style.filterStyle }}
                  className="w-14 h-14 object-contain mx-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = pkmn.artworkUrl;
                  }}
                />

                <div className="w-full truncate">
                  <div className="font-extrabold text-xs text-white truncate">{pkmn.speciesName}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Lv.{pkmn.level}</div>
                </div>

                {isActive && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Pokemon Detailed View & Buddy Passives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stats Matrix */}
        <div className="md:col-span-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={selectedPokemon.spriteUrl}
                alt={selectedPokemon.speciesName}
                style={{ filter: selectedStyle.filterStyle }}
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = selectedPokemon.artworkUrl;
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-white text-base">{selectedPokemon.speciesName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${selectedStyle.badgeClass}`}>
                    {selectedPokemon.prismaticTier}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Dex #{selectedPokemon.dexNumber} • Type: <span className="text-emerald-400 font-bold">{selectedPokemon.types.join('/')}</span> • Nature: {selectedPokemon.nature}
                </div>
              </div>
            </div>

            <button
              onClick={() => state.setBuddy(selectedPokemon)}
              className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition-all"
            >
              Set as Walking Buddy
            </button>
          </div>

          {/* Continuous Scaled Stats (Formula Driven) */}
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

          {/* Move Priority Config */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Move Priority Configuration
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPokemon.moves.map(m => (
                <div key={m.id} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">{m.name}</div>
                    <div className="text-[10px] text-slate-400">Power {m.power} • {m.cooldown}s CD</div>
                  </div>
                  <select
                    value={m.priorityTier}
                    onChange={e => {
                      m.priorityTier = parseInt(e.target.value) as any;
                      state.notify();
                    }}
                    className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-2 py-1 rounded-lg"
                  >
                    <option value={1}>Tier 1 (High)</option>
                    <option value={2}>Tier 2 (Mid)</option>
                    <option value={3}>Tier 3 (Low)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Walking Buddy Tree */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Compass size={16} className="text-amber-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-white">Walking Buddy Passives</h4>
          </div>

          {state.buddy ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <img
                  src={state.buddy.spriteUrl}
                  alt={state.buddy.speciesName}
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <div className="font-black text-xs text-white">{state.buddy.speciesName}</div>
                  <div className="text-[10px] text-amber-400">Affection Level: {state.buddyData.affectionLevel} ⭐</div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-300 block">Prismatic Resonance</span>
                    <span className="text-[10px] text-slate-400">+{(state.buddyData.passiveTree.prismaticResonanceTier * 50)}% rare spawn rates</span>
                  </div>
                  <button
                    onClick={() => {
                      state.buddyData.passiveTree.prismaticResonanceTier++;
                      state.notify();
                    }}
                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded-lg text-xs font-bold"
                  >
                    Lv.{state.buddyData.passiveTree.prismaticResonanceTier} +
                  </button>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-300 block">Gold Hoarder</span>
                    <span className="text-[10px] text-slate-400">+{(state.buddyData.passiveTree.goldHoarderTier * 40)}% battle rewards</span>
                  </div>
                  <button
                    onClick={() => {
                      state.buddyData.passiveTree.goldHoarderTier++;
                      state.notify();
                    }}
                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Lv.{state.buddyData.passiveTree.goldHoarderTier} +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No companion selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
