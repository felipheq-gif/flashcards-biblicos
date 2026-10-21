import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await sql`
    SELECT d.id, d.name,
           COUNT(c.id)::int AS total,
           (COUNT(c.id) FILTER (WHERE c.due <= now()))::int AS due
    FROM decks d LEFT JOIN cards c ON c.deck_id = d.id
    GROUP BY d.id ORDER BY d.id DESC`;
  return NextResponse.json(rows);
}

export async function POST(req) {
  const { name } = await req.json();
  const [row] = await sql`INSERT INTO decks (name) VALUES (${name || 'Sem título'}) RETURNING id`;
  return NextResponse.json(row);
}

export async function DELETE(req) {
  const id = Number(new URL(req.url).searchParams.get('id'));
  await sql`DELETE FROM decks WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
