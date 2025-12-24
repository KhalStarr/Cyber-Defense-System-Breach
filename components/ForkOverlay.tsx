
import React from 'react';
import { BlacksiteFork } from '../types';

interface ForkOverlayProps {
  fork: BlacksiteFork;
  onChoice: (choiceId: string) => void;
}

const ForkOverlay: React.FC<ForkOverlayProps> = ({ fork, onChoice }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="max-w-3xl w-full border-2 border-[#bc13fe] p-8 md:p-12 relative overflow-hidden bg-black shadow-[0_0_100px_rgba(188,19,254,0.3)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#bc13fe] to-transparent animate-pulse" />
        
        <div className="relative z-10 text-center space-y-8">
          <div className="space-y-2">
            <h2 className="text-[#bc13fe] text-[10px] font-black tracking-[0.4em] uppercase">Irreversible Decision Point</h2>
            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase">{fork.title}</h1>
          </div>

          <p className="text-gray-400 text-sm md:text-lg leading-relaxed italic">
            "{fork.description}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {fork.options.map(option => (
              <button
                key={option.id}
                onClick={() => onChoice(option.id)}
                className="group relative border border-[#bc13fe]/30 p-6 text-left hover:bg-[#bc13fe] hover:border-[#bc13fe] transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-2 text-[10px] text-[#bc13fe]/40 font-bold group-hover:text-black">
                  SELECT_OPT
                </div>
                <h3 className="text-[#bc13fe] text-xl font-black mb-2 group-hover:text-black uppercase italic">
                  {option.label}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed group-hover:text-black/80">
                  {option.effect}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-4 left-0 w-full text-center text-[8px] text-[#bc13fe]/20 uppercase font-bold tracking-widest">
          Memory write in progress... System state will be persistent.
        </div>
      </div>
    </div>
  );
};

export default ForkOverlay;
