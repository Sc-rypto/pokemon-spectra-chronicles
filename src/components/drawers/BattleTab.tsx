import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { Swords, Sparkles, Filter, Play, Pause, Flame, ShieldAlert, Award } from 'lucide-react';

interface BattleTabProps {
  state: GameStateManager;
}

export const BattleTab: React.FC<BattleTabProps> = ({ state }) => {
  const currentRegion = state.currentRegionIndex;
  const autoSettings = state.autoCatchSettings;

  const toggleAutoBattler = () => {
    state.isBattling = !state.isBattling;
    state.addLog(state.isBattling ? 'Auto-battler resumed.' : 'Auto-battler paused.', 'level');
  };

  const triggerSupernovaEncounter = () => {
    state.spawnEnemyWave(true);
    state.addLog('🚨 COSMIC ANOMALY: Supernova Prismatic entity detected!', 'prismatic');
  };

  return (
    <div className="tab-pane-content">
      {/* Top Quick Actions Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoBattler}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
              state.isBattling
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
            }`}
          >
            {state.isBattling ? <Pause size={16} /> : <Play size={16} />}
            {state.isBattling ? 'Combat Running' : 'Combat Paused'}
          </button>

          <button
            onClick={triggerSupernovaEncounter}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-orange-950/40 animate-pulse transition-all"
            title="Simulate 1/65,536 Supernova encounter immediately"
          >
            <Flame size={16} className="text-yellow-200" />
            Summon Supernova (Demo)
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
            Wave: <span className="text-cyan-400 font-bold">#{state.waveNumber}</span>
          </div>
          <div className="bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
            Region: <span className="text-yellow-400 font-bold">{state.currentRegionIndex + 1}/9</span>
          </div>
        </div>
      </div>

      {/* Auto-Catch & Target Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hunter Target Rules Engine */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
            <Filter size={18} />
            <span>Automated Catch Rules Engine</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-200">
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
              <span>Enable Auto-Capture</span>
              <input
                type="checkbox"
                checked={autoSettings.enabled}
                onChange={e => {
                  autoSettings.enabled = e.target.checked;
                  state.sync3DScene();
                }}
                className="w-4 h-4 accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-400" />
                Target Prismatic Only
              </span>
              <input
                type="checkbox"
                checked={autoSettings.targetPrismaticOnly}
                onChange={e => {
                  autoSettings.targetPrismaticOnly = e.target.checked;
                  state.sync3DScene();
                }}
                className="w-4 h-4 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer">
              <span>Catch Unregistered Dex Species</span>
              <input
                type="checkbox"
                checked={autoSettings.catchUnregistered}
                onChange={e => {
                  autoSettings.catchUnregistered = e.target.checked;
                  state.sync3DScene();
                }}
                className="w-4 h-4 accent-cyan-500"
              />
            </label>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span>Preferred Ball:</span>
              <select
                value={autoSettings.preferredBall}
                onChange={e => {
                  autoSettings.preferredBall = e.target.value as any;
                  state.sync3DScene();
                }}
                className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded text-slate-200"
              >
                <option value="poke">Poké Ball</option>
                <option value="great">Great Ball</option>
                <option value="ultra">Ultra Ball</option>
                <option value="prismatic">Prismatic Sphere (100%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Combat Feed / Activity Stream */}
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 flex flex-col h-60">
          <div className="flex items-center justify-between text-sm font-bold text-slate-300 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-2">
              <Swords size={16} className="text-red-400" />
              Continuous Battle Log
            </span>
            <span className="text-xs text-slate-500 font-mono">Real-time Tick</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-2 text-xs font-mono pr-1 custom-scrollbar">
            {state.combatLogs.map(log => (
              <div
                key={log.id}
                className={`p-1.5 rounded transition-all ${
                  log.type === 'prismatic'
                    ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-400 font-semibold'
                    : log.type === 'catch'
                    ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-400'
                    : log.type === 'faint'
                    ? 'bg-rose-950/30 text-rose-300 border-l-2 border-rose-500'
                    : 'bg-slate-800/40 text-slate-300'
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
