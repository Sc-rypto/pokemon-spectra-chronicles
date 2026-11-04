import React, { useEffect, useRef, useState } from 'react';
import { WorldSceneManager, FloatingText } from '../engine/WorldSceneManager';
import { GameStateManager } from '../state/GameStateManager';

interface CanvasViewportProps {
  state: GameStateManager;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const manager = new WorldSceneManager(containerRef.current);
    state.bindWorldManager(manager);

    manager.onFloatingTextsUpdate = (texts) => {
      setFloatingTexts(texts);
    };

    return () => {
      manager.destroy();
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      {/* 3D Canvas Mount */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

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
              fontSize: '18px',
              textShadow: '0 0 8px rgba(0,0,0,0.9)',
            }}
          >
            {ft.text}
          </div>
        ))}
      </div>

      {/* Top HUD Overview (Level, Currencies, Current Wave) */}
      <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex items-start justify-between">
        {/* Title & Region Badge */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-xl">
            <span className="text-xl">✨</span>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent uppercase">
                Pokémon: Spectra Chronicles
              </h1>
              <span className="text-[10px] text-slate-400 font-medium">Continuous 3D Auto-Battler</span>
            </div>
          </div>
        </div>

        {/* Live Wallet & Currencies */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono font-bold shadow-lg">
            <span className="text-emerald-400">₽</span>
            <span className="text-white">{state.pokeDollars.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-xs font-mono font-bold shadow-lg">
            <span className="text-amber-400">💎</span>
            <span className="text-amber-300">{state.prismaticShards.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
