import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { StandardKeypad } from './components/StandardKeypad';
import { ScientificKeypad } from './components/ScientificKeypad';
import { ScanMathBottomButton } from './components/ScanMathBottomButton';
import { ScannerModal } from './components/ScannerModal';
import { SolutionModal } from './components/SolutionModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { ApkDownloadModal } from './components/ApkDownloadModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { GmailModal } from './components/GmailModal';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { formatMathSolutionEmail, formatCalculationHistoryEmail } from './services/gmail';
import {
  CalculatorMode,
  CalculationHistoryItem,
  ScannedMathResult,
  AppSettings,
} from './types';
import { evaluateExpression, formatNumber } from './utils/mathEvaluator';
import { playKeyClick, triggerHaptic } from './utils/soundHaptics';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  angleMode: 'DEG',
  haptics: true,
  sound: true,
  precision: 0,
};

export default function App() {
  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('scancalc_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Calculator State (Google Calculator continuous expression model)
  const [mode, setMode] = useState<CalculatorMode>('standard');
  const [currentInput, setCurrentInput] = useState<string>('0');
  const [lastEquation, setLastEquation] = useState<string>('');
  const [liveResult, setLiveResult] = useState<string | undefined>(undefined);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  // History & Saved Questions
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('scancalc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedQuestions, setSavedQuestions] = useState<ScannedMathResult[]>(() => {
    try {
      const saved = localStorage.getItem('scancalc_saved_questions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals & Drawers
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<ScannedMathResult | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isGmailOpen, setIsGmailOpen] = useState(false);
  const [gmailInitialData, setGmailInitialData] = useState<{
    to?: string;
    subject?: string;
    body?: string;
  }>({});
  const { isAuthenticated: isGmailConnected } = useGoogleAuth();

  // Sync settings with localStorage and HTML class
  useEffect(() => {
    localStorage.setItem('scancalc_settings', JSON.stringify(settings));
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  // Sync history and saved questions
  useEffect(() => {
    localStorage.setItem('scancalc_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('scancalc_saved_questions', JSON.stringify(savedQuestions));
  }, [savedQuestions]);

  // Sound and Haptic feedback
  const feedback = useCallback(
    (type: 'num' | 'op' | 'action' = 'num') => {
      if (settings.sound) playKeyClick(type);
      if (settings.haptics) triggerHaptic(type === 'action' ? 20 : 10);
    },
    [settings.sound, settings.haptics]
  );

  // Live Result Preview calculation (BODMAS-compliant Google Calculator style)
  useEffect(() => {
    if (!currentInput || currentInput === '0' || isCalculated) {
      setLiveResult(undefined);
      return;
    }

    // Only compute live preview if there's at least one operator or scientific function
    if (/[+\-×÷%^√!()]/.test(currentInput)) {
      const evaluated = evaluateExpression(currentInput, settings.angleMode);
      if (evaluated.success && evaluated.result && evaluated.result !== currentInput) {
        setLiveResult(evaluated.result);
        return;
      }
    }
    setLiveResult(undefined);
  }, [currentInput, isCalculated, settings.angleMode]);

  // Handle Digit input (0-9)
  const handleDigit = useCallback(
    (digit: string) => {
      feedback('num');
      if (isCalculated || currentInput === '0' || currentInput === 'Error' || currentInput === "Can't divide by 0") {
        setCurrentInput(digit);
        setIsCalculated(false);
      } else {
        setCurrentInput((prev) => prev + digit);
      }
    },
    [currentInput, isCalculated, feedback]
  );

  // Handle Decimal point (.)
  const handleDecimal = useCallback(() => {
    feedback('num');
    if (isCalculated || currentInput === 'Error' || currentInput === "Can't divide by 0") {
      setCurrentInput('0.');
      setIsCalculated(false);
      return;
    }

    // Split by operators to check if current number segment already has a decimal
    const parts = currentInput.split(/[+\-×÷( ]/);
    const lastPart = parts[parts.length - 1] || '';
    if (!lastPart.includes('.')) {
      if (currentInput.endsWith(' ') || currentInput.endsWith('(') || !currentInput) {
        setCurrentInput((prev) => prev + '0.');
      } else {
        setCurrentInput((prev) => prev + '.');
      }
    }
  }, [currentInput, isCalculated, feedback]);

  // Handle Operator (+, −, ×, ÷)
  const handleOperator = useCallback(
    (op: string) => {
      feedback('op');
      if (currentInput === 'Error' || currentInput === "Can't divide by 0") {
        setCurrentInput('0');
        setIsCalculated(false);
        return;
      }

      // If user just evaluated an expression, continue calculating from Ans
      if (isCalculated) {
        setIsCalculated(false);
        setCurrentInput(`${currentInput} ${op} `);
        return;
      }

      // If the last characters are already an operator, replace it
      if (/\s[+\-×÷]\s$/.test(currentInput)) {
        setCurrentInput((prev) => prev.replace(/\s[+\-×÷]\s$/, ` ${op} `));
        return;
      }

      setCurrentInput((prev) => `${prev} ${op} `);
    },
    [currentInput, isCalculated, feedback]
  );

  // Handle Equals (=)
  const handleEquals = useCallback(() => {
    feedback('action');
    if (!currentInput || currentInput === '0' || isCalculated) return;

    const evaluated = evaluateExpression(currentInput, settings.angleMode);

    if (evaluated.success && evaluated.result) {
      let finalVal = evaluated.result;
      if (settings.precision > 0) {
        const parsed = parseFloat(finalVal);
        if (!isNaN(parsed)) finalVal = formatNumber(parsed, settings.precision);
      }

      // Record to history
      const historyItem: CalculationHistoryItem = {
        id: 'calc_' + Date.now(),
        expression: currentInput,
        result: finalVal,
        timestamp: Date.now(),
        mode,
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
      setLastEquation(currentInput);
      setCurrentInput(finalVal);
      setIsCalculated(true);
      setLiveResult(undefined);
    } else {
      setLastEquation(currentInput);
      setCurrentInput(evaluated.error || 'Error');
      setIsCalculated(true);
      setLiveResult(undefined);
    }
  }, [currentInput, isCalculated, settings.angleMode, settings.precision, mode, feedback]);

  // Handle All Clear (AC)
  const handleClear = useCallback(() => {
    feedback('action');
    setCurrentInput('0');
    setLastEquation('');
    setLiveResult(undefined);
    setIsCalculated(false);
  }, [feedback]);

  // Handle Backspace (DEL)
  const handleBackspace = useCallback(() => {
    feedback('num');
    if (isCalculated || currentInput === 'Error' || currentInput === "Can't divide by 0") {
      setCurrentInput('0');
      setIsCalculated(false);
      return;
    }

    // If ending with operator and spaces (e.g. " + "), remove entire operator token
    if (/\s[+\-×÷]\s$/.test(currentInput)) {
      const trimmed = currentInput.slice(0, -3);
      setCurrentInput(trimmed || '0');
      return;
    }

    if (currentInput.length > 1) {
      setCurrentInput((prev) => prev.slice(0, -1));
    } else {
      setCurrentInput('0');
    }
  }, [currentInput, isCalculated, feedback]);

  // Handle Plus/Minus (±)
  const handleNegate = useCallback(() => {
    feedback('num');
    if (currentInput === '0' || currentInput === 'Error' || currentInput === "Can't divide by 0") return;

    // If single number
    if (/^-?[0-9.]+$/.test(currentInput)) {
      if (currentInput.startsWith('-')) {
        setCurrentInput(currentInput.slice(1));
      } else {
        setCurrentInput('-' + currentInput);
      }
      return;
    }

    // Otherwise wrap current expression in -(...)
    setCurrentInput((prev) => `-(${prev})`);
  }, [currentInput, feedback]);

  // Handle Percentage (%)
  const handlePercentage = useCallback(() => {
    feedback('op');
    if (currentInput === 'Error' || currentInput === "Can't divide by 0") return;
    setCurrentInput((prev) => (prev === '0' ? '0' : `${prev}%`));
  }, [currentInput, feedback]);

  // Handle Parenthesis Smart Input ( )
  const handleParenthesis = useCallback(() => {
    feedback('num');
    if (isCalculated || currentInput === '0' || currentInput === 'Error' || currentInput === "Can't divide by 0") {
      setCurrentInput('(');
      setIsCalculated(false);
      return;
    }

    const openCount = (currentInput.match(/\(/g) || []).length;
    const closeCount = (currentInput.match(/\)/g) || []).length;

    // If there is an unclosed parenthesis and the last character is a number or closing paren, close it
    if (openCount > closeCount && /[0-9.)%!]$/.test(currentInput.trim())) {
      setCurrentInput((prev) => prev + ')');
    } else {
      // Otherwise open a new parenthesis
      if (/[0-9.)%!]$/.test(currentInput.trim())) {
        setCurrentInput((prev) => prev + ' × (');
      } else {
        setCurrentInput((prev) => prev + '(');
      }
    }
  }, [currentInput, isCalculated, feedback]);

  // Handle Scientific Functions
  const handleInsertFunction = useCallback(
    (fn: string) => {
      feedback('num');
      if (isCalculated || currentInput === '0' || currentInput === 'Error' || currentInput === "Can't divide by 0") {
        setCurrentInput(fn);
        setIsCalculated(false);
      } else {
        if (fn.endsWith('(')) {
          if (/[0-9.]$/.test(currentInput.trim())) {
            setCurrentInput((prev) => `${prev} × ${fn}`);
          } else {
            setCurrentInput((prev) => `${prev}${fn}`);
          }
        } else if (fn === '^2' || fn === '^3' || fn === '!') {
          setCurrentInput((prev) => `${prev}${fn}`);
        } else if (fn === '^') {
          setCurrentInput((prev) => `${prev} ^ `);
        } else if (fn === '1/') {
          setCurrentInput((prev) => `1/(${prev}`);
        } else {
          setCurrentInput((prev) => `${prev}${fn}`);
        }
      }
    },
    [currentInput, isCalculated, feedback]
  );

  // Handle Constants (π, e)
  const handleConstant = useCallback(
    (c: 'π' | 'e') => {
      feedback('num');
      if (isCalculated || currentInput === '0' || currentInput === 'Error' || currentInput === "Can't divide by 0") {
        setCurrentInput(c);
        setIsCalculated(false);
      } else {
        if (/[0-9.πe]$/.test(currentInput.trim())) {
          setCurrentInput((prev) => `${prev} × ${c}`);
        } else {
          setCurrentInput((prev) => `${prev}${c}`);
        }
      }
    },
    [currentInput, isCalculated, feedback]
  );

  // Toggle DEG / RAD
  const handleToggleAngleMode = useCallback(() => {
    feedback('op');
    setSettings((prev) => ({
      ...prev,
      angleMode: prev.angleMode === 'DEG' ? 'RAD' : 'DEG',
    }));
  }, [feedback]);

  // Hardware Keyboard listener (BODMAS-compatible)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('−');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      } else if (e.key === '(' || e.key === ')') {
        handleParenthesis();
      } else if (e.key === '%') {
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
    handleParenthesis,
    handlePercentage,
  ]);

  // Bookmark / Save Scanned Question
  const handleSaveQuestion = (solution: ScannedMathResult) => {
    feedback('action');
    setSavedQuestions((prev) => {
      const exists = prev.some((q) => q.id === solution.id);
      if (exists) {
        return prev.filter((q) => q.id !== solution.id);
      } else {
        return [solution, ...prev];
      }
    });
  };

  // Insert result into calculator
  const handleInsertToCalculator = (val: string) => {
    feedback('action');
    const cleanNum = val.replace(/[^0-9.\-]/g, '');
    setCurrentInput(cleanNum || val);
    setIsCalculated(false);
    setCurrentSolution(null);
  };

  // Gmail Handlers
  const handleOpenGmail = useCallback(() => {
    feedback('action');
    setGmailInitialData({
      subject: 'ScanCalc AI: Math Solution & Notes',
      body:
        currentInput && currentInput !== '0'
          ? `ScanCalc AI Calculation:\n${lastEquation ? `${lastEquation} = ` : ''}${currentInput}\n`
          : '',
    });
    setIsGmailOpen(true);
  }, [feedback, currentInput, lastEquation]);

  const handleShareSolutionGmail = useCallback(
    (solution: ScannedMathResult) => {
      feedback('action');
      const { subject, bodyText } = formatMathSolutionEmail(solution);
      setGmailInitialData({
        subject,
        body: bodyText,
      });
      setIsGmailOpen(true);
    },
    [feedback]
  );

  const handleEmailHistoryGmail = useCallback(() => {
    feedback('action');
    const { subject, bodyText } = formatCalculationHistoryEmail(history);
    setGmailInitialData({
      subject,
      body: bodyText,
    });
    setIsGmailOpen(true);
  }, [feedback, history]);

  const isLight = settings.theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-between transition-colors duration-200 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#070b18] text-slate-100'
      }`}
    >
      {/* Offline Toast */}
      <OfflineIndicator />

      {/* Main Google-Calculator Layout Shell */}
      <main className="w-full max-w-md min-h-screen sm:min-h-[720px] flex flex-col justify-between bg-[#070c1b] light:bg-white shadow-2xl relative sm:my-auto sm:border sm:border-cyan-900/30 sm:rounded-3xl overflow-hidden">
        {/* Top Header */}
        <Header
          mode={mode}
          onModeChange={setMode}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          onOpenGmail={handleOpenGmail}
          isGmailConnected={isGmailConnected}
          savedCount={savedQuestions.length}
        />

        {/* Digital Math Display */}
        <CalculatorDisplay
          expression={lastEquation}
          currentInput={currentInput}
          liveResult={liveResult}
          angleMode={settings.angleMode}
          mode={mode}
          onBackspace={handleBackspace}
          onToggleAngleMode={handleToggleAngleMode}
          onClear={handleClear}
        />

        {/* Keypad Section (Square 4-column button grid) */}
        <div className="w-full flex-1 flex flex-col justify-end">
          {mode === 'standard' ? (
            <StandardKeypad
              onDigit={handleDigit}
              onOperator={handleOperator}
              onClear={handleClear}
              onEquals={handleEquals}
              onDecimal={handleDecimal}
              onNegate={handleNegate}
              onPercentage={handlePercentage}
              onParenthesis={handleParenthesis}
            />
          ) : (
            <ScientificKeypad
              angleMode={settings.angleMode}
              onToggleAngleMode={handleToggleAngleMode}
              onInsertFunction={handleInsertFunction}
              onDigit={handleDigit}
              onOperator={handleOperator}
              onClear={handleClear}
              onEquals={handleEquals}
              onDecimal={handleDecimal}
              onParenthesis={(p) => handleDigit(p)}
              onConstant={handleConstant}
            />
          )}

          {/* Dedicated Full-Width SCAN MATH Button at the Bottom */}
          <ScanMathBottomButton onClick={() => setIsScannerOpen(true)} />
        </div>
      </main>

      {/* Real Math Camera & Gallery Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={(result) => {
          setIsScannerOpen(false);
          setCurrentSolution(result);
        }}
      />

      {/* Solution & Google Search Modal */}
      <SolutionModal
        solution={currentSolution}
        onClose={() => setCurrentSolution(null)}
        onSaveQuestion={handleSaveQuestion}
        isSaved={Boolean(
          currentSolution && savedQuestions.some((q) => q.id === currentSolution.id)
        )}
        onInsertToCalculator={handleInsertToCalculator}
        onShareGmail={handleShareSolutionGmail}
      />

      {/* History & Bookmarks Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        savedQuestions={savedQuestions}
        onSelectHistoryItem={(item) => {
          setCurrentInput(item.result);
          setIsCalculated(false);
          setIsHistoryOpen(false);
        }}
        onSelectSavedQuestion={(question) => {
          setCurrentSolution(question);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => setHistory([])}
        onDeleteSavedQuestion={(id) =>
          setSavedQuestions((prev) => prev.filter((q) => q.id !== id))
        }
        onClearSavedQuestions={() => setSavedQuestions([])}
        onEmailHistory={handleEmailHistoryGmail}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
        onResetAllData={() => {
          setHistory([]);
          setSavedQuestions([]);
          setSettings(DEFAULT_SETTINGS);
          setIsSettingsOpen(false);
        }}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Android APK GitHub Release & Download Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Gmail Workspace Modal (Send Math, Drafts, Inbox, Confirmations) */}
      <GmailModal
        isOpen={isGmailOpen}
        onClose={() => setIsGmailOpen(false)}
        initialRecipient={gmailInitialData.to}
        initialSubject={gmailInitialData.subject}
        initialBody={gmailInitialData.body}
        currentInput={currentInput}
        lastEquation={lastEquation}
        history={history}
        savedQuestions={savedQuestions}
      />
    </div>
  );
}
