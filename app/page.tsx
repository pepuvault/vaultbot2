'use client';
import { useState } from 'react';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setLoading(true);
    setAnswer('');
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl mb-4">🧠 Willkommen bei VaultAI</h1>
      <p className="mb-6">Stelle deine Frage zu $Vault – Preis, Volumen oder Onchain-Analyse.</p>
      <input
        className="w-full p-2 text-black rounded mb-4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="z. B. Wie ist der $Vault Preis?"
      />
      <button
        onClick={askQuestion}
        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        disabled={loading}
      >
        {loading ? 'Wird geladen…' : 'Frage stellen'}
      </button>
      <div className="mt-6 whitespace-pre-wrap">{answer}</div>
    </main>
  );
}
