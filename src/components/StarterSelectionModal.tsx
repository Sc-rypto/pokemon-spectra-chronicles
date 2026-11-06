import React, { useState } from 'react';
import { GameStateManager } from '../state/GameStateManager';
import { ALL_27_STARTERS, StarterOption } from '../data/startersData';
import { getPokemonSpriteUrls, TYPE_PALETTES } from '../data/pokemonCatalog';
import { Sparkles, User, Award, ArrowRight } from 'lucide-react';

interface StarterSelectionModalProps {
  state: GameStateManager;
}

export const StarterSelectionModal: React.FC<StarterSelectionModalProps> = ({ state }) => {
  const [trainerName, setTrainerName] = useState<string>('');
  const [selectedGen, setSelectedGen] = useState<number>(1);
  const [chosenStarter, setChosenStarter] = useState<StarterOption>(ALL_27_STARTERS[0]);
  const [step, setStep] = useState<'intro' | 'pick'>('intro');

  const filteredStarters = ALL_27_STARTERS.filter(s => s.gen === selectedGen);

  const handleConfirmStarter = () => {
    const finalName = trainerName.trim() || 'Trainer Red';
    state.completeOnboarding(finalName, chosenStarter.dex);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4">
      {/* Pokemon Authentic Oak Intro Frame */}
      <div className="bg-slate-900 border-2 border-slate-700 max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between max-h-[92vh]">
        {/* Retro Header Strip */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Professor Oak's Welcome
              </span>
              <h2 className="text-lg md:text-xl font-black text-white">
                Pokémon: Spectra Chronicles
              </h2>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            {step === 'intro' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </span>
        </div>

        {/* STEP 1: What is your name, Trainer? */}
        {step === 'intro' && (
          <div className="py-8 space-y-6 flex-1 flex flex-col justify-center">
            <div className="flex flex-col items-center text-center space-y-3">
              <img
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                alt="Ball"
                className="w-16 h-16 object-contain animate-bounce drop-shadow-[0_8px_16px_rgba(239,68,68,0.5)]"
                style={{ animationDuration: '2s' }}
              />
              <p className="text-slate-300 font-mono text-sm leading-relaxed max-w-md">
                "Hello there! Welcome to the world of Pokémon! My name is Oak. People call me the Pokémon Professor!
                First, tell me, what is your name, Trainer?"
              </p>
            </div>

            <div className="max-w-md mx-auto w-full space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Your Trainer Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Ash, Red, or Spectra"
                  value={trainerName}
                  onChange={e => setTrainerName(e.target.value)}
                  maxLength={16}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3.5 text-white font-bold text-sm focus:outline-none shadow-inner"
                />
                <User className="absolute right-4 top-3.5 w-5 h-5 text-slate-500" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep('pick')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center gap-2 transition-all"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Choose 1 Starter from All 27 Starters */}
        {step === 'pick' && (
          <div className="py-4 space-y-4 flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                Choose Your First Partner Pokémon
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                All 27 starters across Generations 1 through 9. A chance of rolling rare variants!
              </p>
            </div>

            {/* Generation Tabs (Gen 1 to Gen 9) */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(gen => (
                <button
                  key={gen}
                  onClick={() => {
                    setSelectedGen(gen);
                    const firstInGen = ALL_27_STARTERS.find(s => s.gen === gen);
                    if (firstInGen) setChosenStarter(firstInGen);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    selectedGen === gen
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Gen {gen}
                </button>
              ))}
            </div>

            {/* 3 Starter Cards for Selected Generation */}
            <div className="grid grid-cols-3 gap-3 my-2">
              {filteredStarters.map(starter => {
                const isSelected = chosenStarter.dex === starter.dex;
                const urls = getPokemonSpriteUrls(starter.dex);
                const palette = TYPE_PALETTES[starter.type] || TYPE_PALETTES.Normal;

                return (
                  <button
                    key={starter.dex}
                    onClick={() => setChosenStarter(starter)}
                    className={`p-4 rounded-3xl border text-center transition-all flex flex-col items-center justify-between relative group ${
                      isSelected
                        ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/50 shadow-2xl scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">#{starter.dex}</span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white uppercase"
                        style={{ backgroundColor: palette.primary }}
                      >
                        {starter.type}
                      </span>
                    </div>

                    <div className="relative my-2">
                      <img
                        src={urls.sprite}
                        alt={starter.name}
                        className="w-20 h-20 md:w-24 md:h-24 object-contain group-hover:scale-105 transition-transform drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = urls.artwork;
                        }}
                      />
                      <div className="w-16 h-2 bg-black/40 rounded-[100%] blur-sm mx-auto -mt-1" />
                    </div>

                    <div className="w-full">
                      <div className="font-extrabold text-sm text-white">{starter.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{starter.region} Region</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Confirmation Bar */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setStep('intro')}
                className="text-xs text-slate-400 hover:text-slate-200 font-bold"
              >
                ← Back
              </button>

              <button
                onClick={handleConfirmStarter}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-950/50 flex items-center gap-2 transition-all"
              >
                <Award size={15} />
                <span>Begin Journey with {chosenStarter.name}!</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
