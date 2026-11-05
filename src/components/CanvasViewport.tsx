import React, { useEffect, useRef, useState } from 'react';
import { WorldSceneManager, FloatingText } from '../engine/WorldSceneManager';
import { GameStateManager } from '../state/GameStateManager';

interface CanvasViewportProps {
  state: GameStateManager;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [unitAnchors, setUnitAnchors] = useState<{ id: string; name: string; hpRatio: number; screenPos: { x: number; y: number }; isPlayer: boolean; level: number; tier: string }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new WorldSceneManager(containerRef.current);
    state.bindWorldManager(manager);

    manager.onFloatingTextsUpdate = (texts) => {
      setFloatingTexts(texts);
    };

    manager.onUnitAnchorsUpdate = (anchors) => {
      setUnitAnchors(anchors);
    };

    return () => {
      manager.destroy();
    };
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Supernova': return 'text-amber-400 font-bold';
      case 'Ethereal': return 'text-cyan-300 font-bold';
      case 'Radiant': return 'text-emerald-300 font-bold';
      case 'Shiny': return 'text-yellow-300 font-semibold';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* In-World 3D Unit Overlays (Tallgrass / DelugeRPG Style Battle Screen Overhead HUD) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {unitAnchors.map(anchor => {
          // Hide if offscreen or behind camera
          if (anchor.screenPos.y < 0 || anchor.screenPos.y > window.innerHeight) return null;
          return (
            <div
              key={anchor.id}
              className="absolute transform -translate-x-1/2 -translate-y-full transition-transform duration-75 flex flex-col items-center gap-1"
              style={{
                left: `${anchor.screenPos.x}px`,
                top: `${anchor.screenPos.y - 10}px`,
              }}
            >
              {/* Unit Tag: Name & Level */}
              <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80 shadow-md flex items-center gap-1.5 text-[11px] font-sans">
                <span className={`truncate max-w-[90px] ${getTierColor(anchor.tier)}`}>
                  {anchor.name}
                </span>
                <span className="font-mono text-cyan-400 text-[10px] font-bold">
                  Lv.{anchor.level}
                </span>
              </div>

              {/* Dynamic Overhead In-World HP Bar */}
              <div className="w-18 h-1.5 bg-slate-900/90 rounded-full overflow-hidden border border-slate-700/60 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    anchor.isPlayer
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, anchor.hpRatio * 100))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2D Floating Combat Text Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {floatingTexts.map(ft => (
          <div
            key={ft.id}
            className="absolute font-black font-mono transform -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{
              left: `${ft.screenPos.x}px`,
              top: `${ft.screenPos.y}px`,
              color: ft.color,
              opacity: ft.opacity,
              fontSize: '20px',
              textShadow: '0 0 10px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Top HUD Overview */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-start justify-between">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 shadow-2xl">
            <span className="text-xl">✨</span>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent uppercase">
                Pokémon: Spectra Chronicles
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                <span>Tallgrass Continuous Auto-Battler</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">1,025 Pokémon Registered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Wallet & Currencies */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono font-bold shadow-lg">
            <span className="text-emerald-400">₽</span>
            <span className="text-white">{state.pokeDollars.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/30 text-xs font-mono font-bold shadow-lg">
            <span className="text-amber-400">💎</span>
            <span className="text-amber-300">{state.prismaticShards.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
