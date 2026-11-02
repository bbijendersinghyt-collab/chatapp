export type CalculatorMode = 'standard' | 'scientific';

export type AngleMode = 'DEG' | 'RAD';

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: CalculatorMode;
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  formula?: string;
  description: string;
}

export interface ScannedMathResult {
  id: string;
  scannedEquation: string;
  cleanEquation: string;
  topic: string;
  result: string;
  explanation: string;
  steps: SolutionStep[];
  searchQuery: string;
  timestamp: number;
  imageUrl?: string;
  isAiGenerated: boolean;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  angleMode: AngleMode;
  haptics: boolean;
  sound: boolean;
  precision: number; // 0 for auto, or 2, 4, 6, 8
}
