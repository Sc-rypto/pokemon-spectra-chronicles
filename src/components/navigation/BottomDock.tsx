import React from 'react';
import { Swords, PawPrint, Map, ShoppingBag, Users, ChevronUp, ChevronDown } from 'lucide-react';

export type TabKey = 'battle' | 'squad' | 'world' | 'shop' | 'social';

interface BottomDockProps {
  activeTab: TabKey | null;
  onSelectTab: (tab: TabKey) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onToggleOpen,
}) => {
  const tabs: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'battle', label: 'Battle', icon: <Swords size={20} />, color: 'hover:text-red-400' },
    { key: 'squad', label: 'Squad & Buddy', icon: <PawPrint size={20} />, color: 'hover:text-amber-400' },
    { key: 'world', label: 'World', icon: <Map size={20} />, color: 'hover:text-cyan-400' },
    { key: 'shop', label: 'Shop', icon: <ShoppingBag size={20} />, color: 'hover:text-emerald-400' },
    { key: 'social', label: 'Social & Hub', icon: <Users size={20} />, color: 'hover:text-purple-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto bg-slate-950/85 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 shadow-2xl">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Navigation Tab buttons */}
        <div className="flex-1 grid grid-cols-5 gap-1 sm:gap-4">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key && isOpen;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  onSelectTab(tab.key);
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 shadow-inner'
                    : `text-slate-400 ${tab.color} hover:bg-slate-900/60`
                }`}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold mt-1 tracking-tight truncate w-full text-center">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Drawer Toggle Collapse Indicator */}
        <button
          onClick={onToggleOpen}
          className="ml-3 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-all shadow-md"
          title={isOpen ? 'Collapse Drawer' : 'Expand Drawer'}
        >
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>
    </nav>
  );
};
