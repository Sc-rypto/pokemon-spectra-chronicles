import React, { useState, useEffect } from 'react';
import { GameStateManager } from './state/GameStateManager';
import { MeadowBattlefield } from './components/MeadowBattlefield';
import { BottomDock, TabKey } from './components/navigation/BottomDock';
import { SquadBuddyTab } from './components/drawers/SquadBuddyTab';
import { WorldTab } from './components/drawers/WorldTab';
import { ShopTab } from './components/drawers/ShopTab';
import { BagTab } from './components/drawers/BagTab';
import { SocialHubTab } from './components/drawers/SocialHubTab';
import { GymBattleView } from './components/drawers/GymBattleView';
import { StarterSelectionModal } from './components/StarterSelectionModal';
import { RogueRewardModal } from './components/drawers/RogueRewardModal';

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

  const isGymBattleActive = !!gameState.activeGymBattle;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col">
      {/* 1. ONBOARDING / STARTER SELECTION GREETING MODAL */}
      {!gameState.hasCompletedOnboarding && (
        <StarterSelectionModal state={gameState} />
      )}

      {/* 2. POKÉROGUE-STYLE ITEM PICK REWARD MODAL */}
      {gameState.currentRogueRewardOptions && !isGymBattleActive && (
        <RogueRewardModal state={gameState} />
      )}

      {/* 3. CENTRAL VIEWPORT (MEADOW OR DEDICATED APP SCREEN) */}
      <main className="flex-1 relative overflow-hidden pb-28">
        {activeTab === 'meadow' && <MeadowBattlefield state={gameState} />}

        {/* FULLY STRUCTURED APP SCREENS */}
        {activeTab !== 'meadow' && (
          <div className="h-full overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto custom-scrollbar">
            {activeTab === 'team' && <SquadBuddyTab state={gameState} />}
            {activeTab === 'bag' && <BagTab state={gameState} />}
            {activeTab === 'world' && <WorldTab state={gameState} />}
            {activeTab === 'shop' && <ShopTab state={gameState} />}
            {activeTab === 'raid' && <SocialHubTab state={gameState} />}
          </div>
        )}

        {/* AUTHENTIC ANIMATED MAIN-SERIES GYM BATTLE ARENA MODAL */}
        {isGymBattleActive && (
          <GymBattleView state={gameState} />
        )}
      </main>

      {/* 4. FIXED, NON-COLLAPSIBLE PROPERLY-SIZED BOTTOM NAVIGATION BAR (INACCESSIBLE DURING GYM BATTLE) */}
      {!isGymBattleActive && (
        <BottomDock
          state={gameState}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />
      )}
    </div>
  );
};
