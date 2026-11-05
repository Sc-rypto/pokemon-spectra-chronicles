import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { Play, Pause, Flame, Filter, Sparkles, Swords } from 'lucide-react';
import { ASSET_ICONS } from '../../data/pokemonCatalog';

interface BattleTabProps {
  state: GameStateManager;
}

export const BattleTab: React.FC<BattleTabProps> = ({ state }) => {
  const autoSettings = state.autoCatchSettings;

  const toggleAutoBattler = () => {
    state.isBattling = !state.isBattling;
    state.addLog(state.isBattling ? 'Auto-battler resumed.' : 'Auto-battler paused.', 'level');
  };

  const triggerSupernovaEncounter = () => {
    state.spawnWildEncounter(true);
    state.addLog('COSMIC ANOMALY: Supernova Prismatic entity detected!', 'prismatic');
  };

  return (
    <div className="space-y-4">
      {/* Quick Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAutoBattler}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
              state.isBattling
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            {state.isBattling ? <Pause size={15} /> : <Play size={15} />}
            {state.isBattling ? 'Combat Active' : 'Combat Paused'}
          </button>

          <button
            onClick={triggerSupernovaEncounter}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all animate-pulse"
          >
            <Flame size={15} className="text-yellow-200" />
            Summon Supernova (Demo)
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Wave: <span className="text-cyan-400 font-bold">#{state.waveNumber}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            Caught: <span className="text-emerald-400 font-bold">{state.pokedexCaught.size}</span>/1025
          </div>
        </div>
      </div>

      {/* Auto-Catch Rules & Activity Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rules Engine */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Filter size={15} />
            <span>Automated Catch Rules</span>
          </div>

          <div className="space-y-2 text-xs text-slate-200">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 cursor-pointer border border-slate-800/80">
              <span>Enable Auto-Capture</span>
              <input
                type="checkbox"
                checked={autoSettings.enabled}
                onChange={e => {
                  autoSettings.enabled = e.target.checked;
                  state.notify();
                }}
                className="w-4 h-4 accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 cursor-pointer border border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Target Prismatic Variants Only
              </span>
              <input
                type="checkbox"
                checked={autoSettings.targetPrismaticOnly}
                onChange={e => {
                  autoSettings.targetPrismaticOnly = e.target.checked;
                  state.notify();
                }}
                className="w-4 h-4 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 cursor-pointer border border-slate-800/80">
              <span>Catch Unregistered Dex Species</span>
              <input
                type="checkbox"
                checked={autoSettings.catchUnregistered}
                onChange={e => {
                  autoSettings.catchUnregistered = e.target.checked;
                  state.notify();
                }}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span>Preferred Ball:</span>
              <select
                value={autoSettings.preferredBall}
                onChange={e => {
                  autoSettings.preferredBall = e.target.value as any;
                  state.notify();
                }}
                className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1 rounded-lg text-slate-200"
              >
                <option value="poke">Poké Ball</option>
                <option value="great">Great Ball</option>
                <option value="ultra">Ultra Ball</option>
                <option value="prismatic">Prismatic Sphere</option>
              </select>
            </div>
          </div>
        </div>

        {/* Combat Feed */}
        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col h-60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Swords size={15} className="text-red-400" />
              1v1 Battle Activity
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Live</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 text-xs font-mono pr-1 custom-scrollbar">
            {state.combatLogs.map(log => (
              <div
                key={log.id}
                className={`p-2 rounded-xl transition-all ${
                  log.type === 'prismatic'
                    ? 'bg-amber-950/50 text-amber-300 border border-amber-500/40 font-bold'
                    : log.type === 'catch'
                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                    : log.type === 'faint'
                    ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-950/60 text-slate-300 border border-slate-800'
                }`}
              >
                <span className="text-slate-500 text-[10px] mr-2">[{log.timestamp}]</span>
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
