import React from 'react';
import { RogueRewardOption } from '../../types/game';
import { GameStateManager } from '../../state/GameStateManager';
import { Gift, Sparkles, CheckCircle2 } from 'lucide-react';

interface RogueRewardModalProps {
  state: GameStateManager;
}

export const RogueRewardModal: React.FC<RogueRewardModalProps> = ({ state }) => {
  const options = state.currentRogueRewardOptions;
  if (!options || options.length === 0) return null;

  const handlePick = (reward: RogueRewardOption) => {
    reward.applyReward(state);
    state.dismissRogueReward();
  };

  const getRarityBadge = (rarity: RogueRewardOption['rarity']) => {
    switch (rarity) {
      case 'Master':
        return 'bg-purple-950 text-purple-300 border-purple-500/80 shadow-purple-950/50';
      case 'Ultra':
        return 'bg-amber-950 text-amber-300 border-amber-500/80 shadow-amber-950/50';
      case 'Great':
        return 'bg-blue-950 text-blue-300 border-blue-500/80 shadow-blue-950/50';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative flex flex-col justify-between max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Wave Clear Reward
              </span>
              <h2 className="text-lg md:text-xl font-black text-white">
                Choose 1 Item Reward!
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            Wave #{state.waveNumber}
          </span>
        </div>

        {/* 3 Rogue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handlePick(opt)}
              className="p-4 rounded-3xl border border-slate-800 bg-slate-950/80 hover:bg-slate-950 hover:border-indigo-500/80 hover:scale-[1.03] transition-all text-left flex flex-col justify-between group shadow-xl relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${getRarityBadge(opt.rarity)}`}>
                    {opt.rarity}
                  </span>
                  <Sparkles size={13} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                </div>

                <div className="flex flex-col items-center my-3">
                  <img
                    src={opt.icon}
                    alt={opt.name}
                    className="w-16 h-16 object-contain group-hover:scale-110 transition-transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  />
                  <div className="w-12 h-2 bg-black/40 rounded-[100%] blur-sm -mt-1" />
                </div>

                <h4 className="font-black text-sm text-white group-hover:text-amber-300 transition-colors mt-2 text-center">
                  {opt.name}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed text-center">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 w-full flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 group-hover:text-white flex items-center gap-1.5 transition-colors">
                  <CheckCircle2 size={13} /> Select
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-slate-500 font-mono">
          Pick 1 item to power up your adventure before the next encounter.
        </div>
      </div>
    </div>
  );
};
