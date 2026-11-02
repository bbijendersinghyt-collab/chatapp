import { AngleMode } from '../types';

/**
 * Calculates factorial of a non-negative integer n!
 */
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= Math.min(n, 170); i++) {
    res *= i;
  }
  return res;
}

/**
 * Evaluates a mathematical expression adhering to strict BODMAS/PEMDAS order,
 * with Google Calculator percentage semantics, powers, roots, trigonometry (DEG/RAD),
 * and division-by-zero detection.
 *
 * Example: 2 + 3 × 4 returns 14.
 */
export function evaluateExpression(
  rawExpr: string,
  angleMode: AngleMode = 'DEG'
): { success: boolean; result?: string; error?: string } {
  try {
    let expr = rawExpr.trim();
    if (!expr) return { success: true, result: '0' };

    // Standardize symbols
    expr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/–/g, '-');

    // Remove any trailing operators if user is typing (e.g. "2 + 3 +" -> "2 + 3")
    let evalTarget = expr.replace(/[+\-*/^.]+$/, '').trim();
    if (!evalTarget) return { success: true, result: '0' };

    // Balance open parentheses if user didn't close them yet (e.g. "sin(30" -> "sin(30)")
    const openParenCount = (evalTarget.match(/\(/g) || []).length;
    const closeParenCount = (evalTarget.match(/\)/g) || []).length;
    if (openParenCount > closeParenCount) {
      evalTarget += ')'.repeat(openParenCount - closeParenCount);
    }

    // Handle Google Calculator Percentage logic:
    // Case 1: A + B% -> A + (A * (B/100))
    // Case 2: A - B% -> A - (A * (B/100))
    // Case 3: A * B% -> A * (B/100)
    // Case 4: A / B% -> A / (B/100)
    // Case 5: Standalone B% -> (B/100)
    evalTarget = evalTarget.replace(
      /([0-9.]+)\s*([+\-])\s*([0-9.]+)%/g,
      '($1 $2 ($1 * ($3 / 100)))'
    );
    evalTarget = evalTarget.replace(
      /([0-9.]+)\s*([*/])\s*([0-9.]+)%/g,
      '($1 $2 ($3 / 100))'
    );
    evalTarget = evalTarget.replace(/([0-9.]+)%/g, '($1 / 100)');

    // Handle square roots: √x or √(expression) or √9 -> Math.sqrt(9)
    evalTarget = evalTarget.replace(/√\s*(\([^\)]+\)|[0-9.]+|[a-zA-Z]+)/g, 'sqrt($1)');

    // Handle powers: a^b -> Math.pow(a, b) or **
    evalTarget = evalTarget.replace(/\^/g, '**');

    // Handle factorial: n! -> factorial(n)
    evalTarget = evalTarget.replace(/([0-9.]+)!/g, 'factorial($1)');

    // Constants
    evalTarget = evalTarget
      .replace(/\bπ\b/g, 'PI')
      .replace(/π/g, 'PI')
      .replace(/\be\b/g, 'E');

    // Implicit multiplication: e.g. 2(3) -> 2*(3) or (2)(3) -> (2)*(3) or 2PI -> 2*PI or 2sqrt(9) -> 2*sqrt(9)
    evalTarget = evalTarget
      .replace(/([0-9])\(/g, '$1*(')
      .replace(/\)([0-9])/g, ')*$1')
      .replace(/\)\(/g, ')*(')
      .replace(/([0-9])(PI|E|sqrt|cbrt|sin|cos|tan|log|ln|abs)/g, '$1*$2');

    const isDeg = angleMode === 'DEG';

    const scope: Record<string, any> = {
      PI: Math.PI,
      E: Math.E,
      factorial,
      abs: (x: number) => Math.abs(x),
      sqrt: (x: number) => {
        if (x < 0) throw new Error('Invalid input');
        return Math.sqrt(x);
      },
      cbrt: (x: number) => Math.cbrt(x),
      ln: (x: number) => {
        if (x <= 0) throw new Error('Invalid input');
        return Math.log(x);
      },
      log: (x: number) => {
        if (x <= 0) throw new Error('Invalid input');
        return Math.log10(x);
      },
      sin: (x: number) => {
        const rad = isDeg ? (x * Math.PI) / 180 : x;
        // Float precision fix for sin(180 deg) = 0
        if (isDeg && Math.abs(x % 180) === 0) return 0;
        return Math.sin(rad);
      },
      cos: (x: number) => {
        const rad = isDeg ? (x * Math.PI) / 180 : x;
        // Float precision fix for cos(90 deg) = 0
        if (isDeg && Math.abs(x % 180) === 90) return 0;
        return Math.cos(rad);
      },
      tan: (x: number) => {
        if (isDeg && Math.abs(x % 180) === 90) throw new Error('Undefined');
        const rad = isDeg ? (x * Math.PI) / 180 : x;
        if (isDeg && Math.abs(x % 180) === 0) return 0;
        return Math.tan(rad);
      },
      asin: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Invalid input');
        const val = Math.asin(x);
        return isDeg ? (val * 180) / Math.PI : val;
      },
      acos: (x: number) => {
        if (x < -1 || x > 1) throw new Error('Invalid input');
        const val = Math.acos(x);
        return isDeg ? (val * 180) / Math.PI : val;
      },
      atan: (x: number) => {
        const val = Math.atan(x);
        return isDeg ? (val * 180) / Math.PI : val;
      },
      exp: (x: number) => Math.exp(x),
    };

    // Whitelist valid characters
    const validMathRegex = /^[0-9+\-*/().,%^ \t\r\n\b\w!]+$/;
    if (!validMathRegex.test(evalTarget)) {
      return { success: false, error: 'Invalid expression' };
    }

    // Check division by literal zero: e.g. / 0 or /0 (not / 0.5)
    if (/\/\s*0(?![0-9.])/g.test(evalTarget)) {
      return { success: false, error: "Can't divide by 0" };
    }

    // Transform identifiers to scope lookup
    const transformed = evalTarget
      .replace(/\bsin\b/g, 'scope.sin')
      .replace(/\bcos\b/g, 'scope.cos')
      .replace(/\btan\b/g, 'scope.tan')
      .replace(/\basin\b/g, 'scope.asin')
      .replace(/\bacos\b/g, 'scope.acos')
      .replace(/\batan\b/g, 'scope.atan')
      .replace(/\bsqrt\b/g, 'scope.sqrt')
      .replace(/\bcbrt\b/g, 'scope.cbrt')
      .replace(/\bln\b/g, 'scope.ln')
      .replace(/\blog\b/g, 'scope.log')
      .replace(/\babs\b/g, 'scope.abs')
      .replace(/\bexp\b/g, 'scope.exp')
      .replace(/\bfactorial\b/g, 'scope.factorial')
      .replace(/\bPI\b/g, 'scope.PI')
      .replace(/\bE\b/g, 'scope.E');

    // Execute with JS Function
    const evalFn = new Function('scope', `return (${transformed});`);
    const val = evalFn(scope);

    if (val === undefined || val === null || Number.isNaN(val)) {
      return { success: false, error: 'Invalid expression' };
    }

    if (!Number.isFinite(val)) {
      return { success: false, error: "Can't divide by 0" };
    }

    return { success: true, result: formatNumber(val) };
  } catch (err: any) {
    const msg = err?.message || '';
    if (msg.includes('divide by 0') || msg.includes('Can\'t divide by 0')) {
      return { success: false, error: "Can't divide by 0" };
    }
    return { success: false, error: msg || 'Error' };
  }
}

/**
 * Format numbers cleanly without IEEE float dust (e.g. 0.1 + 0.2 = 0.3)
 */
export function formatNumber(num: number, precision: number = 0): string {
  if (Math.abs(num) < 1e-12) return '0';

  if (precision > 0) {
    return num.toFixed(precision);
  }

  // Large or very small numbers
  if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Eliminate floating point imprecision like 0.30000000000000004
  const rounded = Math.round(num * 1e11) / 1e11;
  return rounded.toString();
}

/**
 * Formats an expression for human-friendly display with proper spacing
 */
export function formatDisplayExpression(expr: string): string {
  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/-/g, ' − ')
    .replace(/\+/g, ' + ')
    .replace(/\s+/g, ' ')
    .trim();
}
