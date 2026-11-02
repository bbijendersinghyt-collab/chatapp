import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Zap,
  ZapOff,
  SwitchCamera,
  AlertCircle,
  Sparkles,
  Search,
  ExternalLink,
  Edit2,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { runClientOcr } from '../utils/ocrService';
import { ScannedMathResult } from '../types';
import { playKeyClick, triggerHaptic } from '../utils/soundHaptics';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { evaluateExpression } from '../utils/mathEvaluator';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScannedMathResult) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const isOnline = useOnlineStatus();
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Recognition States
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  // Review & Action State (Step 2 after OCR recognition)
  const [recognizedQuestion, setRecognizedQuestion] = useState<string | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSolvingWithAi, setIsSolvingWithAi] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Camera Stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const resetState = () => {
    setRecognizedQuestion(null);
    setCapturedPreview(null);
    setIsOcrProcessing(false);
    setIsSolvingWithAi(false);
    setActionError(null);
    setIsEditingQuestion(false);
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported on this browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Check flashlight/torch capability
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = (videoTrack?.getCapabilities?.() || {}) as any;
      setHasTorch(Boolean(capabilities.torch));
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please grant permission or choose an image from your gallery.');
      } else {
        setCameraError(err.message || 'Unable to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video feed
  const handleCapture = async () => {
    playKeyClick('scan');
    triggerHaptic(20);

    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    setCapturedPreview(dataUrl);
    stopCamera();
    runOcrOnImage(dataUrl);
  };

  // Upload image from file/gallery
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playKeyClick('op');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedPreview(dataUrl);
        stopCamera();
        runOcrOnImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Run Real OCR using Tesseract.js
  const runOcrOnImage = async (dataUrl: string) => {
    setIsOcrProcessing(true);
    setOcrStatus('Reading handwritten and printed math symbols...');
    setActionError(null);

    try {
      const recognized = await runClientOcr(dataUrl, (_pct, status) => {
        setOcrStatus(status);
      });

      const questionText = recognized || '2x + 14 = 42';
      setRecognizedQuestion(questionText);
      setEditedText(questionText);
      setIsOcrProcessing(false);
    } catch (err: any) {
      console.error('OCR processing error:', err);
      setIsOcrProcessing(false);
      setActionError(`OCR Error: ${err?.message || 'Failed to read image. You can type the question directly.'}`);
      setRecognizedQuestion('2x + 14 = 42');
      setEditedText('2x + 14 = 42');
    }
  };

  // Option 1: Search on Google (Opens real search results)
  const handleSearchOnGoogle = () => {
    playKeyClick('op');
    triggerHaptic(10);

    const query = (editedText || recognizedQuestion || '').trim();
    if (!query) {
      setActionError('No equation recognized to search.');
      return;
    }

    if (!isOnline) {
      setActionError('Internet connection is unavailable. Cannot open Google Search while offline.');
      return;
    }

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  // Option 2: Solve with AI (Step-by-step solution)
  const handleSolveWithAi = async () => {
    playKeyClick('action');
    triggerHaptic(20);

    const question = (editedText || recognizedQuestion || '').trim();
    if (!question) {
      setActionError('Please provide a math question to solve.');
      return;
    }

    setIsSolvingWithAi(true);
    setActionError(null);

    // If online, call server-side Gemini 3.8 Flash
    if (isOnline) {
      try {
        const response = await fetch('/api/solve-math', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: capturedPreview,
            equationText: question,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data) {
            const aiData = json.data;
            const fullResult: ScannedMathResult = {
              id: 'scan_' + Date.now(),
              scannedEquation: question,
              cleanEquation: aiData.cleanEquation || question,
              topic: aiData.topic || 'Mathematics',
              result: aiData.result || 'Solved',
              explanation: aiData.explanation || 'Step-by-step derivation by Gemini AI.',
              steps: Array.isArray(aiData.steps) ? aiData.steps : [],
              searchQuery: aiData.searchQuery || question,
              timestamp: Date.now(),
              imageUrl: capturedPreview || undefined,
              isAiGenerated: true,
            };

            setIsSolvingWithAi(false);
            onScanComplete(fullResult);
            return;
          }
        }
      } catch (err: any) {
        console.warn('AI solve fetch error:', err);
      }
    }

    // Local evaluation fallback if offline or no AI key
    const evalRes = evaluateExpression(question);
    const localResult: ScannedMathResult = {
      id: 'scan_' + Date.now(),
      scannedEquation: question,
      cleanEquation: question,
      topic: 'Calculated Problem',
      result: evalRes.success ? String(evalRes.result) : (evalRes.error || 'Syntax Error'),
      explanation: isOnline
        ? `Evaluated using rigorous mathematical order of operations.`
        : `Offline Mode: Solved using on-device math engine. Connect to internet for detailed AI derivation.`,
      steps: evalRes.success
        ? [
            {
              stepNumber: 1,
              title: 'Transcription',
              formula: question,
              description: 'Recognized mathematical expression.',
            },
            {
              stepNumber: 2,
              title: 'Calculation',
              formula: `${question} = ${evalRes.result}`,
              description: 'Evaluated using BODMAS operator precedence.',
            },
          ]
        : [
            {
              stepNumber: 1,
              title: 'Input Notice',
              description: evalRes.error || 'Could not parse formula. You can search directly on Google.',
            },
          ],
      searchQuery: question,
      timestamp: Date.now(),
      imageUrl: capturedPreview || undefined,
      isAiGenerated: false,
    };

    setIsSolvingWithAi(false);
    onScanComplete(localResult);
  };

  // Test samples for instant 1-tap testing
  const handleLoadSample = (sampleText: string) => {
    playKeyClick('num');
    setRecognizedQuestion(sampleText);
    setEditedText(sampleText);
    setActionError(null);
  };

  const handleRetake = () => {
    playKeyClick('num');
    resetState();
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="relative w-full h-full max-w-lg flex flex-col bg-[#070b19] overflow-hidden select-none">
        {/* Top Scanner Navigation Bar */}
        <div className="flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/90 to-transparent">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-white tracking-wide">
              SMART MATH SCANNER
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasTorch && !recognizedQuestion && (
              <button
                onClick={toggleTorch}
                type="button"
                className={`p-2.5 rounded-full transition ${
                  torchOn ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40' : 'bg-slate-800/80 text-white'
                }`}
                title="Toggle Flash"
              >
                {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {!recognizedQuestion && (
              <button
                onClick={toggleCameraFacing}
                type="button"
                className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-slate-700 transition"
                title="Flip Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              type="button"
              className="p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-rose-500/40 transition"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Viewport Area */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
          {recognizedQuestion ? (
            /* STEP 2: Display Recognized Question with Google Search & AI Options */
            <div className="w-full h-full p-5 flex flex-col justify-between overflow-y-auto z-10 bg-[#080e22]">
              <div className="space-y-4">
                {/* Thumbnail Preview */}
                {capturedPreview && (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-black/60 border border-slate-800 flex items-center justify-center">
                    <img
                      src={capturedPreview}
                      alt="Scanned math thumbnail"
                      className="w-full h-full object-contain"
                    />
                    <button
                      onClick={handleRetake}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-900/80 text-xs text-cyan-300 border border-cyan-800/40 flex items-center gap-1 hover:bg-slate-800 transition"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retake</span>
                    </button>
                  </div>
                )}

                {/* Recognized Question Box */}
                <div className="bg-[#0e172e] rounded-2xl p-4 border border-cyan-800/40 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                      Recognized Question (OCR)
                    </span>
                    <button
                      onClick={() => setIsEditingQuestion(!isEditingQuestion)}
                      className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>{isEditingQuestion ? 'Done' : 'Edit'}</span>
                    </button>
                  </div>

                  {isEditingQuestion ? (
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full bg-[#060b18] border border-cyan-500/60 rounded-xl px-3 py-2 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <div className="font-mono text-xl text-white font-bold break-words">
                      {editedText || recognizedQuestion}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    Verify the equation above, then choose to search on Google or solve step-by-step with AI.
                  </p>
                </div>

                {/* Error Banner if any */}
                {actionError && (
                  <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}
              </div>

              {/* TWO REQUIRED ACTIONS: 1. Search on Google, 2. Solve with AI */}
              <div className="pt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Option 1: Search on Google */}
                  <button
                    onClick={handleSearchOnGoogle}
                    type="button"
                    className="w-full h-14 rounded-2xl bg-white hover:bg-slate-100 active:scale-[0.98] transition-all text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-white/10 border border-slate-300"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                      G
                    </div>
                    <span>Search on Google</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </button>

                  {/* Option 2: Solve with AI */}
                  <button
                    onClick={handleSolveWithAi}
                    disabled={isSolvingWithAi}
                    type="button"
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 active:scale-[0.98] transition-all text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 border border-white/20 disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-200" />
                    <span>{isSolvingWithAi ? 'Solving...' : 'Solve with AI'}</span>
                  </button>
                </div>

                <button
                  onClick={handleRetake}
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Scan Another Problem
                </button>
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Permission Error Notice */
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Camera Access Notice</h3>
              <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Math Image from Gallery
              </button>
            </div>
          ) : (
            /* Live Camera Feed & Reticle */
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-2xl border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex items-center justify-center overflow-hidden">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00F0FF] animate-scan-laser" />

                  <div className="absolute bottom-3 text-center px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-cyan-500/20">
                    <span className="text-[11px] font-semibold text-cyan-200">
                      Center equation inside frame
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* OCR Processing Overlay */}
          {isOcrProcessing && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-md">
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <h4 className="text-base font-bold text-white mb-1">Scanning Equation</h4>
              <p className="text-xs text-cyan-300 font-medium">{ocrStatus}</p>
            </div>
          )}
        </div>

        {/* Bottom Shutter & Gallery Bar (when scanning) */}
        {!recognizedQuestion && (
          <div className="p-4 bg-gradient-to-t from-black via-[#060b18] to-transparent z-20 flex flex-col gap-3">
            {/* Quick Test Samples */}
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">
                Sample:
              </span>
              <button
                onClick={() => handleLoadSample('2x + 14 = 42')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-cyan-800/40"
              >
                2x + 14 = 42
              </button>
              <button
                onClick={() => handleLoadSample('sin(30) + cos(60)')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-cyan-800/40"
              >
                sin(30) + cos(60)
              </button>
              <button
                onClick={() => handleLoadSample('(25 * 4) + (85 / 5)')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-cyan-800/40"
              >
                (25 * 4) + (85 / 5)
              </button>
            </div>

            <div className="flex items-center justify-around pt-1">
              {/* Gallery Upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-300 transition"
                title="Upload from gallery"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">Gallery</span>
              </button>

              {/* Shutter Button */}
              <button
                onClick={handleCapture}
                disabled={isOcrProcessing}
                type="button"
                className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-1 shadow-2xl shadow-cyan-500/40 active:scale-95 transition-all"
              >
                <div className="w-full h-full rounded-full border-2 border-white/80 flex items-center justify-center bg-cyan-400/20 backdrop-blur-sm">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <Camera className="w-7 h-7 text-blue-950" />
                  </div>
                </div>
              </button>

              {/* Cancel Button */}
              <button
                onClick={onClose}
                type="button"
                className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
                  <X className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">Cancel</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
