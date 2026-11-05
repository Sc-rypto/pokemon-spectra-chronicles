import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { REGIONS_DATA, ASSET_ICONS } from '../../data/pokemonCatalog';
import { Map, Lock, CheckCircle2 } from 'lucide-react';

interface WorldTabProps {
  state: GameStateManager;
}

export const WorldTab: React.FC<WorldTabProps> = ({ state }) => {
  const currentRegion = REGIONS_DATA[state.currentRegionIndex];

  return (
    <div className="space-y-4">
      {/* 9-Region Linear Map Strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            9-Region Progression Continuum (Levels 1 to 900)
          </span>
          <span className="text-xs text-cyan-400 font-mono">
            Active: {currentRegion.name} ({currentRegion.generation})
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
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                  isCurrent
                    ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50 text-white shadow-xl'
                    : isUnlocked
                    ? 'bg-slate-900/90 border-slate-700 hover:border-slate-500 text-slate-300'
                    : 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <img src={reg.badgeIcon} alt={reg.name} className="w-6 h-6 object-contain mb-1" />
                <div className="text-xs font-extrabold truncate w-full">{reg.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">R{reg.id}</div>
                {!isUnlocked && <Lock size={11} className="text-slate-600 mt-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gym Challenge & Cap Unlocks */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Map size={18} className="text-indigo-400" />
              {currentRegion.name} Gym Challenge & Level Cap Thresholds
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Defeating Gym Leaders unlocks your squad's level cap and rewards economy cash!
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Badges Cleared</span>
            <span className="text-sm font-bold text-amber-400 font-mono">
              {currentRegion.gyms.filter(g => g.defeated).length} / {currentRegion.gyms.length}
            </span>
          </div>
        </div>

        {/* Gym Leaders List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {currentRegion.gyms.map(gym => (
            <div
              key={gym.id}
              className={`p-3.5 rounded-2xl border relative flex flex-col justify-between ${
                gym.defeated
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : gym.unlocked
                  ? 'bg-slate-950 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <img src={gym.badgeIcon} alt={gym.badgeName} className="w-8 h-8 object-contain" />
                  {gym.defeated ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                      <CheckCircle2 size={12} /> CLEARED
                    </span>
                  ) : gym.unlocked ? (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock size={11} /> LOCKED
                    </span>
                  )}
                </div>

                <div className="font-extrabold text-sm text-white">{gym.name}</div>
                <div className="text-xs text-indigo-300 font-medium">{gym.badgeName}</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Ace: <span className="text-slate-200 font-bold">{gym.acePokemon}</span> (Lv.{gym.levelRequirement})
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +₽{gym.rewardDollars.toLocaleString()}
                </span>
                {gym.unlocked && !gym.defeated && (
                  <button
                    onClick={() => state.defeatGymLeader(gym.id)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
                  >
                    Challenge
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
