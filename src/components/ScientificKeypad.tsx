import React, { useState } from 'react';
import { AngleMode } from '../types';

interface ScientificKeypadProps {
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  onInsertFunction: (fn: string) => void;
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onClear: () => void;
  onEquals: () => void;
  onDecimal: () => void;
  onParenthesis: (p: '(' | ')') => void;
  onConstant: (c: 'π' | 'e') => void;
}

export const ScientificKeypad: React.FC<ScientificKeypadProps> = ({
  angleMode,
  onToggleAngleMode,
  onInsertFunction,
  onDigit,
  onOperator,
  onClear,
  onEquals,
  onDecimal,
  onParenthesis,
  onConstant,
}) => {
  const [isSecond, setIsSecond] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-2 sm:p-2.5 w-full select-none">
      {/* Scientific Function Grid (5 columns x 3 rows) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#0c1427]/90 light:bg-slate-100 p-2 rounded-2xl border border-cyan-900/30 light:border-slate-300 shadow-inner">
        {/* Row 1 */}
        <button
          onClick={() => setIsSecond(!isSecond)}
          type="button"
          className={`h-10 sm:h-11 rounded-xl text-xs font-bold transition-all duration-75 active:scale-95 border flex items-center justify-center ${
            isSecond
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
              : 'bg-slate-800/90 light:bg-white text-cyan-400 light:text-blue-700 border-slate-700/60 light:border-slate-200'
          }`}
        >
          2nd
        </button>

        <button
          onClick={onToggleAngleMode}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-cyan-400 light:text-blue-700 font-bold text-xs border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {angleMode}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? 'asin(' : 'sin(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? 'sin⁻¹' : 'sin'}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? 'acos(' : 'cos(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? 'cos⁻¹' : 'cos'}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? 'atan(' : 'tan(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? 'tan⁻¹' : 'tan'}
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onInsertFunction(isSecond ? 'exp(' : 'ln(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? 'eˣ' : 'ln'}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? '10^' : 'log(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? '10ˣ' : 'log'}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? 'cbrt(' : '√(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? '∛' : '√'}
        </button>

        <button
          onClick={() => onInsertFunction(isSecond ? '^3' : '^2')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          {isSecond ? 'x³' : 'x²'}
        </button>

        <button
          onClick={() => onInsertFunction('^')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          xʸ
        </button>

        {/* Row 3 */}
        <button
          onClick={() => onConstant('π')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-cyan-300 light:text-blue-700 font-medium text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          π
        </button>

        <button
          onClick={() => onConstant('e')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-cyan-300 light:text-blue-700 font-medium text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          e
        </button>

        <button
          onClick={() => onInsertFunction('!')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-slate-200 light:text-slate-800 font-medium text-xs sm:text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          x!
        </button>

        <button
          onClick={() => onParenthesis('(')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-cyan-300 light:text-blue-700 font-bold text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          (
        </button>

        <button
          onClick={() => onParenthesis(')')}
          type="button"
          className="h-10 sm:h-11 rounded-xl bg-slate-800/90 light:bg-white text-cyan-300 light:text-blue-700 font-bold text-sm border border-slate-700/60 light:border-slate-200 transition-all duration-75 active:scale-95 flex items-center justify-center"
        >
          )
        </button>
      </div>

      {/* Main Standard Numbers & Operations (4 cols x 5 rows) */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <button
          onClick={onClear}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 active:scale-[0.93] transition-all duration-75 text-rose-400 font-semibold text-base border border-rose-500/30 flex items-center justify-center"
        >
          AC
        </button>
        <button
          onClick={() => onInsertFunction('abs(')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-medium text-sm border border-cyan-800/40 light:border-slate-300 flex items-center justify-center"
        >
          |x|
        </button>
        <button
          onClick={() => onOperator('%')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-medium text-base border border-cyan-800/40 light:border-slate-300 flex items-center justify-center"
        >
          %
        </button>
        <button
          onClick={() => onOperator('÷')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-xl sm:text-2xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onDigit('7')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          7
        </button>
        <button
          onClick={() => onDigit('8')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          8
        </button>
        <button
          onClick={() => onDigit('9')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          9
        </button>
        <button
          onClick={() => onOperator('×')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-xl sm:text-2xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => onDigit('4')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          4
        </button>
        <button
          onClick={() => onDigit('5')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          5
        </button>
        <button
          onClick={() => onDigit('6')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          6
        </button>
        <button
          onClick={() => onOperator('−')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-xl sm:text-2xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
        >
          −
        </button>

        {/* Row 4 */}
        <button
          onClick={() => onDigit('1')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          1
        </button>
        <button
          onClick={() => onDigit('2')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          2
        </button>
        <button
          onClick={() => onDigit('3')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          3
        </button>
        <button
          onClick={() => onOperator('+')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-[0.93] transition-all duration-75 text-white font-bold text-xl sm:text-2xl border border-blue-400/40 shadow-md shadow-blue-600/20 flex items-center justify-center"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => onInsertFunction('1/')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-[#1a253d] light:bg-slate-200 hover:bg-[#243354] active:scale-[0.93] transition-all duration-75 text-cyan-300 light:text-blue-900 font-medium text-sm border border-cyan-800/40 light:border-slate-300 flex items-center justify-center"
        >
          1/x
        </button>
        <button
          onClick={() => onDigit('0')}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-medium text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={onDecimal}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-slate-800/95 light:bg-white hover:bg-slate-700/90 active:scale-[0.93] transition-all duration-75 text-white light:text-slate-900 font-bold text-xl border border-slate-700/50 light:border-slate-200 shadow-sm flex items-center justify-center"
        >
          .
        </button>
        <button
          onClick={onEquals}
          type="button"
          className="h-12 sm:h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.93] transition-all duration-75 text-white font-bold text-2xl border border-cyan-300/40 shadow-lg shadow-blue-600/30 flex items-center justify-center"
        >
          =
        </button>
      </div>
    </div>
  );
};
