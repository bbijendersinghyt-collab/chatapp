import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Support larger payload for base64 math images
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Initialize GoogleGenAI if key is present
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Direct APK download redirects
const DIRECT_APK_RELEASE_URL = 'https://github.com/bbijendersinghyt-collab/day-born--apk/releases/latest/download/ScanCalcAI-debug.apk';

app.get('/download-apk', (_req: Request, res: Response) => {
  res.redirect(DIRECT_APK_RELEASE_URL);
});

app.get('/api/download-apk', (_req: Request, res: Response) => {
  res.redirect(DIRECT_APK_RELEASE_URL);
});

// Endpoint to check AI configuration
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hasAiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    status: 'online',
    apkDownloadUrl: DIRECT_APK_RELEASE_URL,
    githubRepo: 'bbijendersinghyt-collab/day-born--apk',
  });
});

// Endpoint to solve math problems via Gemini 3.8 Flash
app.post('/api/solve-math', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', equationText } = req.body;

    if (!ai) {
      return res.status(200).json({
        success: false,
        error: 'NO_API_KEY',
        message: 'Google Gemini API key is not configured on the server. Local OCR will be utilized.',
      });
    }

    if (!imageBase64 && !equationText) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Either an image or equation text must be provided.',
      });
    }

    const contents: any[] = [];

    if (imageBase64) {
      // Strip any data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are an expert mathematician and OCR recognition engine.
Carefully examine the handwritten or printed math problem in the image (or provided text: "${equationText || ''}").
Tasks:
1. Accurately transcribe the exact question and equation as recognized (both raw and clean readable format).
2. Categorize the topic (e.g. Arithmetic, Algebra, Calculus, Trigonometry, Geometry, Linear Algebra, Statistics, Physics Math).
3. Compute the rigorous, exact mathematical solution and final numerical or algebraic answer.
4. Provide structured step-by-step explanations walking through the derivation.
5. Provide a succinct search query string suitable for Google Search to find identical or similar problems and theory.

Ensure mathematical precision. If the image is unclear or not a math question, indicate that gracefully.
`;

    contents.push({ text: promptText });

    // 12-second timeout to prevent stalling if external API is slow
    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMath: {
              type: Type.BOOLEAN,
              description: 'Whether a valid math question or equation was identified.',
            },
            scannedEquation: {
              type: Type.STRING,
              description: 'The recognized raw equation or problem statement.',
            },
            cleanEquation: {
              type: Type.STRING,
              description: 'A clean, well-formatted plain text or standard LaTeX representation of the question.',
            },
            topic: {
              type: Type.STRING,
              description: 'Math topic category.',
            },
            result: {
              type: Type.STRING,
              description: 'The exact final answer or simplified solution.',
            },
            explanation: {
              type: Type.STRING,
              description: 'A concise summary explanation of how the answer is derived.',
            },
            steps: {
              type: Type.ARRAY,
              description: 'Step by step derivation.',
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  formula: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'description'],
              },
            },
            searchQuery: {
              type: Type.STRING,
              description: 'Precise search query to look up this problem on Google.',
            },
          },
          required: [
            'isMath',
            'scannedEquation',
            'cleanEquation',
            'topic',
            'result',
            'explanation',
            'steps',
            'searchQuery',
          ],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out after 12s')), 12000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No text returned from Gemini API');
    }

    const parsedData = JSON.parse(responseText);
    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error solving math:', error?.message || error);
    return res.status(200).json({
      success: false,
      error: 'PROCESSING_ERROR',
      message: error?.message || 'Failed to process math problem via AI.',
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const http = await import('http');
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`ScanCalc AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
