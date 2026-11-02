import React from 'react';

interface StandardKeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onEquals: () => void;
  onDecimal: () => void;
  onNegate: () => void;
  onPercentage: () => void;
  onParenthesis: () => void;
}

export const StandardKeypad: React.FC<StandardKeypadProps> = ({
  onDigit,
  onOperator,
  onClear,
  onEquals,
  onDecimal,
  onNegate,
  onPercentage,
  onParenthesis,
}) => {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-2.5 p-2 sm:p-2.5 w-full select-none">
      {/* Row 1: AC, ( ), %, ÷ */}
      <button
        onClick={onClear}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.93] transition-all duration-75 text-rose-400 light:text-rose-600 font-semibold text-lg sm:text-xl border border-rose-500/30 shadow-sm flex items-center justify-center"
      >
        AC
      </button>

      <button
        onClick={onParenthesis}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-semibold text-lg sm:text-xl border border-cyan-800/40 light:border-slate-300 shadow-sm flex items-center justify-center"
      >
        ( )
      </button>

      <button
        onClick={onPercentage}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-semibold text-lg sm:text-xl border border-cyan-800/40 light:border-slate-300 shadow-sm flex items-center justify-center"
      >
        %
      </button>

      <button
        onClick={() => onOperator('÷')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl sm:text-3xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
      >
        ÷
      </button>

      {/* Row 2: 7, 8, 9, × */}
      <button
        onClick={() => onDigit('7')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        7
      </button>
      <button
        onClick={() => onDigit('8')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        8
      </button>
      <button
        onClick={() => onDigit('9')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        9
      </button>
      <button
        onClick={() => onOperator('×')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl sm:text-3xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
      >
        ×
      </button>

      {/* Row 3: 4, 5, 6, − */}
      <button
        onClick={() => onDigit('4')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        4
      </button>
      <button
        onClick={() => onDigit('5')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        5
      </button>
      <button
        onClick={() => onDigit('6')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        6
      </button>
      <button
        onClick={() => onOperator('−')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl sm:text-3xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
      >
        −
      </button>

      {/* Row 4: 1, 2, 3, + */}
      <button
        onClick={() => onDigit('1')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        1
      </button>
      <button
        onClick={() => onDigit('2')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        2
      </button>
      <button
        onClick={() => onDigit('3')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        3
      </button>
      <button
        onClick={() => onOperator('+')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl sm:text-3xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
      >
        +
      </button>

      {/* Row 5: ±, 0, ., = */}
      <button
        onClick={onNegate}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-semibold text-xl sm:text-2xl border border-cyan-800/40 light:border-slate-300 shadow-sm flex items-center justify-center"
      >
        ±
      </button>
      <button
        onClick={() => onDigit('0')}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        0
      </button>
      <button
        onClick={onDecimal}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-bold text-2xl sm:text-3xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
      >
        .
      </button>
      <button
        onClick={onEquals}
        type="button"
        className="aspect-square w-full rounded-2xl sm:rounded-[22px] bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl sm:text-3xl border border-cyan-300/40 shadow-lg shadow-blue-600/30 flex items-center justify-center"
      >
        =
      </button>
    </div>
  );
};
