import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const id = Number(new URL(req.url).searchParams.get('deckId'));
  const rows = await sql`
    SELECT id, front, back, ref, theme FROM cards
    WHERE deck_id = ${id} AND due <= now()
    ORDER BY due LIMIT 30`;
  return NextResponse.json(rows);
}

// grade: 0 errei, 1 difícil, 2 bom, 3 fácil (SM-2 simplificado)
export async function POST(req) {
  const { id, grade } = await req.json();
  const [c] = await sql`SELECT interval_days, ease, reps, lapses FROM cards WHERE id = ${id}`;
  if (!c) return NextResponse.json({ error: 'Card não encontrado' }, { status: 404 });

  let { interval_days: iv, ease, reps, lapses } = c;
  let minutes;
  if (grade === 0) {
    reps = 0; lapses += 1; iv = 0; ease = Math.max(1.3, ease - 0.2); minutes = 10;
  } else {
    if (grade === 1) { iv = Math.max(1, Math.round(iv * 1.2)); ease = Math.max(1.3, ease - 0.15); }
    if (grade === 2) { iv = reps === 0 ? 1 : reps === 1 ? 3 : Math.round(iv * ease); }
    if (grade === 3) { iv = reps === 0 ? 3 : Math.round(Math.max(iv, 1) * ease * 1.3); ease += 0.15; }
    reps += 1;
    minutes = iv * 1440;
  }
  await sql`UPDATE cards SET interval_days = ${iv}, ease = ${ease}, reps = ${reps}, lapses = ${lapses},
            due = now() + (${minutes}::int * interval '1 minute') WHERE id = ${id}`;
  await sql`INSERT INTO reviews (card_id, grade) VALUES (${id}, ${grade})`;
  return NextResponse.json({ ok: true });
}
