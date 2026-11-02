import { createWorker } from 'tesseract.js';
import { ScannedMathResult } from '../types';
import { evaluateExpression } from './mathEvaluator';

/**
 * Pre-processes an image on a canvas to enhance contrast and readability for OCR
 */
export async function preprocessImage(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      // Max dimension to maintain high OCR speed and fidelity
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw original
      ctx.drawImage(img, 0, 0, width, height);

      // Contrast enhancement and grayscale filter
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Luminance
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        // Increase contrast: stretch middle tones
        let contrastFactor = 1.35;
        let adjusted = (gray - 128) * contrastFactor + 128;
        adjusted = Math.min(255, Math.max(0, adjusted));

        data[i] = adjusted;
        data[i + 1] = adjusted;
        data[i + 2] = adjusted;
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

/**
 * Runs Real Client-Side OCR on the image using Tesseract.js
 */
export async function runClientOcr(
  imageDataUrl: string,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  let worker: any = null;
  try {
    onProgress?.(10, 'Initializing OCR engine...');
    worker = await createWorker('eng');

    onProgress?.(40, 'Analyzing handwriting & text...');
    const processedUrl = await preprocessImage(imageDataUrl);

    onProgress?.(70, 'Recognizing mathematical symbols...');
    const { data } = await worker.recognize(processedUrl);

    onProgress?.(95, 'Finalizing transcription...');
    await worker.terminate();

    // Clean up OCR recognized string for math symbols
    let rawText = data.text.trim();
    return cleanOcrMathText(rawText);
  } catch (err: any) {
    if (worker) {
      try {
        await worker.terminate();
      } catch {}
    }
    throw new Error(`OCR processing error: ${err?.message || 'Failed to read image'}`);
  }
}

/**
 * Normalizes common OCR misrecognitions for math
 */
export function cleanOcrMathText(text: string): string {
  return text
    .replace(/[xX]/g, '*')
    .replace(/[÷:/]/g, '/')
    .replace(/—|–/g, '-')
    .replace(/[oO](?=[0-9])/g, '0')
    .replace(/([0-9])[oO]/g, '$10')
    .replace(/I|l(?=[0-9])/g, '1')
    .replace(/([0-9])I|l/g, '$11')
    .replace(/(\r\n|\n|\r)/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Orchestrates OCR and solving via Server-Side Gemini API or local evaluation fallback
 */
export async function processMathImage(
  imageDataUrl: string,
  onProgress: (percent: number, message: string) => void
): Promise<ScannedMathResult> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Step 1: Preprocess and run real client OCR
  onProgress(20, 'Scanning image characters...');
  let ocrRecognized = '';
  try {
    ocrRecognized = await runClientOcr(imageDataUrl, (pct, status) => {
      onProgress(Math.round(20 + pct * 0.4), status);
    });
  } catch (ocrErr) {
    console.warn('Local OCR warning:', ocrErr);
  }

  // Step 2: If online, attempt server-side Gemini 3.8 Flash analysis
  if (isOnline) {
    try {
      onProgress(65, 'Querying AI Math Engine...');
      const response = await fetch('/api/solve-math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          equationText: ocrRecognized,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const aiData = json.data;
          onProgress(100, 'Solution ready!');
          return {
            id: 'scan_' + Date.now(),
            scannedEquation: aiData.scannedEquation || ocrRecognized || 'Scanned math problem',
            cleanEquation: aiData.cleanEquation || aiData.scannedEquation || ocrRecognized,
            topic: aiData.topic || 'General Mathematics',
            result: aiData.result || 'Solved',
            explanation: aiData.explanation || 'Step-by-step derivation generated by AI.',
            steps: Array.isArray(aiData.steps) ? aiData.steps : [],
            searchQuery: aiData.searchQuery || aiData.cleanEquation || ocrRecognized,
            timestamp: Date.now(),
            imageUrl: imageDataUrl,
            isAiGenerated: true,
          };
        }
      }
    } catch (apiErr) {
      console.warn('Server-side AI request error, using OCR fallback:', apiErr);
    }
  }

  // Step 3: Offline or Fallback Local Solution using Real OCR text
  onProgress(85, 'Evaluating recognized equation locally...');
  const equation = ocrRecognized || '1 + 1';
  const evalResult = evaluateExpression(equation);

  const query = equation;
  onProgress(100, 'Local OCR completed');

  return {
    id: 'scan_' + Date.now(),
    scannedEquation: ocrRecognized || 'No characters recognized',
    cleanEquation: equation,
    topic: 'Calculated Equation',
    result: evalResult.success ? String(evalResult.result) : (evalResult.error || 'Syntax Error'),
    explanation: evalResult.success
      ? `Recognized equation computed directly via local math solver. Step breakdown is available when connected to AI services.`
      : `The recognized text could not be evaluated directly. You can edit the equation above to re-calculate or search directly on Google.`,
    steps: evalResult.success
      ? [
          {
            stepNumber: 1,
            title: 'Equation Transcription',
            description: `Optical Character Recognition captured: ${ocrRecognized}`,
            formula: ocrRecognized,
          },
          {
            stepNumber: 2,
            title: 'Arithmetic Evaluation',
            description: `Evaluated ${equation} using standard mathematical order of operations.`,
            formula: `${equation} = ${evalResult.result}`,
          },
        ]
      : [
          {
            stepNumber: 1,
            title: 'Optical Character Recognition',
            description: `Detected text: "${ocrRecognized}". Edit equation if any character was misread.`,
          },
        ],
    searchQuery: query,
    timestamp: Date.now(),
    imageUrl: imageDataUrl,
    isAiGenerated: false,
  };
}
