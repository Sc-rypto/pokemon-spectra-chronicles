import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { ShoppingBag, Sparkles, Gem } from 'lucide-react';
import { ASSET_ICONS } from '../../data/pokemonCatalog';

interface ShopTabProps {
  state: GameStateManager;
}

export const ShopTab: React.FC<ShopTabProps> = ({ state }) => {
  const [activeCategory, setActiveCategory] = useState<'pokemart' | 'prismatic_bazaar'>('pokemart');
  const [feedback, setFeedback] = useState<string | null>(null);

  const buyItem = (item: any, useShards = false) => {
    if (useShards) {
      if (state.prismaticShards >= (item.shardPrice || 0)) {
        state.prismaticShards -= item.shardPrice;
        item.count++;
        showNotice(`Purchased ${item.name}!`);
      } else {
        showNotice('Not enough Prismatic Shards!');
      }
    } else {
      if (state.pokeDollars >= item.price) {
        state.pokeDollars -= item.price;
        item.count++;
        showNotice(`Purchased ${item.name}!`);
      } else {
        showNotice('Not enough Poké-Dollars!');
      }
    }
    state.notify();
  };

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Category Toggle & Wallet */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('pokemart')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'pokemart'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShoppingBag size={15} /> PokéMart
          </button>

          <button
            onClick={() => setActiveCategory('prismatic_bazaar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'prismatic_bazaar'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={15} /> Prismatic Shard Bazaar
          </button>
        </div>

        {feedback && (
          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            {feedback}
          </div>
        )}
      </div>

      {/* Item Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {state.inventory
          .filter(item => (activeCategory === 'pokemart' ? item.price > 0 : !!item.shardPrice))
          .map(item => (
            <div
              key={item.id}
              className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain" />
                  <span className="text-xs font-mono text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    Owned: {item.count}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {activeCategory === 'pokemart' ? (
                  <span className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1">
                    <img src={ASSET_ICONS.currencyCoin} alt="₽" className="w-3.5 h-3.5 object-contain" />
                    ₽{item.price.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-xs font-mono font-black text-amber-400 flex items-center gap-1">
                    <img src={ASSET_ICONS.prismaticShard} alt="💎" className="w-3.5 h-3.5 object-contain" />
                    {item.shardPrice} Shards
                  </span>
                )}

                <button
                  onClick={() => buyItem(item, activeCategory === 'prismatic_bazaar')}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-all"
                >
                  Purchase
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
