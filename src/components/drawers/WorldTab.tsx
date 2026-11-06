import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { REGIONS_DATA } from '../../data/pokemonCatalog';
import { getCityBackgroundUrl } from '../../data/cityBackgrounds';
import { MapPin, Lock, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

interface WorldTabProps {
  state: GameStateManager;
}

export const WorldTab: React.FC<WorldTabProps> = ({ state }) => {
  const [selectedRegionIdx, setSelectedRegionIdx] = useState<number>(state.currentRegionIndex);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const viewingRegion = REGIONS_DATA[selectedRegionIdx];

  const handleTravelClick = (cityIdx: number) => {
    const success = state.travelToCity(selectedRegionIdx, cityIdx);
    if (!success) {
      const targetGym = viewingRegion.gyms[cityIdx];
      const prevGym = viewingRegion.gyms[cityIdx - 1];
      setWarningMsg(`Cannot travel to ${targetGym.cityName}! Defeat ${prevGym ? 'Leader ' + prevGym.name : 'previous Gym'} first!`);
      setTimeout(() => setWarningMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Toast if player tries to travel to locked town */}
      {warningMsg && (
        <div className="bg-rose-950/90 border border-rose-500/60 p-3 rounded-2xl flex items-center gap-2.5 text-xs text-rose-200 animate-bounce">
          <AlertCircle size={16} className="text-rose-400 shrink-0" />
          <span className="font-bold">{warningMsg}</span>
        </div>
      )}

      {/* 9 Regions Selector */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Pokémon Region (Generations 1 - 9)
          </span>
          <span className="text-xs text-amber-400 font-mono">
            Level Cap: Lv.{state.getHardLevelCap()}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {REGIONS_DATA.map((reg, idx) => {
            const isUnlocked = idx <= state.maxUnlockedRegionIndex;
            const isSelected = idx === selectedRegionIdx;
            const isCurrent = idx === state.currentRegionIndex;
            const badgesDefeated = reg.gyms.filter(g => g.defeated).length;

            return (
              <button
                key={reg.id}
                disabled={!isUnlocked}
                onClick={() => setSelectedRegionIdx(idx)}
                className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all relative ${
                  isSelected
                    ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/50 text-white shadow-xl'
                    : isUnlocked
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <img src={reg.badgeIcon} alt={reg.name} className="w-6 h-6 object-contain mb-1 drop-shadow" />
                <div className="text-xs font-extrabold truncate w-full">{reg.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{reg.generation}</div>

                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-emerald-500/40" />
                )}
                {!isUnlocked && <Lock size={10} className="text-slate-600 mt-1" />}
                {isUnlocked && (
                  <span className="text-[9px] text-amber-400 font-bold mt-0.5">{badgesDefeated}/8</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region Overview & Cities Interactive Map */}
      <div className="bg-slate-900/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <MapPin size={20} className="text-indigo-400" />
                {viewingRegion.name} Regional Cities & Gym Badges
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                {viewingRegion.generation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Town progression strictly gated by defeating Gym Leaders.
            </p>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Gyms Cleared</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {viewingRegion.gyms.filter(g => g.defeated).length} / 8 Badges
              </span>
            </div>
          </div>
        </div>

        {/* 8 Cities Grid with City Backgrounds & Locked Travel Guard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {viewingRegion.gyms.map((gym, cIdx) => {
            const isPlayerHere = state.currentRegionIndex === selectedRegionIdx && state.currentCityIndex === cIdx;
            const wavesCleared = state.cityWavesBeaten[gym.id] || 0;

            // City is unlocked if it's the 1st city of unlocked region, OR previous gym was defeated
            const isCityUnlocked = cIdx === 0
              ? selectedRegionIdx <= state.maxUnlockedRegionIndex
              : viewingRegion.gyms[cIdx - 1]?.defeated;

            const canChallengeGym = isCityUnlocked && !gym.defeated && wavesCleared >= gym.wavesRequiredToChallenge;
            const cityBg = getCityBackgroundUrl(gym.id, viewingRegion.id);

            return (
              <div
                key={gym.id}
                className={`p-3.5 rounded-2xl border relative flex flex-col justify-between overflow-hidden transition-all ${
                  isPlayerHere
                    ? 'bg-slate-950 border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-xl'
                    : gym.defeated
                    ? 'bg-slate-950/70 border-emerald-500/40'
                    : isCityUnlocked
                    ? 'bg-slate-950 border-amber-500/60'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                {/* Subtle City Backdrop */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
                  style={{ backgroundImage: `url(${cityBg})` }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <img src={gym.badgeIcon} alt={gym.badgeName} className="w-8 h-8 object-contain drop-shadow" />
                    {gym.defeated ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <CheckCircle2 size={11} /> BEATEN
                      </span>
                    ) : isPlayerHere ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        HERE
                      </span>
                    ) : isCityUnlocked ? (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                        UNLOCKED
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Lock size={10} /> LOCKED
                      </span>
                    )}
                  </div>

                  <div className="font-extrabold text-sm text-white truncate">{gym.cityName}</div>
                  <div className="text-xs text-indigo-300 font-semibold">{gym.name} • {gym.badgeName}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ace: <span className="text-slate-200 font-bold">{gym.acePokemon}</span> (Lv.{gym.levelRequirement})
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Waves: {wavesCleared}/{gym.wavesRequiredToChallenge}
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    +₽{gym.rewardDollars.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1">
                    {/* Travel Button (Guarded) */}
                    <button
                      onClick={() => handleTravelClick(cIdx)}
                      disabled={isPlayerHere || !isCityUnlocked}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isPlayerHere
                          ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : isCityUnlocked
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                      }`}
                      title={!isCityUnlocked ? 'Locked town' : `Travel to ${gym.cityName}`}
                    >
                      <Navigation size={12} />
                      <span>{isPlayerHere ? 'Active' : isCityUnlocked ? 'Travel' : 'Locked'}</span>
                    </button>

                    {/* Challenge Gym if Wave requirement is met */}
                    {canChallengeGym && (
                      <button
                        onClick={() => state.startGymBattle(gym)}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl transition-all shadow-md animate-pulse"
                      >
                        Gym
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
