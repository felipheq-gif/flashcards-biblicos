'use client';
import { useEffect, useState } from 'react';

const CHUNK = 7000;

async function extractChunks(file) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const chunks = [];
  let cur = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    cur += content.items.map((x) => x.str).join(' ') + '\n';
    if (cur.length >= CHUNK) { chunks.push(cur); cur = ''; }
  }
  if (cur.trim().length > 200) chunks.push(cur);
  return chunks;
}

export default function Home() {
  const [decks, setDecks] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const load = () => fetch('/api/decks').then((r) => r.json()).then(setDecks);
  useEffect(() => { load(); }, []);

  async function generate(e) {
    e.preventDefault();
    if (!file) return;
    setError('');
    try {
      setProgress({ done: 0, total: 1, msg: 'Lendo o PDF…' });
      const chunks = await extractChunks(file);
      if (!chunks.length) throw new Error('Não encontrei texto no PDF (talvez seja escaneado).');
      const deck = await (await fetch('/api/decks', { method: 'POST', body: JSON.stringify({ name: name || file.name.replace(/\.pdf$/i, '') }) })).json();
      let added = 0;
      for (let i = 0; i < chunks.length; i++) {
        setProgress({ done: i, total: chunks.length, msg: `Gerando cards: parte ${i + 1} de ${chunks.length} (${added} criados)` });
        const r = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ deckId: deck.id, text: chunks[i] }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Falha ao gerar cards');
        added += d.added;
      }
      setFile(null); setName('');
      setProgress({ done: 1, total: 1, msg: `Pronto: ${added} cards criados.` });
    } catch (err) {
      setError(err.message);
      setProgress(null);
    }
    load();
  }

  async function remove(id) {
    if (!confirm('Apagar este deck e todos os cards?')) return;
    await fetch('/api/decks?id=' + id, { method: 'DELETE' });
    load();
  }

  return (
    <>
      <h1>Flashcards Bíblicos</h1>

      <div className="box">
        {decks === null && <p className="muted">Carregando…</p>}
        {decks?.length === 0 && <p className="muted">Nenhum deck ainda. Envie um PDF abaixo para criar o primeiro.</p>}
        {decks?.map((d) => (
          <div className="deck" key={d.id}>
            <a href={`/study/${d.id}`}>
              {d.name}
              <small>{d.due} para revisar · {d.total} cards</small>
            </a>
            <button className="ghost" onClick={() => remove(d.id)} aria-label={`Apagar ${d.name}`}>Apagar</button>
          </div>
        ))}
      </div>

      <h2>Criar deck a partir de um PDF</h2>
      <form onSubmit={generate} className="box">
        <input type="text" placeholder="Nome do deck (opcional)" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" disabled={!file || (progress && progress.done < progress.total)}>Gerar flashcards</button>
        {progress && (
          <>
            <div className="bar"><i style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
            <p className="muted">{progress.msg}</p>
          </>
        )}
        {error && <p className="err">{error}</p>}
      </form>
    </>
  );
}
