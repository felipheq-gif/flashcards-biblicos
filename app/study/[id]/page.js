'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function Study() {
  const { id } = useParams();
  const [queue, setQueue] = useState(null);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(0);

  useEffect(() => {
    fetch('/api/study?deckId=' + id).then((r) => r.json()).then(setQueue);
  }, [id]);

  async function grade(g) {
    const card = queue[0];
    fetch('/api/study', { method: 'POST', body: JSON.stringify({ id: card.id, grade: g }) });
    setShown(false);
    setDone((n) => n + 1);
    setQueue((q) => (g === 0 ? [...q.slice(1), card] : q.slice(1)));
  }

  if (!queue) return <p className="muted">Carregando…</p>;

  const card = queue[0];
  return (
    <>
      <p><a href="/">← Decks</a></p>
      {!card ? (
        <div className="box">
          <h1>{done ? 'Sessão concluída' : 'Nada para revisar agora'}</h1>
          <p className="muted">{done ? `Você revisou ${done} cards.` : 'Volte mais tarde ou crie novos cards.'}</p>
        </div>
      ) : (
        <>
          <p className="muted">{queue.length} restantes</p>
          <div className="box card" onClick={() => setShown(true)} role="button" tabIndex={0}
               onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setShown(true)}>
            {card.theme && <div className="tag">{card.theme}</div>}
            <div>{shown ? card.back : card.front}</div>
            {shown && card.ref && <div className="ref">{card.ref}</div>}
            {!shown && <div className="tag" style={{ marginTop: 18 }}>Toque para ver a resposta</div>}
          </div>
          {shown && (
            <div className="grades">
              <button className="g0" onClick={() => grade(0)}>Errei</button>
              <button className="g1" onClick={() => grade(1)}>Difícil</button>
              <button className="g2" onClick={() => grade(2)}>Bom</button>
              <button className="g3" onClick={() => grade(3)}>Fácil</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
