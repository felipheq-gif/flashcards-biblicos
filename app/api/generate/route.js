import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const maxDuration = 60;

const PROMPT = `Você é um professor de teologia criando flashcards de estudo bíblico em português do Brasil.
A partir do trecho abaixo, gere de 8 a 15 flashcards. Varie os tipos: quem, o quê, onde, por quê, versículo-chave, conceito, comparação entre textos.
Regras: cada pergunta deve ser clara e independente do trecho; a resposta deve ser curta (1 a 3 frases); preencha "ref" com a referência bíblica quando houver (ex.: "Rm 8:28"), senão deixe vazio; "theme" é um tema de 1 a 3 palavras. Não invente informações que não estejam no trecho.
Responda APENAS com um array JSON: [{"front":"","back":"","ref":"","theme":""}]

TRECHO:
`;

export async function POST(req) {
  const { deckId, text } = await req.json();
  if (!deckId || !text?.trim()) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: PROMPT + text.slice(0, 20000) }],
    }),
  });
  if (!r.ok) return NextResponse.json({ error: 'Erro na API: ' + (await r.text()) }, { status: 502 });

  const data = await r.json();
  const raw = data.content?.[0]?.text || '';
  let cards;
  try {
    cards = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
  } catch {
    return NextResponse.json({ error: 'Resposta fora do formato' }, { status: 502 });
  }
  cards = cards.filter((c) => c.front && c.back);
  if (!cards.length) return NextResponse.json({ added: 0 });

  await sql`
    INSERT INTO cards (deck_id, front, back, ref, theme)
    SELECT ${Number(deckId)}, * FROM unnest(
      ${cards.map((c) => String(c.front))}::text[],
      ${cards.map((c) => String(c.back))}::text[],
      ${cards.map((c) => String(c.ref || ''))}::text[],
      ${cards.map((c) => String(c.theme || ''))}::text[])`;
  return NextResponse.json({ added: cards.length });
}
