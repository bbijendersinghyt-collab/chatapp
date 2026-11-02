import { ScannedMathResult, CalculationHistoryItem } from '../types';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  from?: string;
  subject?: string;
  date?: string;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

/**
 * Base64url encoder supporting Unicode/UTF-8 characters
 */
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Constructs an RFC 2822 compliant email message string
 */
function createMimeMessage(to: string, subject: string, body: string, isHtml = false): string {
  const boundary = '____scan_calc_ai_boundary____';
  
  if (isHtml) {
    return [
      `To: ${to}`,
      `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      body.replace(/<[^>]*>/g, ''),
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      body,
      '',
      `--${boundary}--`,
    ].join('\r\n');
  }

  return [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');
}

/**
 * Send an email via Gmail REST API
 */
export async function sendGmailMessage(
  payload: SendEmailPayload,
  accessToken: string
): Promise<{ id: string; threadId: string }> {
  const mime = createMimeMessage(payload.to, payload.subject, payload.body, payload.isHtml);
  const raw = toBase64Url(mime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to send email (${res.status})`);
  }

  return await res.json();
}

/**
 * Save an email as a Gmail draft
 */
export async function createGmailDraft(
  payload: SendEmailPayload,
  accessToken: string
): Promise<{ id: string }> {
  const mime = createMimeMessage(payload.to, payload.subject, payload.body, payload.isHtml);
  const raw = toBase64Url(mime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: { raw },
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create draft (${res.status})`);
  }

  return await res.json();
}

/**
 * List recent messages from the user's Gmail inbox
 */
export async function listRecentGmailMessages(
  accessToken: string,
  maxResults = 8
): Promise<GmailMessageSummary[]> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=category:primary`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch messages (${res.status})`);
  }

  const data = await res.json();
  const messages = data.messages || [];

  if (!messages.length) return [];

  // Fetch header snippets for each message in parallel
  const details = await Promise.all(
    messages.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!detailRes.ok) return null;
        const detailData = await detailRes.json();
        const headers = detailData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: detailData.snippet || '',
          subject,
          from,
          date,
        } as GmailMessageSummary;
      } catch {
        return null;
      }
    })
  );

  return details.filter(Boolean) as GmailMessageSummary[];
}

/**
 * Format math solution for an email report
 */
export function formatMathSolutionEmail(
  solution: ScannedMathResult,
  senderEmail?: string
): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `ScanCalc AI Solution: ${solution.cleanEquation || solution.scannedEquation}`;

  const stepsHtml = (solution.steps || [])
    .map(
      (s, idx) => `
      <li style="margin-bottom: 8px;">
        <strong>Step ${s.stepNumber || idx + 1}: ${s.title}</strong>
        ${s.formula ? `<div style="font-family: monospace; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; margin: 4px 0;">${s.formula}</div>` : ''}
        <div style="color: #475569; font-size: 13px;">${s.description}</div>
      </li>`
    )
    .join('');

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="display: flex; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="margin: 0; color: #0f172a; font-size: 20px;">ScanCalc AI Math Solution</h2>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Topic: ${solution.topic}</span>
        <div style="font-size: 18px; font-weight: bold; font-family: monospace; color: #0f172a; margin-top: 4px;">
          ${solution.cleanEquation || solution.scannedEquation}
        </div>
      </div>

      <div style="background: #ecfeff; border: 1px solid #a5f3fc; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: bold; color: #0891b2; text-transform: uppercase;">Final Answer</div>
        <div style="font-size: 24px; font-weight: bold; color: #0e7490; font-family: monospace; margin: 4px 0;">
          ${solution.result}
        </div>
        <div style="font-size: 14px; color: #334155;">
          ${solution.explanation}
        </div>
      </div>

      ${solution.steps && solution.steps.length > 0 ? `
        <h3 style="font-size: 15px; color: #0f172a; margin-bottom: 8px;">Step-by-Step Derivation</h3>
        <ol style="padding-left: 20px; color: #334155;">
          ${stepsHtml}
        </ol>
      ` : ''}

      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
        Generated and shared with ScanCalc AI for Android & Web
      </div>
    </div>
  `;

  const stepsText = (solution.steps || [])
    .map((s, idx) => `Step ${s.stepNumber || idx + 1}: ${s.title}\n${s.formula ? `Formula: ${s.formula}\n` : ''}${s.description}`)
    .join('\n\n');

  const bodyText = `ScanCalc AI Math Solution\n\nTopic: ${solution.topic}\nProblem: ${solution.cleanEquation || solution.scannedEquation}\n\nFinal Answer: ${solution.result}\nExplanation: ${solution.explanation}\n\n${stepsText}\n\nSent from ScanCalc AI`;

  return { subject, bodyHtml, bodyText };
}

/**
 * Format calculation history for email report
 */
export function formatCalculationHistoryEmail(
  history: CalculationHistoryItem[],
  senderEmail?: string
): { subject: string; bodyHtml: string; bodyText: string } {
  const subject = `ScanCalc AI: Calculation Report (${history.length} items)`;

  const itemsHtml = history
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 8px; font-family: monospace; color: #334155;">${item.expression}</td>
        <td style="padding: 8px; font-family: monospace; font-weight: bold; color: #0284c7;">= ${item.result}</td>
        <td style="padding: 8px; font-size: 11px; color: #94a3b8;">${new Date(item.timestamp).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-top: 0;">ScanCalc AI Calculation Log</h2>
      <p style="color: #64748b; font-size: 13px;">Here is the export of your recent calculations:</p>
      
      <table style="width: 100%; border-collapse: collapse; text-align: left; margin: 16px 0;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="padding: 8px; font-size: 12px; color: #475569;">Expression</th>
            <th style="padding: 8px; font-size: 12px; color: #475569;">Result</th>
            <th style="padding: 8px; font-size: 12px; color: #475569;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
        Generated by ScanCalc AI
      </div>
    </div>
  `;

  const bodyText = history
    .map((item) => `${item.expression} = ${item.result} (${new Date(item.timestamp).toLocaleTimeString()})`)
    .join('\n');

  return { subject, bodyHtml, bodyText: `ScanCalc AI Calculation Log\n\n${bodyText}` };
}
