'use client';
import { useState } from 'react';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function enter(e) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify({ password }) });
    if (r.ok) window.location.href = '/';
    else setError('Senha incorreta. Tente de novo.');
  }

  return (
    <>
      <h1>Flashcards Bíblicos</h1>
      <form onSubmit={enter} className="box">
        <label htmlFor="pw">Senha</label>
        <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
        {error && <p className="err">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </>
  );
}
