import React, { useState, useEffect } from 'react';
import { GameStateManager } from './state/GameStateManager';
import { CanvasViewport } from './components/CanvasViewport';
import { BottomDock, TabKey } from './components/navigation/BottomDock';
import { BattleTab } from './components/drawers/BattleTab';
import { SquadBuddyTab } from './components/drawers/SquadBuddyTab';
import { WorldTab } from './components/drawers/WorldTab';
import { ShopTab } from './components/drawers/ShopTab';
import { SocialHubTab } from './components/drawers/SocialHubTab';

export const App: React.FC = () => {
  const gameState = GameStateManager.getInstance();
  const [, setTick] = useState<number>(0);

  // Bottom drawer state
  const [activeTab, setActiveTab] = useState<TabKey>('battle');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Subscribe to reactive state updates
  useEffect(() => {
    const unsubscribe = gameState.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const handleSelectTab = (tab: TabKey) => {
    if (activeTab === tab && isDrawerOpen) {
      // Toggle drawer if same tab clicked
      setIsDrawerOpen(false);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Background 3D Continuous WebGL Viewport */}
      <div className="absolute inset-0 z-0">
        <CanvasViewport state={gameState} />
      </div>

      {/* Responsive Overlay Drawer for Active Tab */}
      <div
        className={`fixed left-0 right-0 bottom-16 z-40 transition-all duration-300 ease-out pointer-events-none ${
          isDrawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto px-3">
          <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-slate-800/80 shadow-2xl max-h-[52vh] sm:max-h-[58vh] overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'battle' && <BattleTab state={gameState} />}
            {activeTab === 'squad' && <SquadBuddyTab state={gameState} />}
            {activeTab === 'world' && <WorldTab state={gameState} />}
            {activeTab === 'shop' && <ShopTab state={gameState} />}
            {activeTab === 'social' && <SocialHubTab state={gameState} />}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Dock Navigation Bar */}
      <BottomDock
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpen={isDrawerOpen}
        onToggleOpen={() => setIsDrawerOpen(!isDrawerOpen)}
      />
    </div>
  );
};
