import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { ShoppingBag, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { ASSET_ICONS } from '../../data/pokemonCatalog';

interface ShopTabProps {
  state: GameStateManager;
}

export const ShopTab: React.FC<ShopTabProps> = ({ state }) => {
  const [activeCategory, setActiveCategory] = useState<'orbs' | 'potions' | 'stones' | 'candies' | 'bazaar'>('orbs');
  const [feedback, setFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const buyItem = (itemId: string, useShards = false) => {
    const res = state.buyItem(itemId, useShards);
    showNotice(res.message, !res.success);
  };

  const showNotice = (msg: string, isError = false) => {
    setFeedback({ text: msg, isError });
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredItems = state.inventory.filter(item => {
    if (activeCategory === 'orbs') return item.category === 'orbs';
    if (activeCategory === 'potions') return item.category === 'potions';
    if (activeCategory === 'stones') return item.pocket === 'items' && item.id.startsWith('stone_');
    if (activeCategory === 'candies') return item.pocket === 'berries' || item.id.startsWith('m1') || item.id.startsWith('m2');
    if (activeCategory === 'bazaar') return !!item.shardPrice;
    return true;
  });

  return (
    <div className="space-y-4 font-pokemon-ds">
      {/* Category Toggle & Wallet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('orbs')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'orbs'
                ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.pokeBall} alt="Orbs" className="w-4 h-4 object-contain" />
            <span>Tallgrass Orbs</span>
          </button>

          <button
            onClick={() => setActiveCategory('potions')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'potions'
                ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.potion} alt="Potions" className="w-4 h-4 object-contain" />
            <span>Medicine</span>
          </button>

          <button
            onClick={() => setActiveCategory('stones')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'stones'
                ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/thunder-stone.png" alt="Stones" className="w-4 h-4 object-contain" />
            <span>Evolution Stones</span>
          </button>

          <button
            onClick={() => setActiveCategory('candies')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'candies'
                ? 'bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.rareCandy} alt="Candies" className="w-4 h-4 object-contain" />
            <span>Rare Candies</span>
          </button>

          <button
            onClick={() => setActiveCategory('bazaar')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeCategory === 'bazaar'
                ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-lg ring-1 ring-amber-400'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <img src={ASSET_ICONS.prismaticShard} alt="Shards" className="w-4 h-4 object-contain" />
            <span>Bazaar</span>
          </button>
        </div>

        {feedback && (
          <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 animate-bounce ${
            feedback.isError
              ? 'text-rose-400 bg-rose-950/80 border-rose-500/40'
              : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'
          }`}>
            {feedback.isError ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* Item Shelf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredItems.map(item => {
          const isBazaar = activeCategory === 'bazaar';
          const canAfford = isBazaar && item.shardPrice
            ? state.prismaticShards >= item.shardPrice
            : state.pokeDollars >= item.price;

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow" />
                  <span className="text-xs font-mono text-slate-200 font-bold bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    In Bag: {item.count}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white tracking-wide">{item.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                {item.catchMultiplier && (
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-lg border border-cyan-800/40">
                    Catch: {item.catchMultiplier >= 255 ? '100% Guaranteed' : `${item.catchMultiplier}x`}
                  </span>
                )}
                {item.usableOnPokemon && (
                  <span className="inline-block ml-1 mt-2 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                    Usable in Bag
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
                  onClick={() => buyItem(item.id, isBazaar && !!item.shardPrice)}
                  disabled={!canAfford}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                    !canAfford
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : isBazaar && item.shardPrice
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
