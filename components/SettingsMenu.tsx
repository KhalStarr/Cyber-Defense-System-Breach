
import React from 'react';

interface SettingsMenuProps {
  onClose: () => void;
  onOpenDatabase: () => void;
  onResetProgress: () => void;
  onToggleGodMode: () => void;
  isGodMode: boolean;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
  onClose, 
  onOpenDatabase, 
  onResetProgress, 
  onToggleGodMode,
  isGodMode
}) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm pointer-events-auto">
      <div className="w-full max-w-sm bg-black border-2 border-green-500/50 shadow-[0_0_50px_rgba(57,255,20,0.2)] flex flex-col">
        <div className="p-4 border-b border-green-500/30 flex justify-between items-center bg-green-500/5">
          <h2 className="text-lg font-black text-green-400 italic uppercase tracking-widest">System_Config</h2>
          <button 
            onClick={onClose}
            className="text-green-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button 
            onClick={() => {
              onOpenDatabase();
              onClose();
            }}
            className="w-full py-4 border border-green-500/30 hover:bg-green-500/10 hover:border-green-400 transition-all flex flex-col items-center gap-2 group"
          >
            <span className="text-green-400 font-bold uppercase text-xs tracking-widest group-hover:scale-110 transition-transform">Threat Database</span>
            <span className="text-[9px] text-green-800 uppercase italic">Analyze Malware Intel</span>
          </button>

          <button 
            onClick={onToggleGodMode}
            className={`w-full py-4 border transition-all flex flex-col items-center gap-2 group ${
              isGodMode 
                ? 'bg-red-500 border-red-500 text-black shadow-[0_0_20px_rgba(255,0,0,0.4)]' 
                : 'border-green-500/30 hover:bg-green-500/10 hover:border-green-400 text-green-400'
            }`}
          >
            <span className="font-bold uppercase text-xs tracking-widest group-hover:scale-110 transition-transform">Debug Mode</span>
            <span className={`text-[9px] uppercase italic ${isGodMode ? 'text-black font-black' : 'text-green-800'}`}>
              {isGodMode ? 'God Mode Active' : 'Enable Unlimited Resources'}
            </span>
          </button>

          <div className="pt-4 border-t border-green-500/10">
            <button 
              onClick={() => {
                if (window.confirm("CRITICAL: Wipe all sector progress and restart core?")) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="w-full py-3 border border-red-900/40 text-red-900 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all font-bold uppercase text-[10px] tracking-[0.2em]"
            >
              Reset Progress
            </button>
          </div>
        </div>

        <div className="p-2 bg-green-500/5 text-[8px] text-green-900 text-center font-bold uppercase tracking-widest">
          Auth_Level: Administrator
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
