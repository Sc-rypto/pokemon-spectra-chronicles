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

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>('meadow');

  useEffect(() => {
    const unsubscribe = gameState.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col">
      {/* CENTRAL VIEWPORT (MEADOW OR DEDICATED APP SCREEN) */}
      <main className="flex-1 relative overflow-hidden pb-28">
        {activeTab === 'meadow' && <MeadowBattlefield state={gameState} />}

        {/* CLEAN, FULLY STRUCTURED APP SCREENS (NON-COLLAPSING, CLEAN TALLGRASS ARCHITECTURE) */}
        {activeTab !== 'meadow' && (
          <div className="h-full overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto custom-scrollbar">
            {activeTab === 'team' && <SquadBuddyTab state={gameState} />}
            {activeTab === 'world' && <WorldTab state={gameState} />}
            {activeTab === 'shop' && <ShopTab state={gameState} />}
            {activeTab === 'raid' && <SocialHubTab state={gameState} />}
          </div>
        )}
      </main>

      {/* FIXED, NON-COLLAPSIBLE PROPERLY-SIZED BOTTOM NAVIGATION BAR */}
      <BottomDock
        state={gameState}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />
    </div>
  );
};
