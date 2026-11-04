import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { REGIONS_DATA } from '../../data/pokemonCatalog';
import { MapPin, Trophy, Lock, CheckCircle2, ChevronRight, Mountain } from 'lucide-react';

interface WorldTabProps {
  state: GameStateManager;
}

export const WorldTab: React.FC<WorldTabProps> = ({ state }) => {
  const currentRegion = REGIONS_DATA[state.currentRegionIndex];

  return (
    <div className="tab-pane-content space-y-4">
      {/* 9-Region Linear Progression Map Ribbon */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            9-Region Continuum (Levels 1 to 900)
          </span>
          <span className="text-xs text-cyan-400 font-mono">
            Current: {currentRegion.name} ({currentRegion.generation}) • Lv. {currentRegion.levelRange[0]}-{currentRegion.levelRange[1]}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {REGIONS_DATA.map((reg, idx) => {
            const isUnlocked = idx <= state.maxUnlockedRegionIndex;
            const isCurrent = idx === state.currentRegionIndex;

            return (
              <button
                key={reg.id}
                disabled={!isUnlocked}
                onClick={() => state.switchRegion(idx)}
                className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/40 text-white'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500 text-slate-300'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="text-sm font-bold">R{reg.id}</div>
                <div className="text-xs font-semibold truncate w-full">{reg.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Lv.{reg.levelRange[0]}-{reg.levelRange[1]}
                </div>
                {!isUnlocked && <Lock size={12} className="text-slate-600 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Details & 8 Gym Leaders Progression Table */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Mountain size={18} className="text-indigo-400" />
              {currentRegion.name} Gym Challenge & Level Cap Locks
            </h3>
            <p className="text-xs text-slate-400">
              Pokémon level progression is capped at the next undefeated Gym Leader's threshold.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Total Badges</span>
            <span className="text-sm font-bold text-amber-400">
              {currentRegion.gyms.filter(g => g.defeated).length} / {currentRegion.gyms.length}
            </span>
          </div>
        </div>

        {/* Gym Leaders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {currentRegion.gyms.map(gym => (
            <div
              key={gym.id}
              className={`p-3 rounded-xl border relative flex flex-col justify-between ${
                gym.defeated
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : gym.unlocked
                  ? 'bg-slate-800/80 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/50 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl">{gym.badgeIcon}</span>
                  {gym.defeated ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> CLEARED
                    </span>
                  ) : gym.unlocked ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock size={10} /> LOCKED
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-white">{gym.name}</div>
                <div className="text-[11px] text-indigo-300">{gym.badgeName}</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Ace: <span className="text-slate-300 font-medium">{gym.acePokemon}</span> (Lv. {gym.levelRequirement})
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-amber-300/80 font-mono">+{gym.rewardShards} 💎</span>
                {gym.unlocked && !gym.defeated && (
                  <button
                    onClick={() => state.defeatGymLeader(gym.id)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded transition-all shadow"
                  >
                    Challenge Gym
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
