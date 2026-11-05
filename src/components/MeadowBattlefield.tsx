import React from 'react';
import { GameStateManager } from '../state/GameStateManager';
import { REGIONS_DATA } from '../data/pokemonCatalog';
import { Sparkles, Swords, Flame, Heart } from 'lucide-react';

interface MeadowBattlefieldProps {
  state: GameStateManager;
}

export const MeadowBattlefield: React.FC<MeadowBattlefieldProps> = ({ state }) => {
  const currentRegion = REGIONS_DATA[state.currentRegionIndex];

  const getTierAura = (tier: string) => {
    switch (tier) {
      case 'Supernova':
        return 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.85)] filter drop-shadow-[0_0_12px_#f59e0b] animate-pulse';
      case 'Ethereal':
        return 'ring-2 ring-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.8)] filter drop-shadow-[0_0_10px_#06b6d4] opacity-90';
      case 'Radiant':
        return 'ring-2 ring-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.8)] filter drop-shadow-[0_0_8px_#10b981]';
      case 'Shiny':
        return 'ring-2 ring-yellow-300 shadow-[0_0_14px_rgba(234,179,8,0.7)]';
      default:
        return 'hover:brightness-110';
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b ${currentRegion.bgGradient}`}>
      {/* Dynamic Animated Grass Meadow Ground Overlay */}
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Meadow Tall Grass Clumps Roaming Ambient */}
      <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none opacity-20 bg-gradient-to-t from-emerald-950 via-teal-900 to-transparent" />

      {/* Visual Attack Beams & Floating Combat Damage */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-30">
        {state.visualEffects.map(fx => (
          <line
            key={fx.id}
            x1={`${fx.fromX}%`}
            y1={`${fx.fromY}%`}
            x2={`${fx.toX}%`}
            y2={`${fx.toY}%`}
            stroke={fx.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6 4"
            opacity={fx.life}
            className="animate-pulse"
          />
        ))}
      </svg>

      {/* Floating Damage & Status Popups */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {state.floatingTexts.map(ft => (
          <div
            key={ft.id}
            className="absolute font-black font-mono transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{
              left: `${ft.x}%`,
              top: `${ft.y}%`,
              color: ft.color,
              opacity: ft.opacity,
              fontSize: '19px',
              textShadow: '0 0 10px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Top Tallgrass-Style Clean Meadow HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-start justify-between">
        {/* Region & Active Meadow Banner */}
        <div className="flex items-center gap-3 bg-slate-950/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800 shadow-2xl pointer-events-auto">
          <span className="text-2xl">{currentRegion.badgeIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-wide text-white uppercase font-sans">
                {currentRegion.name} Meadow
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Wave #{state.waveNumber}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Dex Range: #{currentRegion.dexRange[0]}-{currentRegion.dexRange[1]} • Lv. {currentRegion.levelRange[0]}-{currentRegion.levelRange[1]}
            </div>
          </div>
        </div>

        {/* Real Player Economy Currencies & Ball Quick-Action */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold shadow-lg">
            <span className="text-emerald-400 font-bold">₽</span>
            <span className="text-white">{state.pokeDollars.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-xl px-3.5 py-2 rounded-xl border border-amber-500/40 text-xs font-mono font-bold shadow-lg">
            <span className="text-amber-400">💎</span>
            <span className="text-amber-300">{state.prismaticShards.toLocaleString()}</span>
          </div>

          {/* Quick Throw Pokeball Button */}
          <button
            onClick={() => state.manualThrowBall('b1')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg transition-all"
            title="Throw Poké Ball at wild Pokémon"
          >
            <span>🔴</span>
            <span>Catch ({state.inventory.find(i => i.id === 'b1')?.count || 0})</span>
          </button>
        </div>
      </div>

      {/* MEADOW CENTRAL FREE-ROAMING COMBAT ARENA */}
      <div className="absolute inset-0 pt-20 pb-20 pointer-events-none">
        {/* 1. SQUAD MEMBERS (LEFT SIDE ROAMING) */}
        {state.squadCombatants.map(c => {
          if (c.isFainted) return null;
          return (
            <div
              key={c.visualId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 pointer-events-auto cursor-pointer"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
              }}
            >
              {/* Overhead Clean HP & Level HUD */}
              <div className="flex flex-col items-center mb-1 drop-shadow-md">
                <div className="bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80 flex items-center gap-1.5 text-[10px] text-white">
                  <span className="font-bold text-slate-200">{c.pokemon.speciesName}</span>
                  <span className="text-cyan-400 font-mono font-bold">Lv.{c.pokemon.level}</span>
                </div>
                {/* Micro HP Bar */}
                <div className="w-14 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/70 mt-0.5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${Math.max(0, (c.currentHp / c.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Animated Showdown Sprite with Physical Attack Lunge & Hit Shake */}
              <div
                className={`relative transition-transform duration-150 ${c.lungeProgress > 0 ? 'translate-x-4 scale-110' : ''} ${c.shakeTimer > 0 ? 'animate-bounce' : ''}`}
              >
                <img
                  src={c.pokemon.spriteUrl}
                  alt={c.pokemon.speciesName}
                  className={`w-20 h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] ${getTierAura(c.pokemon.prismaticTier)} ${c.facing === 'left' ? 'scale-x-[-1]' : ''}`}
                  onError={(e) => {
                    // Fallback to official artwork if showdown GIF fails
                    (e.target as HTMLImageElement).src = c.pokemon.artworkUrl;
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* 2. WILD ROAMING MEADOW POKEMON (RIGHT SIDE ROAMING) */}
        {state.activeEnemies.map(e => {
          if (e.isFainted) return null;
          return (
            <div
              key={e.visualId}
              onClick={() => state.manualThrowBall('b1', e.visualId)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 pointer-events-auto cursor-pointer group"
              style={{
                left: `${e.x}%`,
                top: `${e.y}%`,
              }}
            >
              {/* Overhead Target HUD */}
              <div className="flex flex-col items-center mb-1 drop-shadow-md">
                <div className="bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80 flex items-center gap-1.5 text-[10px]">
                  <span className={`font-bold ${e.pokemon.prismaticTier !== 'Standard' ? 'text-amber-400 font-extrabold' : 'text-slate-200'}`}>
                    {e.pokemon.speciesName}
                  </span>
                  <span className="text-amber-400 font-mono font-bold">Lv.{e.pokemon.level}</span>
                </div>
                {/* Micro Enemy HP Bar */}
                <div className="w-14 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/70 mt-0.5">
                  <div
                    className="h-full bg-rose-500 transition-all duration-150"
                    style={{ width: `${Math.max(0, (e.currentHp / e.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Animated Wild Sprite with Hit Shake & Click to Target */}
              <div
                className={`relative transition-transform duration-150 ${e.lungeProgress > 0 ? '-translate-x-4 scale-110' : ''} ${e.shakeTimer > 0 ? 'animate-bounce' : ''}`}
              >
                <img
                  src={e.pokemon.spriteUrl}
                  alt={e.pokemon.speciesName}
                  className={`w-20 h-20 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] ${getTierAura(e.pokemon.prismaticTier)} ${e.facing === 'left' ? '' : 'scale-x-[-1]'}`}
                  onError={(ev) => {
                    (ev.target as HTMLImageElement).src = e.pokemon.artworkUrl;
                  }}
                />
              </div>

              {/* Hover Catch Cue */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center mt-1">
                <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded shadow">
                  THROW BALL
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
