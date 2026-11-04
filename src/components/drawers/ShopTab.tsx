import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { ShoppingBag, Sparkles, Coins, Gem, Check } from 'lucide-react';

interface ShopTabProps {
  state: GameStateManager;
}

export const ShopTab: React.FC<ShopTabProps> = ({ state }) => {
  const [activeCategory, setActiveCategory] = useState<'pokemart' | 'prismatic_bazaar'>('pokemart');
  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  const buyItem = (item: any, useShards = false) => {
    if (useShards) {
      if (state.prismaticShards >= (item.shardPrice || 0)) {
        state.prismaticShards -= item.shardPrice;
        item.count++;
        showFeedback(`Purchased ${item.name}!`);
      } else {
        showFeedback(`Not enough Prismatic Shards!`);
      }
    } else {
      if (state.pokeDollars >= item.price) {
        state.pokeDollars -= item.price;
        item.count++;
        showFeedback(`Purchased ${item.name}!`);
      } else {
        showFeedback(`Not enough Poké-Dollars!`);
      }
    }
    state.sync3DScene();
  };

  const showFeedback = (msg: string) => {
    setPurchaseMsg(msg);
    setTimeout(() => setPurchaseMsg(null), 2500);
  };

  return (
    <div className="tab-pane-content space-y-4">
      {/* Category Toggle & Wallet */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('pokemart')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'pokemart'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={14} /> PokéMart
          </button>

          <button
            onClick={() => setActiveCategory('prismatic_bazaar')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'prismatic_bazaar'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Prismatic Shard Bazaar
          </button>
        </div>

        {purchaseMsg && (
          <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded border border-emerald-500/40">
            {purchaseMsg}
          </div>
        )}
      </div>

      {/* Item Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {state.inventory
          .filter(item => (activeCategory === 'pokemart' ? item.price > 0 : !!item.shardPrice))
          .map(item => (
            <div
              key={item.id}
              className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-mono text-slate-400">Owned: {item.count}</span>
                </div>
                <h4 className="font-bold text-sm text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                {activeCategory === 'pokemart' ? (
                  <span className="text-xs font-mono font-bold text-emerald-400">₽{item.price.toLocaleString()}</span>
                ) : (
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Gem size={12} /> {item.shardPrice} Shards
                  </span>
                )}

                <button
                  onClick={() => buyItem(item, activeCategory === 'prismatic_bazaar')}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow transition-all"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
