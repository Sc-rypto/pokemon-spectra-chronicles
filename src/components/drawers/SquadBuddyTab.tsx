import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { PokemonData } from '../../types/game';
import { Heart, Sparkles, Zap, Shield, Swords, ArrowRightLeft, Compass } from 'lucide-react';

interface SquadBuddyTabProps {
  state: GameStateManager;
}

export const SquadBuddyTab: React.FC<SquadBuddyTabProps> = ({ state }) => {
  const [selectedSquadIdx, setSelectedSquadIdx] = useState<number>(0);
  const selectedPokemon: PokemonData = state.squad[selectedSquadIdx] || state.squad[0];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Supernova':
        return 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-orange-500/50 font-bold';
      case 'Ethereal':
        return 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold';
      case 'Radiant':
        return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-bold';
      case 'Shiny':
        return 'bg-amber-400 text-slate-950 font-semibold';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="tab-pane-content space-y-4">
      {/* 5-Active Battle Squad Lineup */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Combat Squad (5 Battle Slots)
          </span>
          <span className="text-[11px] text-slate-500">Tap to inspect IVs/EVs & Move Priorities</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {state.squad.map((pkmn, idx) => (
            <button
              key={pkmn.id}
              onClick={() => setSelectedSquadIdx(idx)}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-28 ${
                selectedSquadIdx === idx
                  ? 'bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${getTierBadge(pkmn.prismaticTier)}`}>
                  {pkmn.prismaticTier}
                </span>
              </div>

              <div>
                <div className="font-bold text-xs text-white truncate">{pkmn.speciesName}</div>
                <div className="text-[11px] text-emerald-400 font-mono">Lv. {pkmn.level}</div>
              </div>

              {/* Mini HP bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (pkmn.stats.hp / pkmn.stats.maxHp) * 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Pokemon Detailed Inspection & Buddy Exploration Tree */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selected Pokemon Stats & IVs/EVs */}
        <div className="md:col-span-2 bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                style={{ backgroundColor: selectedPokemon.primaryColor }}
              >
                {selectedPokemon.speciesName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{selectedPokemon.speciesName}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${getTierBadge(selectedPokemon.prismaticTier)}`}>
                    {selectedPokemon.prismaticTier}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Dex #{selectedPokemon.dexNumber} • Types: {selectedPokemon.types.join('/')} • Nature: {selectedPokemon.nature}
                </div>
              </div>
            </div>

            <button
              onClick={() => state.setBuddy(selectedPokemon)}
              className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Compass size={14} /> Set as Walking Buddy
            </button>
          </div>

          {/* Scaled Continuous Stats Matrix */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">HP</span>
              <span className="font-bold text-emerald-400">{selectedPokemon.stats.maxHp}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.hp}/31</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">ATK</span>
              <span className="font-bold text-rose-400">{selectedPokemon.stats.atk}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.atk}/31</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">DEF</span>
              <span className="font-bold text-sky-400">{selectedPokemon.stats.def}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.def}/31</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">SP.ATK</span>
              <span className="font-bold text-purple-400">{selectedPokemon.stats.spa}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spa}/31</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">SP.DEF</span>
              <span className="font-bold text-teal-400">{selectedPokemon.stats.spd}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spd}/31</span>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/50">
              <span className="text-[10px] text-slate-400 block">SPEED</span>
              <span className="font-bold text-yellow-400">{selectedPokemon.stats.spe}</span>
              <span className="text-[9px] text-slate-500 block">IV: {selectedPokemon.ivs.spe}/31</span>
            </div>
          </div>

          {/* Move-Priority Tiers Configuration */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
              Move Priority Configuration (Auto-Cast Engine)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedPokemon.moves.map(m => (
                <div key={m.id} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-200">{m.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Pwr {m.power} • CD {m.cooldown}s • {m.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400">Tier</span>
                    <select
                      value={m.priorityTier}
                      onChange={e => {
                        m.priorityTier = parseInt(e.target.value) as any;
                        state.sync3DScene();
                      }}
                      className="bg-slate-900 text-xs border border-slate-600 rounded px-1.5 py-0.5 text-slate-200"
                    >
                      <option value={1}>Tier 1 (High)</option>
                      <option value={2}>Tier 2 (Mid)</option>
                      <option value={3}>Tier 3 (Low)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Walking Buddy Exploration Passives Tree */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Compass size={18} className="text-amber-400" />
            <h4 className="font-bold text-sm text-slate-200">Buddy Overworld Passives</h4>
          </div>

          {state.buddy ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 p-2 bg-slate-800/60 rounded-lg">
                <span className="text-xl">🐾</span>
                <div>
                  <div className="font-bold text-xs text-white">{state.buddy.speciesName}</div>
                  <div className="text-[10px] text-amber-400">
                    Affection Level: {state.buddyData.affectionLevel} ⭐
                  </div>
                </div>
              </div>

              {/* Passive skill branches */}
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-purple-300 block">Prismatic Resonance</span>
                    <span className="text-[10px] text-slate-400">
                      Increases rare tier wild spawn rate by +{(state.buddyData.passiveTree.prismaticResonanceTier * 50)}%
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      state.buddyData.passiveTree.prismaticResonanceTier++;
                      state.sync3DScene();
                    }}
                    className="px-2 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-[11px]"
                  >
                    Lv {state.buddyData.passiveTree.prismaticResonanceTier} +
                  </button>
                </div>

                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-yellow-300 block">Auto-Dowsing</span>
                    <span className="text-[10px] text-slate-400">
                      Picks up extra Prismatic Shards per wave clear
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      state.buddyData.passiveTree.autoDowsingTier++;
                      state.sync3DScene();
                    }}
                    className="px-2 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded text-[11px]"
                  >
                    Lv {state.buddyData.passiveTree.autoDowsingTier} +
                  </button>
                </div>

                <div className="p-2 bg-slate-800/40 rounded-lg border border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-300 block">Gold Hoarder</span>
                    <span className="text-[10px] text-slate-400">
                      +{(state.buddyData.passiveTree.goldHoarderTier * 30)}% Poké-Dollar battle spoils
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      state.buddyData.passiveTree.goldHoarderTier++;
                      state.sync3DScene();
                    }}
                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px]"
                  >
                    Lv {state.buddyData.passiveTree.goldHoarderTier} +
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 py-6 text-center">No active buddy selected.</div>
          )}
        </div>
      </div>
    </div>
  );
};
