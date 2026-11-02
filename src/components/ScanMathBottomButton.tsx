import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface ScanMathBottomButtonProps {
  onClick: () => void;
}

export const ScanMathBottomButton: React.FC<ScanMathBottomButtonProps> = ({ onClick }) => {
  return (
    <div className="w-full px-2.5 sm:px-3 pt-1 pb-3">
      <button
        onClick={onClick}
        type="button"
        aria-label="Scan Math with Camera"
        className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all duration-150 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/30 border border-white/20 select-none group"
      >
        <div className="relative flex items-center justify-center">
          <Camera className="w-5 h-5 text-white transition-transform group-hover:scale-110" />
          <Sparkles className="w-3 h-3 text-cyan-200 absolute -top-1.5 -right-1.5 animate-pulse" />
        </div>
        <span className="tracking-wider uppercase font-black text-xs sm:text-sm drop-shadow-sm">
          Scan Math
        </span>
      </button>
    </div>
  );
};
