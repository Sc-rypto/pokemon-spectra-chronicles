import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { Globe, Swords, ArrowRightLeft, ShieldAlert, Sparkles, Tag, X } from 'lucide-react';

interface SocialHubTabProps {
  state: GameStateManager;
}

export const SocialHubTab: React.FC<SocialHubTabProps> = ({ state }) => {
  const [activeSubTab, setActiveSubTab] = useState<'raid' | 'market' | 'box_sell'>('raid');
  const [listingPrice, setListingPrice] = useState<number>(500);
  const [listingCurrency, setListingCurrency] = useState<'dollars' | 'shards'>('dollars');
  const [selectedBoxIdx, setSelectedBoxIdx] = useState<number>(0);

  const raid = state.activeRaid;
  const raidHpPercent = Math.max(0, (raid.currentHp / raid.maxHp) * 100);

  return (
    <div className="tab-pane-content space-y-4">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('raid')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'raid' ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-lg' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Swords size={15} /> Playable Overworld Raid Boss
        </button>

        <button
          onClick={() => setActiveSubTab('market')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'market' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Globe size={15} /> Player Market ({state.marketListings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('box_sell')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'box_sell' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Tag size={15} /> Sell from PC Box
        </button>
      </div>

      {/* 1. 100% PLAYABLE OVERWORLD RAID BOSS */}
      {activeSubTab === 'raid' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={raid.spriteUrl}
                alt={raid.name}
                className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_#f59e0b] animate-pulse"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = raid.artworkUrl;
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {raid.tier}
                  </span>
                  <h3 className="font-extrabold text-white text-lg">{raid.name}</h3>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Element: <span className="text-purple-400 font-bold">{raid.element}</span> • Level: <span className="text-amber-400 font-bold">{raid.level}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Your Total Damage Dealt: <span className="text-emerald-400 font-mono font-bold">{raid.totalDamageDealt.toLocaleString()} DMG</span>
                </div>
              </div>
            </div>

            {/* Attack Raid Boss Button */}
            <button
              onClick={() => state.strikeRaidBoss()}
              className="px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-red-950/50 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Swords size={18} /> Strike Raid Boss!
            </button>
          </div>

          {/* Real-time Boss HP Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400 font-bold">Raid Boss Global Health</span>
              <span className="text-rose-400 font-bold">
                {raid.currentHp.toLocaleString()} / {raid.maxHp.toLocaleString()} ({raidHpPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden border border-slate-700 shadow-inner">
              <div
                className="bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 h-full rounded-full transition-all duration-200"
                style={{ width: `${raidHpPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
            💡 <strong className="text-white">Live Economy Rewards:</strong> Every hit against the Raid Boss pays out instant Poké-Dollars & Prismatic Shards directly to your wallet! Defeating the boss awards a massive +5,000 Shards jackpot.
          </div>
        </div>
      )}

      {/* 2. REAL PLAYER-ONLY MARKETPLACE (ZERO FAKE BOTS) */}
      {activeSubTab === 'market' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Verified Player Listings (All items listed by real trainers)</span>
            <span>Total Active: {state.marketListings.length}</span>
          </div>

          {state.marketListings.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
              <div className="text-3xl mb-2">🏪</div>
              <h4 className="font-bold text-white text-sm">No Active Player Listings</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No fake bots are allowed! List duplicate Pokémon from your PC Box under "Sell from PC Box" to trade with other trainers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.marketListings.map(listing => (
                <div
                  key={listing.id}
                  className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={listing.pokemon.spriteUrl}
                      alt={listing.pokemon.speciesName}
                      className="w-14 h-14 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = listing.pokemon.artworkUrl;
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{listing.pokemon.speciesName}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">Lv.{listing.pokemon.level}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Seller: <span className="text-slate-300 font-semibold">{listing.sellerTrainerName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-emerald-400 mb-1">
                      {listing.currency === 'dollars' ? `₽${listing.price.toLocaleString()}` : `${listing.price} 💎`}
                    </div>
                    {listing.isPlayerListing ? (
                      <button
                        onClick={() => state.cancelMarketListing(listing.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded text-[11px] font-semibold border border-rose-900/50"
                      >
                        Cancel Listing
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (listing.currency === 'dollars' && state.pokeDollars >= listing.price) {
                            state.pokeDollars -= listing.price;
                            state.pcBox.push(listing.pokemon);
                            state.marketListings = state.marketListings.filter(l => l.id !== listing.id);
                            state.addLog(`Purchased ${listing.pokemon.speciesName} for ₽${listing.price.toLocaleString()}!`, 'catch');
                          }
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold shadow"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SELL REAL POKEMON FROM PC BOX */}
      {activeSubTab === 'box_sell' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h4 className="font-bold text-white text-sm">Sell Pokémon from your PC Box to the Economy</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose a Pokémon from your PC Box to list on the Global Market for other trainers to purchase.
            </p>
          </div>

          {state.pcBox.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl">
              Your PC Box is empty. Catch wild Pokémon in the Meadow to list them here!
            </div>
          ) : (
            <div className="space-y-4">
              {/* PC Box Grid Picker */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                {state.pcBox.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedBoxIdx(idx)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      selectedBoxIdx === idx
                        ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={p.spriteUrl}
                      alt={p.speciesName}
                      className="w-12 h-12 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = p.artworkUrl;
                      }}
                    />
                    <div className="font-bold text-[11px] truncate">{p.speciesName}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">Lv.{p.level}</div>
                  </button>
                ))}
              </div>

              {/* Price & Currency Config */}
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Set Price:</label>
                    <input
                      type="number"
                      min={100}
                      max={1000000}
                      value={listingPrice}
                      onChange={(e) => setListingPrice(Math.max(10, parseInt(e.target.value) || 100))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-28"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Currency:</label>
                    <select
                      value={listingCurrency}
                      onChange={(e) => setListingCurrency(e.target.value as any)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="dollars">Poké-Dollars (₽)</option>
                      <option value="shards">Prismatic Shards (💎)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => {
                    state.listPokemonOnMarket(selectedBoxIdx, listingPrice, listingCurrency);
                    setSelectedBoxIdx(0);
                    setActiveSubTab('market');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  Create Listing
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
