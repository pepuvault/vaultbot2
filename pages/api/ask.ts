import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokenStats } from '../../lib/getTokenStats';

// Regex zum Erkennen von Token-Symbolen (z. B. "$Vault", "$PEPU")
const tokenRegex = /\$[A-Za-z0-9]+/g;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { question } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!question || !OPENAI_API_KEY) {
    return res.status(400).json({ answer: 'Fehlende Frage oder OpenAI API Key.' });
  }

  // Extrahiere die Token-Symbole aus der Frage (z. B. "$Vault", "$PEPU")
  const mentionedTokens = (question.match(tokenRegex) || []).map(token => token.slice(1).toLowerCase()); // Token-Namen ohne '$'

  if (mentionedTokens.length === 0) {
    return res.status(400).json({ answer: 'Keine unterstützten Token in der Frage gefunden.' });
  }

  let context = '📡 Live Onchain Daten:\n';

  // Hole Onchain-Daten für jedes erkannte Token
  for (const tokenName of mentionedTokens) {
    try {
      const tokenData = await getTokenStats(tokenName);

      if (!tokenData) {
        context += `\n$${tokenName.toUpperCase()} → ⚠️ Keine Daten gefunden.`;
        continue;
      }

      context += `\n$${tokenName.toUpperCase()} → Preis in PEPU: ${tokenData.priceInPEPU.toFixed(6)} | Pool: ${tokenData.poolAddress}`;
    } catch (err: any) {
      context += `\n$${tokenName.toUpperCase()} → ⚠️ Fehler: ${err.message}`;
    }
  }

  const prompt = `${context}\n\nFrage: ${question}`;

  try {
    const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein Onchain-Analyst-Bot für Krypto. Nutze nur die gelieferten Zahlen im Kontext und spekuliere nicht.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    // Überprüfe, ob die GPT-Antwort erfolgreich war
    if (!gptRes.ok) {
      throw new Error(`GPT API Error: ${gptRes.statusText}`);
    }

    const gptJson = await gptRes.json();
    const answer = (gptJson.choices?.[0]?.message?.content as string) || 'Fehler: Keine GPT-Antwort erhalten.';
    res.status(200).json({ answer });
  } catch (err: any) {
    console.error('❌ Fehler bei GPT-Abfrage:', err);
    res.status(500).json({ answer: `GPT-Fehler: ${err.message}` });
  }
}

}
