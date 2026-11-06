import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { ASSET_ICONS } from '../../data/pokemonCatalog';

interface ShopTabProps {
  state: GameStateManager;
}

export const ShopTab: React.FC<ShopTabProps> = ({ state }) => {
  const [activeCategory, setActiveCategory] = useState<'orbs' | 'potions' | 'bazaar'>('orbs');
  const [feedback, setFeedback] = useState<string | null>(null);

  const buyItem = (item: any, useShards = false) => {
    if (useShards) {
      if (state.prismaticShards >= (item.shardPrice || 0)) {
        state.prismaticShards -= item.shardPrice;
        item.count++;
        showNotice(`Purchased 1x ${item.name}!`);
      } else {
        showNotice('Not enough Prismatic Shards!');
      }
    } else {
      if (state.pokeDollars >= item.price) {
        state.pokeDollars -= item.price;
        item.count++;
        showNotice(`Purchased 1x ${item.name}!`);
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

  const filteredItems = state.inventory.filter(item => {
    if (activeCategory === 'orbs') return item.category === 'orbs';
    if (activeCategory === 'potions') return item.category === 'potions';
    if (activeCategory === 'bazaar') return !!item.shardPrice;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Category Toggle & Wallet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory('orbs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'orbs'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.pokeBall} alt="Orbs" className="w-4 h-4 object-contain" />
            <span>Tallgrass Orbs</span>
          </button>

          <button
            onClick={() => setActiveCategory('potions')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'potions'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.potion} alt="Potions" className="w-4 h-4 object-contain" />
            <span>Medicine & Potions</span>
          </button>

          <button
            onClick={() => setActiveCategory('bazaar')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeCategory === 'bazaar'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.prismaticShard} alt="Shards" className="w-4 h-4 object-contain" />
            <span>Prismatic Bazaar</span>
          </button>
        </div>

        {feedback && (
          <div className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 animate-fade">
            {feedback}
          </div>
        )}
      </div>

      {/* Item Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          const isBazaar = activeCategory === 'bazaar';
          return (
            <div
              key={item.id}
              className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow" />
                  <span className="text-xs font-mono text-slate-300 font-bold bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    Owned: {item.count}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                {item.catchMultiplier && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                    Catch Multiplier: {item.catchMultiplier >= 255 ? 'Guaranteed (100%)' : `${item.catchMultiplier}x`}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {isBazaar && item.shardPrice ? (
                  <span className="text-xs font-mono font-black text-amber-300 flex items-center gap-1.5">
                    <img src={ASSET_ICONS.prismaticShard} alt="💎" className="w-4 h-4 object-contain" />
                    {item.shardPrice} Shards
                  </span>
                ) : (
                  <span className="text-xs font-mono font-black text-emerald-400 flex items-center gap-1.5">
                    <img src={ASSET_ICONS.currencyCoin} alt="₽" className="w-4 h-4 object-contain" />
                    ₽{item.price.toLocaleString()}
                  </span>
                )}

                <button
                  onClick={() => buyItem(item, isBazaar && !!item.shardPrice)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
                    isBazaar && item.shardPrice
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  Buy 1x
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
