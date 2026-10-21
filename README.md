# Flashcards Bíblicos

Site pessoal (Next.js + Neon Postgres + Claude) que transforma PDFs de estudo em flashcards com repetição espaçada, sincronizado entre computador e celular.

## Como publicar

1. **GitHub:** crie um repositório e suba esta pasta (`git init`, `git add .`, `git commit`, `git push`).
2. **Vercel:** *Add New → Project*, importe o repositório.
3. **Banco:** no projeto da Vercel, aba *Storage → Create → Neon (Postgres)*. Isso cria a variável `DATABASE_URL` automaticamente.
4. **Tabelas:** abra o SQL Editor do Neon e execute o conteúdo de `schema.sql`.
5. **Variáveis de ambiente** (Settings → Environment Variables):
   - `ANTHROPIC_API_KEY`: sua chave em console.anthropic.com
   - `APP_PASSWORD`: a senha que você vai digitar em cada aparelho
   - `ANTHROPIC_MODEL` (opcional): padrão `claude-sonnet-5-5`
6. **Redeploy** para aplicar as variáveis.
7. **Celular:** abra o site, entre com a senha e use *Adicionar à tela inicial*.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha os valores
npm run dev
```

Em `http://localhost` o cookie de login com `secure: true` pode não ser aceito por alguns navegadores. Para testar localmente, troque por `secure: false` em `app/api/login/route.js` (e volte antes de publicar).

## Observações

- O texto do PDF é extraído no navegador e enviado em blocos de ~7.000 caracteres, para evitar limites de tamanho e de tempo da Vercel.
- PDFs escaneados (só imagem) não têm texto extraível; nesse caso o app avisa.
- Repetição espaçada: algoritmo SM-2 simplificado, em `app/api/study/route.js`.
- Cards errados voltam na mesma sessão e ficam devidos em 10 minutos.
