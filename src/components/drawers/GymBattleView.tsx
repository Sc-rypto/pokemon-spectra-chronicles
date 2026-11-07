import React from 'react';
import { GameStateManager } from '../../state/GameStateManager';
import { calculateTypeMultiplier, TYPE_PALETTES } from '../../data/pokemonCatalog';
import { getGymLeaderSprite } from '../../data/gymLeaderSprites';
import { X, Award, ChevronRight, Swords } from 'lucide-react';

interface GymBattleViewProps {
  state: GameStateManager;
}

export const GymBattleView: React.FC<GymBattleViewProps> = ({ state }) => {
  const session = state.activeGymBattle;
  if (!session) return null;

  const currentGym = session.gymLeader;
  const currentLeaderPokemon = currentGym.party[session.leaderCurrentPokemonIdx];
  const currentPlayerPokemon = state.squad[session.trainerCurrentPokemonIdx] || state.squad[0];

  const leaderHpPercent = Math.max(0, (session.leaderCurrentHp / Math.max(1, session.leaderMaxHp)) * 100);
  const playerHpPercent = Math.max(0, (session.playerCurrentHp / Math.max(1, session.playerMaxHp)) * 100);

  const leaderSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${currentLeaderPokemon.dex}.gif`;
  const leaderArtwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${currentLeaderPokemon.dex}.png`;
  const trainerSprite = getGymLeaderSprite(currentGym.name);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-3 md:p-6 overflow-hidden animate-fadeIn select-none">
      {/* Top Header: Gym Leader & City Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <img src={currentGym.badgeIcon} alt={currentGym.badgeName} className="w-10 h-10 object-contain drop-shadow" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Official Gym Match
              </span>
              <span className="text-xs text-slate-400 font-bold">{currentGym.cityName}</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-white">
              Gym Leader {currentGym.name}
            </h2>
          </div>
        </div>

        {session.turnPhase !== 'victory' && (
          <button
            onClick={() => state.forfeitGymBattle()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <X size={14} /> Forfeit
          </button>
        )}
      </div>

      {/* INTRO SCREEN: Authentic Gym Leader Sprite & Challenge Dialogue */}
      {session.turnPhase === 'intro' ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6 max-w-xl mx-auto text-center">
          <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2.5s' }}>
            <img
              src={trainerSprite}
              alt={currentGym.name}
              className="w-36 h-36 md:w-48 md:h-48 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://play.pokemonshowdown.com/sprites/trainers/brock.png';
              }}
            />
            <div className="w-28 h-3 bg-black/50 rounded-[100%] blur-sm -mt-2" />
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Gym Leader Challenge
            </span>
            <p className="text-sm md:text-base text-white font-mono leading-relaxed">
              "I am {currentGym.name}, the Gym Leader of {currentGym.cityName}! Let's see if you and your Pokémon have what it takes to earn the {currentGym.badgeName}!"
            </p>
          </div>

          <button
            onClick={() => state.advanceGymIntro()}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-950/60 flex items-center gap-2 transition-all cursor-pointer animate-pulse"
          >
            <Swords size={18} />
            <span>Engage Battle!</span>
          </button>
        </div>
      ) : (
        /* MAIN BATTLE ARENA (SPLIT OPPONENT TOP-RIGHT / PLAYER BOTTOM-LEFT) */
        <div className="flex-1 relative flex flex-col justify-around py-2 max-w-4xl mx-auto w-full overflow-hidden">
          {/* 1. OPPONENT GYM LEADER & POKÉMON (TOP RIGHT) */}
          <div className="flex items-start justify-end gap-4 md:gap-8 w-full">
            {/* Opponent Status HUD */}
            <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl min-w-[210px] md:min-w-[260px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-black text-white text-sm">{currentLeaderPokemon.name}</span>
                <span className="font-mono text-amber-400 font-bold">Lv.{currentLeaderPokemon.level}</span>
              </div>

              {/* HP Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 my-1">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    leaderHpPercent > 50 ? 'bg-emerald-500' : leaderHpPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${leaderHpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>HP: {session.leaderCurrentHp}/{session.leaderMaxHp}</span>
                <div className="flex gap-1">
                  {currentGym.party.map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        pIdx < session.leaderCurrentPokemonIdx
                          ? 'bg-slate-700 border-slate-600'
                          : pIdx === session.leaderCurrentPokemonIdx
                          ? 'bg-rose-500 border-rose-400 animate-pulse'
                          : 'bg-emerald-500 border-emerald-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Opponent Animated Sprite */}
            <div className="flex flex-col items-center">
              <img
                src={leaderSprite}
                alt={currentLeaderPokemon.name}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)] animate-bounce"
                style={{ animationDuration: '3s' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = leaderArtwork;
                }}
              />
              <div className="w-20 h-3 bg-black/40 rounded-[100%] blur-sm -mt-2" />
            </div>
          </div>

          {/* 2. PLAYER'S POKÉMON (BOTTOM LEFT) */}
          <div className="flex items-end justify-start gap-4 md:gap-8 w-full">
            {/* Player Animated Sprite */}
            <div className="flex flex-col items-center">
              <img
                src={currentPlayerPokemon.spriteUrl}
                alt={currentPlayerPokemon.speciesName}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = currentPlayerPokemon.artworkUrl;
                }}
              />
              <div className="w-20 h-3 bg-black/40 rounded-[100%] blur-sm -mt-2" />
            </div>

            {/* Player Status HUD */}
            <div className="bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl min-w-[210px] md:min-w-[260px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-black text-white text-sm">{currentPlayerPokemon.speciesName}</span>
                <span className="font-mono text-cyan-400 font-bold">Lv.{currentPlayerPokemon.level}</span>
              </div>

              {/* HP Bar */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 my-1">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    playerHpPercent > 50 ? 'bg-emerald-500' : playerHpPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${playerHpPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>HP: {session.playerCurrentHp}/{session.playerMaxHp}</span>
                <div className="flex gap-1">
                  {state.squad.map((_, pIdx) => (
                    <div
                      key={pIdx}
                      className={`w-2.5 h-2.5 rounded-full border ${
                        pIdx < session.trainerCurrentPokemonIdx
                          ? 'bg-slate-700 border-slate-600'
                          : pIdx === session.trainerCurrentPokemonIdx
                          ? 'bg-cyan-500 border-cyan-400 animate-pulse'
                          : 'bg-emerald-500 border-emerald-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM ACTION / DIALOGUE PANEL (Fixed Proportions) */}
      {session.turnPhase !== 'intro' && (
        <div className="bg-slate-900 p-3 md:p-5 rounded-3xl border border-slate-800 shadow-2xl max-w-4xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Authentic Pokémon Dialogue Box */}
          <div className="flex-1 w-full bg-slate-950 p-3.5 rounded-2xl border border-slate-800 min-h-[68px] flex items-center">
            <p className="text-white font-mono text-xs md:text-sm leading-relaxed">
              {session.battleDialog}
            </p>
          </div>

          {/* Action Commands or Victory Modal */}
          <div className="w-full md:w-auto shrink-0">
            {session.turnPhase === 'player_choose' && (
              <div className="grid grid-cols-2 gap-2">
                {currentPlayerPokemon.moves.map(m => {
                  const typeMult = calculateTypeMultiplier(m.type, currentLeaderPokemon.types);
                  return (
                    <button
                      key={m.id}
                      onClick={() => state.executeGymBattleTurn(m)}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left rounded-xl transition-all flex flex-col justify-between cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs">{m.name}</span>
                        {typeMult >= 2.0 && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-bold">2x</span>}
                        {typeMult <= 0.5 && typeMult > 0 && <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">0.5x</span>}
                        {typeMult === 0 && <span className="text-[9px] bg-slate-800 text-slate-500 px-1 rounded">0x</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">{m.type} • Pwr {m.power}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {session.turnPhase === 'victory' && (
              <button
                onClick={() => state.claimGymVictory()}
                className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-950/60 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Award size={16} />
                <span>Claim {currentGym.badgeName} & Victory!</span>
              </button>
            )}

            {session.turnPhase === 'defeat' && (
              <button
                onClick={() => state.forfeitGymBattle()}
                className="w-full md:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-rose-950/60 uppercase tracking-wider cursor-pointer"
              >
                Return to Meadow
              </button>
            )}

            {(session.turnPhase === 'player_attack' || session.turnPhase === 'leader_attack') && (
              <div className="text-slate-400 font-mono text-xs animate-pulse py-2 px-4 text-center">
                Processing turn...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
