import React from 'react';
import { GameStateManager } from '../state/GameStateManager';
import { REGIONS_DATA, getPrismaticSpriteStyle, calculateTypeMultiplier, ASSET_ICONS } from '../data/pokemonCatalog';
import { Shield, Sparkles, AlertTriangle, Crosshair } from 'lucide-react';

interface MeadowBattlefieldProps {
  state: GameStateManager;
}

export const MeadowBattlefield: React.FC<MeadowBattlefieldProps> = ({ state }) => {
  const currentRegion = REGIONS_DATA[state.currentRegionIndex];
  const player = state.playerCombatant;
  const wild = state.wildCombatant;

  const playerStyle = player ? getPrismaticSpriteStyle(player.pokemon.prismaticTier) : null;
  const wildStyle = wild ? getPrismaticSpriteStyle(wild.pokemon.prismaticTier) : null;

  // Selected Capture Orb multiplier
  const selectedBall = state.inventory.find(i => i.id === state.selectedThrowingBall) || state.inventory[0];
  const catchOdds = wild ? state.calculateCatchOdds(wild, selectedBall.catchMultiplier || 1.0) : 0;

  // Check which moves risk knocking out the target
  const checkFinishingRisk = (movePower: number, moveType: any) => {
    if (!player || !wild) return false;
    const typeMult = calculateTypeMultiplier(moveType, wild.pokemon.types);
    const estDmg = Math.floor((((2 * player.pokemon.level / 5 + 2) * movePower * (player.pokemon.stats.atk / Math.max(1, wild.pokemon.stats.def))) / 50 + 2) * typeMult);
    return estDmg >= wild.currentHp;
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b ${currentRegion.bgGradient}`}>
      {/* Tallgrass Style Soft Patterned Meadow Ground */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-slate-950/20 to-slate-950/80" />

      {/* Attack Laser Beams SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        {state.attackBeams.map(beam => (
          <line
            key={beam.id}
            x1={`${beam.fromX}%`}
            y1={`${beam.fromY}%`}
            x2={`${beam.toX}%`}
            y2={`${beam.toY}%`}
            stroke={beam.color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="8 6"
            opacity={beam.life}
            className="animate-pulse"
          />
        ))}
      </svg>

      {/* Floating Damage & Action Text */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {state.floatingTexts.map(ft => (
          <div
            key={ft.id}
            className="absolute font-black font-mono transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
              opacity: ft.opacity,
              fontSize: '22px',
              textShadow: '0 0 12px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* TOP MEADOW HEADER: REGION & WALLET */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-start justify-between">
        <div className="flex items-center gap-3 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
          <img src={currentRegion.badgeIcon} alt="Badge" className="w-8 h-8 object-contain" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-wide text-white uppercase">
                {currentRegion.name} Meadow
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Wave #{state.waveNumber}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Dex #{currentRegion.dexRange[0]}-{currentRegion.dexRange[1]} • Lv. {currentRegion.levelRange[0]}-{currentRegion.levelRange[1]}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Poke-Dollars */}
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold shadow-lg">
            <img src={ASSET_ICONS.currencyCoin} alt="₽" className="w-4 h-4 object-contain" />
            <span className="text-white">₽{state.pokeDollars.toLocaleString()}</span>
          </div>

          {/* Prismatic Shards */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-amber-500/40 text-xs font-mono font-bold shadow-lg">
            <img src={ASSET_ICONS.prismaticShard} alt="💎" className="w-4 h-4 object-contain" />
            <span className="text-amber-300">{state.prismaticShards.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 1v1 ACTIVE MEADOW ARENA (CLEAN TALLGRASS PERSPECTIVE) */}
      <div className="absolute inset-0 pt-20 pb-52 pointer-events-none flex items-center justify-between px-8 md:px-24">
        {/* 1. PLAYER'S ACTIVE 1v1 BATTLER (LEFT SIDE) */}
        {player && (
          <div
            className="pointer-events-auto transition-transform duration-150 flex flex-col items-center"
            style={{
              transform: `translate(${player.lungeX + player.shakeX}px, 0)`,
            }}
          >
            {/* Overhead Battler Card */}
            <div className="bg-slate-950/90 backdrop-blur-xl p-2.5 rounded-xl border border-slate-700/80 shadow-2xl mb-2 min-w-[170px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-extrabold text-white truncate max-w-[100px]">{player.pokemon.speciesName}</span>
                <span className="font-mono text-cyan-400 font-bold text-[11px]">Lv.{player.pokemon.level}</span>
              </div>

              {/* HP Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/70">
                <div
                  className="h-full bg-emerald-500 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, (player.currentHp / player.maxHp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>HP: {player.currentHp}/{player.maxHp}</span>
                <span className="text-emerald-400 font-semibold">{player.pokemon.types.join('/')}</span>
              </div>
            </div>

            {/* Custom Prismatic Animated Sprite */}
            <div className={`relative ${playerStyle?.auraClass || ''}`}>
              <img
                src={player.pokemon.spriteUrl}
                alt={player.pokemon.speciesName}
                style={{ filter: playerStyle?.filterStyle || 'none' }}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = player.pokemon.artworkUrl;
                }}
              />
            </div>

            <div className="mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80 shadow">
              Active Partner
            </div>
          </div>
        )}

        {/* VS Label */}
        <div className="hidden sm:flex flex-col items-center opacity-40">
          <span className="text-xs font-black tracking-widest text-slate-500 uppercase">VS</span>
        </div>

        {/* 2. WILD 1v1 OPPONENT (RIGHT SIDE) */}
        {wild && (
          <div
            className="pointer-events-auto transition-transform duration-150 flex flex-col items-center group cursor-pointer"
            onClick={() => state.throwCaptureOrb()}
            style={{
              transform: `translate(${wild.lungeX + wild.shakeX}px, 0)`,
            }}
          >
            {/* Overhead Wild Info Card */}
            <div className="bg-slate-950/90 backdrop-blur-xl p-2.5 rounded-xl border border-slate-700/80 shadow-2xl mb-2 min-w-[170px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-extrabold truncate max-w-[100px] ${wild.pokemon.prismaticTier !== 'Standard' ? 'text-amber-400' : 'text-white'}`}>
                  {wild.pokemon.speciesName}
                </span>
                <span className="font-mono text-amber-400 font-bold text-[11px]">Lv.{wild.pokemon.level}</span>
              </div>

              {/* Wild HP Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/70">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${wild.currentHp <= wild.maxHp * 0.25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.max(0, (wild.currentHp / wild.maxHp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>HP: {wild.currentHp}/{wild.maxHp}</span>
                <span className={`px-1.5 py-0.2 rounded font-bold ${wildStyle?.badgeClass || 'text-slate-400'}`}>
                  {wild.pokemon.prismaticTier}
                </span>
              </div>
            </div>

            {/* Custom Prismatic Animated Sprite for Wild Encounter */}
            <div className={`relative ${wildStyle?.auraClass || ''}`}>
              <img
                src={wild.pokemon.spriteUrl}
                alt={wild.pokemon.speciesName}
                style={{ filter: wildStyle?.filterStyle || 'none' }}
                className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = wild.pokemon.artworkUrl;
                }}
              />
            </div>

            {/* Live Catch Odds Indicator */}
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 shadow">
              <Crosshair size={11} />
              <span>Catch Odds: {catchOdds}%</span>
            </div>
          </div>
        )}
      </div>

      {/* TALLGRASS BOTTOM BATTLE COMMAND CENTER (Gentle Tap, Finishing Risk Flags, Orbs) */}
      <div className="absolute bottom-28 left-4 right-4 z-30 pointer-events-auto max-w-4xl mx-auto bg-slate-950/95 backdrop-blur-2xl p-3 rounded-2xl border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 1. ATTACK MOVES (WITH GENTLE TAP & FINISHING RISK FLAGS) */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5">
            <span>Partner Attacks</span>
            <span className="text-amber-400 font-normal normal-case flex items-center gap-1">
              <Sparkles size={11} /> Gentle Tap guarantees leaving target at ≥ 1 HP!
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {player?.pokemon.moves.map(move => {
              const risksKO = !move.isGentleTap && checkFinishingRisk(move.power, move.type);
              const typeMult = wild ? calculateTypeMultiplier(move.type, wild.pokemon.types) : 1.0;
              return (
                <button
                  key={move.id}
                  onClick={() => {
                    if (player && wild) state.executeTallgrassMove(player, wild, move);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    move.isGentleTap
                      ? 'bg-emerald-950/50 border-emerald-500/60 hover:bg-emerald-900/40 text-emerald-300'
                      : risksKO
                      ? 'bg-rose-950/40 border-rose-500/60 hover:bg-rose-900/30 text-rose-200'
                      : 'bg-slate-900/90 border-slate-700/80 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{move.name}</span>
                    {risksKO && (
                      <span className="text-[9px] bg-red-600/80 text-white font-extrabold px-1 rounded flex items-center gap-0.5" title="Risks knocking out wild Pokémon!">
                        <AlertTriangle size={9} /> KO RISK
                      </span>
                    )}
                    {move.isGentleTap && (
                      <span className="text-[9px] bg-emerald-600/80 text-white font-extrabold px-1 rounded">
                        SAFE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>{move.type} • Pwr {move.power}</span>
                    {typeMult > 1.0 && <span className="text-amber-400 font-bold">{typeMult}x</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. TALLGRASS CAPTURE ORBS THROW DRAWER */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800/80 md:pl-3">
          <div className="flex items-center gap-1.5">
            {state.inventory
              .filter(i => i.category === 'balls')
              .map(orb => {
                const isSelected = state.selectedThrowingBall === orb.id;
                return (
                  <button
                    key={orb.id}
                    onClick={() => {
                      state.selectedThrowingBall = orb.id;
                      state.notify();
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title={`${orb.name} (Owned: ${orb.count})`}
                  >
                    <img src={orb.icon} alt={orb.name} className="w-4 h-4 object-contain" />
                    <span>{orb.count}</span>
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => state.throwCaptureOrb()}
            disabled={!wild || wild.currentHp <= 0 || (selectedBall.count <= 0)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-red-950/50 transition-all uppercase tracking-wider"
          >
            <img src={selectedBall.icon} alt="Throw" className="w-4 h-4 object-contain" />
            <span>Throw Orb ({catchOdds}%)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
