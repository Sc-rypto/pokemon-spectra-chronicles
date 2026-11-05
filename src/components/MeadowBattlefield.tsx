import React from 'react';
import { GameStateManager } from '../state/GameStateManager';
import { REGIONS_DATA, getPrismaticSpriteStyle, ASSET_ICONS } from '../data/pokemonCatalog';
import { Shield, Sparkles } from 'lucide-react';

interface MeadowBattlefieldProps {
  state: GameStateManager;
}

export const MeadowBattlefield: React.FC<MeadowBattlefieldProps> = ({ state }) => {
  const currentRegion = REGIONS_DATA[state.currentRegionIndex];
  const player = state.playerCombatant;
  const wild = state.wildCombatant;

  const playerStyle = player ? getPrismaticSpriteStyle(player.pokemon.prismaticTier) : null;
  const wildStyle = wild ? getPrismaticSpriteStyle(wild.pokemon.prismaticTier) : null;

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b ${currentRegion.bgGradient}`}>
      {/* Tallgrass Style Soft Patterned Meadow Ground */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:28px_28px]" />

      {/* Atmospheric Region Lighting Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-slate-950/20 to-slate-950/80" />

      {/* Attack Beams SVG */}
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

      {/* Top Tallgrass Meadow Header: Region, Currency, Quick Catch */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-start justify-between">
        {/* Region & Wave Info */}
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

        {/* Real Player Economy & Catch Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Poke-Dollars */}
          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold shadow-lg">
            <img src={ASSET_ICONS.currencyCoin} alt="₽" className="w-4 h-4 object-contain" />
            <span className="text-white">₽{state.pokeDollars.toLocaleString()}</span>
          </div>

          {/* Prismatic Shards */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-amber-500/40 text-xs font-mono font-bold shadow-lg">
            <img src={ASSET_ICONS.prismaticShard} alt="Shards" className="w-4 h-4 object-contain" />
            <span className="text-amber-300">{state.prismaticShards.toLocaleString()}</span>
          </div>

          {/* Manual Catch Button with PokeBall Sprite Icon */}
          <button
            onClick={() => state.manualThrowBall('b1')}
            disabled={!wild || wild.currentHp <= 0}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-950/40 transition-all disabled:opacity-50"
            title="Throw Poké Ball at wild encounter"
          >
            <img src={ASSET_ICONS.pokeBall} alt="Ball" className="w-4 h-4 object-contain animate-spin-slow" />
            <span>Catch ({state.inventory.find(i => i.id === 'b1')?.count || 0})</span>
          </button>
        </div>
      </div>

      {/* 1v1 ACTIVE MEADOW ARENA (CLEAN TALLGRASS PERSPECTIVE) */}
      <div className="absolute inset-0 pt-20 pb-40 pointer-events-none flex items-center justify-between px-12 md:px-28">
        {/* 1. PLAYER'S ACTIVE 1v1 BATTLER (LEFT SIDE) */}
        {player && (
          <div
            className="pointer-events-auto transition-transform duration-150 flex flex-col items-center"
            style={{
              transform: `translate(${player.lungeX + player.shakeX}px, 0)`,
            }}
          >
            {/* Overhead Clean Battler Card (Tallgrass Style) */}
            <div className="bg-slate-950/90 backdrop-blur-xl p-2.5 rounded-xl border border-slate-700/80 shadow-2xl mb-3 min-w-[170px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-white truncate max-w-[100px]">{player.pokemon.speciesName}</span>
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
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = player.pokemon.artworkUrl;
                }}
              />
            </div>

            {/* Battler Slot Badge */}
            <div className="mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/80 shadow">
              Your Active Battler
            </div>
          </div>
        )}

        {/* VS Central Badge */}
        <div className="hidden sm:flex flex-col items-center opacity-60">
          <span className="text-xs font-black tracking-widest text-slate-500 uppercase">VS</span>
        </div>

        {/* 2. WILD 1v1 OPPONENT (RIGHT SIDE) */}
        {wild && (
          <div
            className="pointer-events-auto transition-transform duration-150 flex flex-col items-center group cursor-pointer"
            onClick={() => state.manualThrowBall('b1')}
            style={{
              transform: `translate(${wild.lungeX + wild.shakeX}px, 0)`,
            }}
          >
            {/* Overhead Wild Info Card */}
            <div className="bg-slate-950/90 backdrop-blur-xl p-2.5 rounded-xl border border-slate-700/80 shadow-2xl mb-3 min-w-[170px]">
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span className={`font-extrabold truncate max-w-[100px] ${wild.pokemon.prismaticTier !== 'Standard' ? 'text-amber-400' : 'text-white'}`}>
                    {wild.pokemon.speciesName}
                  </span>
                </div>
                <span className="font-mono text-amber-400 font-bold text-[11px]">Lv.{wild.pokemon.level}</span>
              </div>

              {/* Wild HP Bar */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/70">
                <div
                  className="h-full bg-rose-500 transition-all duration-200 rounded-full"
                  style={{ width: `${Math.max(0, (wild.currentHp / wild.maxHp) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>HP: {wild.currentHp}/{wild.maxHp}</span>
                <span className={`px-1.5 py-0.2 rounded ${wildStyle?.badgeClass || 'text-slate-400'}`}>
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
                className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = wild.pokemon.artworkUrl;
                }}
              />
            </div>

            {/* Tap to Catch Prompt */}
            <div className="mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow group-hover:bg-rose-600 group-hover:text-white transition-all">
              Wild Encounter (Tap to Catch)
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
