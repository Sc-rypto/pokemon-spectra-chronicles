import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { PrismaticTier } from '../../types/game';
import { Settings, ShieldCheck, Crosshair, Check, Sparkles, X } from 'lucide-react';
import { ASSET_ICONS } from '../../data/pokemonCatalog';

interface AutoCatchSettingsModalProps {
  state: GameStateManager;
  onClose: () => void;
}

export const AutoCatchSettingsModal: React.FC<AutoCatchSettingsModalProps> = ({ state, onClose }) => {
  const settings = state.autoCatchSettings;

  const toggleMaster = () => {
    settings.enabled = !settings.enabled;
    state.saveGame();
    state.notify();
  };

  const toggleCatchUnregistered = () => {
    settings.catchUnregistered = !settings.catchUnregistered;
    state.saveGame();
    state.notify();
  };

  const toggleTargetPrismaticOnly = () => {
    settings.targetPrismaticOnly = !settings.targetPrismaticOnly;
    state.saveGame();
    state.notify();
  };

  const toggleTier = (tier: PrismaticTier) => {
    if (!settings.whitelistedTiers) {
      settings.whitelistedTiers = {
        Standard: true,
        Shiny: true,
        Radiant: true,
        Ethereal: true,
        Supernova: true,
      };
    }
    settings.whitelistedTiers[tier] = !settings.whitelistedTiers[tier];
    state.saveGame();
    state.notify();
  };

  const setHpThreshold = (val: number) => {
    settings.hpThresholdPercent = val;
    state.saveGame();
    state.notify();
  };

  const setPreferredBall = (ballId: string) => {
    settings.preferredBall = ballId;
    state.saveGame();
    state.notify();
  };

  const tiers: PrismaticTier[] = ['Standard', 'Shiny', 'Radiant', 'Ethereal', 'Supernova'];
  const orbOptions = state.inventory.filter(i => i.category === 'orbs');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-pokemon-ds">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-3xl p-5 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Crosshair size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">AUTO-CATCH FILTER SETTINGS</h2>
              <p className="text-[10px] text-slate-400">Configure automated orb capture logic (Tallgrass Module)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-white">Auto-Catch System</div>
            <div className="text-[11px] text-slate-400">Automatically throw orbs when conditions are satisfied</div>
          </div>
          <button
            onClick={toggleMaster}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              settings.enabled
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {settings.enabled ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* Priority Toggles */}
        <div className="space-y-2">
          <div className="text-[11px] font-black uppercase text-amber-400">Encounter Rules</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={toggleCatchUnregistered}
              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                settings.catchUnregistered
                  ? 'bg-indigo-950/60 border-indigo-500/70 text-indigo-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Prioritize Unregistered</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Always catch missing Pokédex species</div>
              </div>
              {settings.catchUnregistered && <Check size={14} className="text-indigo-400 shrink-0 mt-0.5" />}
            </button>

            <button
              onClick={toggleTargetPrismaticOnly}
              className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                settings.targetPrismaticOnly
                  ? 'bg-amber-950/60 border-amber-500/70 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Prismatics Only</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ignore standard species (Save Orbs)</div>
              </div>
              {settings.targetPrismaticOnly && <Check size={14} className="text-amber-400 shrink-0 mt-0.5" />}
            </button>
          </div>
        </div>

        {/* Rarity Tier Whitelist */}
        <div className="space-y-2">
          <div className="text-[11px] font-black uppercase text-amber-400">Allowed Rarity Tiers</div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {tiers.map(tier => {
              const isAllowed = settings.whitelistedTiers?.[tier] ?? true;
              return (
                <button
                  key={tier}
                  onClick={() => toggleTier(tier)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    isAllowed
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-black shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[11px]">{tier}</div>
                  <div className="text-[9px] mt-0.5">{isAllowed ? 'ON' : 'SKIP'}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Health Threshold Slider */}
        <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">HP Throw Threshold</span>
            <span className="font-mono font-black text-amber-400">Wild HP ≤ {settings.hpThresholdPercent || 40}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={80}
            step={5}
            value={settings.hpThresholdPercent || 40}
            onChange={(e) => setHpThreshold(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="text-[10px] text-slate-400">
            Will weaken target with Gentle Tap before automatically throwing preferred orbs.
          </div>
        </div>

        {/* Preferred Capture Orb */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-black uppercase text-amber-400">Preferred Auto-Throw Orb</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {orbOptions.map(orb => {
              const isSelected = settings.preferredBall === orb.id;
              return (
                <button
                  key={orb.id}
                  onClick={() => setPreferredBall(orb.id)}
                  className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img src={orb.icon} alt={orb.name} className="w-5 h-5 object-contain" />
                  <span className="text-[10px] font-bold truncate max-w-[80px]">{orb.name}</span>
                  <span className="text-[9px] font-mono text-slate-500">x{orb.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
