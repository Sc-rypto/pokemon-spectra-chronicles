import React, { useState } from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { Users, Shuffle, Globe, Trophy, Swords, Sparkles, ArrowRight } from 'lucide-react';
import { SPECIES_CATALOG, createPokemonInstance } from '../../data/pokemonCatalog';

interface SocialHubTabProps {
  state: GameStateManager;
}

export const SocialHubTab: React.FC<SocialHubTabProps> = ({ state }) => {
  const [activeSubTab, setActiveSubTab] = useState<'gts' | 'wonder_rift' | 'raid' | 'leaderboards'>('gts');
  const [wonderTradeStatus, setWonderTradeStatus] = useState<string | null>(null);

  // Trigger Wonder Trade Rift
  const handleWonderTrade = () => {
    if (state.pcBox.length === 0) {
      setWonderTradeStatus('You need at least 1 Pokémon in your PC Box to offer into the Rift!');
      return;
    }

    setWonderTradeStatus('Transmitting Pokémon through the Wonder Rift Dimensional Void...');
    setTimeout(() => {
      // Pick random incoming species
      const randomSpecies = SPECIES_CATALOG[Math.floor(Math.random() * SPECIES_CATALOG.length)];
      const incoming = createPokemonInstance(randomSpecies, 50 + Math.floor(Math.random() * 40));
      state.pcBox.push(incoming);
      setWonderTradeStatus(`Rift Trade Complete! Received a Lv. ${incoming.level} ${incoming.speciesName} (${incoming.prismaticTier})!`);
      state.sync3DScene();
    }, 1400);
  };

  return (
    <div className="tab-pane-content space-y-4">
      {/* Sub-tab selection */}
      <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab('gts')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'gts' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Globe size={14} /> GTS & Auction House
        </button>

        <button
          onClick={() => setActiveSubTab('wonder_rift')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'wonder_rift' ? 'bg-purple-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Shuffle size={14} /> Wonder Trade Rift
        </button>

        <button
          onClick={() => setActiveSubTab('raid')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'raid' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Swords size={14} /> 4-Player Co-Op Raid
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboards')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeSubTab === 'leaderboards' ? 'bg-amber-600 text-white shadow' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <Trophy size={14} /> Global Leaderboard
        </button>
      </div>

      {/* 1. Global Trade Station (GTS) */}
      {activeSubTab === 'gts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Network Listings (Synchronized via P2P Distributed Ledgers)</span>
            <span>Total Available: {state.gtsListings.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.gtsListings.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow"
                    style={{ backgroundColor: item.pokemon.primaryColor }}
                  >
                    {item.pokemon.speciesName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.pokemon.speciesName}</span>
                      <span className="text-[10px] font-mono text-cyan-400">Lv. {item.pokemon.level}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tier: <span className="text-amber-400 font-semibold">{item.pokemon.prismaticTier}</span> • Seller: {item.sellerName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-white mb-1">
                    {item.currency === 'dollars' ? `₽${item.price.toLocaleString()}` : `${item.price} 💎`}
                  </div>
                  <button
                    onClick={() => {
                      state.pcBox.push(item.pokemon);
                      state.gtsListings = state.gtsListings.filter(l => l.id !== item.id);
                      state.addLog(`Purchased ${item.pokemon.speciesName} from GTS!`, 'catch');
                      state.sync3DScene();
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold shadow"
                  >
                    Buy Listing
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Wonder Trade Rift */}
      {activeSubTab === 'wonder_rift' && (
        <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-3xl animate-pulse">
            🌀
          </div>

          <div>
            <h3 className="font-bold text-lg text-white">Wonder Trade Rift Portal</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Cast a Pokémon into the inter-dimensional rift to instantly receive an asynchronous mystery Pokémon from other trainers across regions!
            </p>
          </div>

          <button
            onClick={handleWonderTrade}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Offer Mystery Trade
          </button>

          {wonderTradeStatus && (
            <div className="text-xs font-mono text-purple-300 bg-purple-950/40 p-3 rounded-lg border border-purple-800/40 max-w-md mx-auto">
              {wonderTradeStatus}
            </div>
          )}
        </div>
      )}

      {/* 3. 4-Player Co-Op Overworld Raid */}
      {activeSubTab === 'raid' && (
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-rose-600 text-white">
                  {state.activeRaid.tier} RAID
                </span>
                <h3 className="font-bold text-white text-base">{state.activeRaid.name}</h3>
                <span className="text-xs font-mono text-amber-400 font-bold">Lv. {state.activeRaid.level}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Shared Global Boss Health • Remaining Time: {state.activeRaid.timeRemainingSeconds}s
              </div>
            </div>

            <button
              onClick={() => {
                const dmg = 8500 + Math.floor(Math.random() * 5000);
                state.activeRaid.currentHp = Math.max(0, state.activeRaid.currentHp - dmg);
                const playerEntry = state.activeRaid.participants.find(p => p.id === 'p4');
                if (playerEntry) playerEntry.damageDealt += dmg;
                state.prismaticShards += 25;
                state.addLog(`⚔️ Dealt ${dmg.toLocaleString()} Raid damage to ${state.activeRaid.name}!`, 'damage');
                state.sync3DScene();
              }}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-red-950/40"
            >
              Strike Boss (Co-Op)
            </button>
          </div>

          {/* Boss HP Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-slate-400">Boss Health</span>
              <span className="text-rose-400 font-bold">
                {state.activeRaid.currentHp.toLocaleString()} / {state.activeRaid.maxHp.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(state.activeRaid.currentHp / state.activeRaid.maxHp) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 Raid Party Members */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {state.activeRaid.participants.map(p => (
              <div key={p.id} className="p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-center gap-2">
                <span className="text-xl">{p.avatarUrl}</span>
                <div className="truncate">
                  <div className="font-bold text-xs text-white truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {p.damageDealt.toLocaleString()} DMG
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Global Leaderboards */}
      {activeSubTab === 'leaderboards' && (
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              Global Prismatic Collection Standings
            </h4>
            <span className="text-xs text-slate-400 font-mono">Top 5 Trainers</span>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { rank: 1, name: 'Ash_Ketchum_Prime', region: 'Kanto', score: '92 Supernovas', medal: '🥇' },
              { rank: 2, name: 'Cynthia_Sinnoh', region: 'Sinnoh', score: '78 Supernovas', medal: '🥈' },
              { rank: 3, name: 'Steven_Devon', region: 'Hoenn', score: '64 Supernovas', medal: '🥉' },
              { rank: 4, name: 'You (Player)', region: 'Paldea Continuum', score: `${state.prismaticLog.length + 5} Prismatic Variants`, medal: '🎖️' },
              { rank: 5, name: 'Leon_Galar', region: 'Galar', score: '51 Supernovas', medal: '⭐' },
            ].map(row => (
              <div
                key={row.rank}
                className="p-2.5 bg-slate-800/60 rounded-lg flex items-center justify-between border border-slate-700/40"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{row.medal}</span>
                  <div>
                    <span className="font-bold text-white block">{row.name}</span>
                    <span className="text-[10px] text-slate-400">{row.region}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-amber-400">{row.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
