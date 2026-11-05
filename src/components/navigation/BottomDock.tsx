import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { Swords, Users, Map, ShoppingBag, Shield } from 'lucide-react';
import { ASSET_ICONS, getPrismaticSpriteStyle } from '../../data/pokemonCatalog';

export type TabKey = 'meadow' | 'team' | 'world' | 'shop' | 'raid';

interface BottomDockProps {
  state: GameStateManager;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  state,
  activeTab,
  onSelectTab,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-4xl mx-auto px-3 py-2 flex flex-col gap-2">
        {/* TALLGRASS TEAM SELECTOR STRIP (Active 1v1 Battler Switcher) */}
        <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-1 py-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mr-1 hidden sm:inline">
              Team:
            </span>
            {state.squad.map((pkmn, idx) => {
              const isActive = state.activeBattlerSlot === idx;
              const style = getPrismaticSpriteStyle(pkmn.prismaticTier);
              return (
                <button
                  key={pkmn.id}
                  onClick={() => state.switchActiveBattler(idx)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all shrink-0 ${
                    isActive
                      ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                  title={`Deploy ${pkmn.speciesName} into 1v1 Battle`}
                >
                  <img
                    src={pkmn.spriteUrl}
                    alt={pkmn.speciesName}
                    style={{ filter: style.filterStyle }}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = pkmn.artworkUrl;
                    }}
                  />
                  <div className="text-left text-xs leading-none">
                    <div className="font-extrabold truncate max-w-[70px]">{pkmn.speciesName}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">Lv.{pkmn.level}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Walking Buddy Chip */}
          {state.buddy && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs shrink-0">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Buddy:</span>
              <img
                src={state.buddy.spriteUrl}
                alt={state.buddy.speciesName}
                className="w-6 h-6 object-contain"
              />
              <span className="font-bold text-slate-200 text-[11px]">{state.buddy.speciesName}</span>
            </div>
          )}
        </div>

        {/* PRIMARY FIXED APP NAVIGATION TABS */}
        <div className="grid grid-cols-5 gap-1.5 text-center">
          <button
            onClick={() => onSelectTab('meadow')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'meadow'
                ? 'bg-emerald-600/30 border border-emerald-500 text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Swords size={18} />
            <span className="text-[11px] font-semibold mt-0.5">Meadow</span>
          </button>

          <button
            onClick={() => onSelectTab('team')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'team'
                ? 'bg-indigo-600/30 border border-indigo-500 text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Users size={18} />
            <span className="text-[11px] font-semibold mt-0.5">Team & Box</span>
          </button>

          <button
            onClick={() => onSelectTab('world')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'world'
                ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Map size={18} />
            <span className="text-[11px] font-semibold mt-0.5">World</span>
          </button>

          <button
            onClick={() => onSelectTab('shop')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'shop'
                ? 'bg-amber-600/30 border border-amber-500 text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShoppingBag size={18} />
            <span className="text-[11px] font-semibold mt-0.5">PokéMart</span>
          </button>

          <button
            onClick={() => onSelectTab('raid')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
              activeTab === 'raid'
                ? 'bg-red-600/30 border border-red-500 text-red-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Shield size={18} />
            <span className="text-[11px] font-semibold mt-0.5">Raid & Market</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
