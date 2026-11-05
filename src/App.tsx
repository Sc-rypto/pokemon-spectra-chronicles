import React, { useState, useEffect } from 'react';
import { GameStateManager } from './state/GameStateManager';
import { MeadowBattlefield } from './components/MeadowBattlefield';
import { BottomDock, TabKey } from './components/navigation/BottomDock';
import { BattleTab } from './components/drawers/BattleTab';
import { SquadBuddyTab } from './components/drawers/SquadBuddyTab';
import { WorldTab } from './components/drawers/WorldTab';
import { ShopTab } from './components/drawers/ShopTab';
import { SocialHubTab } from './components/drawers/SocialHubTab';

export const App: React.FC = () => {
  const gameState = GameStateManager.getInstance();
  const [, setTick] = useState<number>(0);

  // Bottom drawer state (collapsible to allow full-screen view of the roaming Meadow)
  const [activeTab, setActiveTab] = useState<TabKey>('battle');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // Subscribe to real-time auto-combat & free roaming ticks
  useEffect(() => {
    const unsubscribe = gameState.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const handleSelectTab = (tab: TabKey) => {
    if (activeTab === tab && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Central Interactive Roaming Meadow Battlefield (Tallgrass Inspired) */}
      <div className="absolute inset-0 z-0">
        <MeadowBattlefield state={gameState} />
      </div>

      {/* Responsive App Drawer Overlay */}
      <div
        className={`fixed left-0 right-0 bottom-16 z-40 transition-all duration-300 ease-out pointer-events-none ${
          isDrawerOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto px-3">
          <div className="pointer-events-auto bg-slate-950/92 backdrop-blur-2xl rounded-2xl border border-slate-800/80 shadow-2xl max-h-[50vh] sm:max-h-[54vh] overflow-y-auto p-4 custom-scrollbar">
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
