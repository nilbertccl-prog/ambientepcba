# Estudos PCBA 2026 · versão Vercel com login Google

Frontend estático (`public/`) + funções serverless (`api/`). Os dados de cada aluno ficam no **Google Drive dele**, na pasta oculta do app (escopo `drive.appdata`). Não há banco de dados nem dependências npm.

## 1. Google Cloud Console
1. Crie um projeto em console.cloud.google.com e ative a **Google Drive API**.
2. Tela de consentimento OAuth: tipo Externo; escopos `openid`, `email`, `profile` e `.../auth/drive.appdata`. Em modo "Teste", adicione os e-mails dos alunos como usuários de teste; para liberar a todos, publique o app.
3. Credenciais > Criar ID do cliente OAuth > **Aplicativo da Web**. URIs de redirecionamento autorizados:
   - `https://SEU-APP.vercel.app/api/auth/callback`
   - `http://localhost:3000/api/auth/callback` (para testes locais)

## 2. Vercel
1. Suba esta pasta para um repositório no GitHub e importe no Vercel (Framework: Other).
2. Em Settings > Environment Variables, defina as variáveis de `.env.example`.
3. Faça o deploy e, se mudar o domínio, atualize o redirecionamento no Google e `APP_URL`.

Teste local: `npm i -g vercel`, copie `.env.example` para `.env`, rode `vercel dev`.

## Como funciona
- `/api/auth/login` e `/api/auth/callback`: fluxo OAuth com código; o refresh token vai criptografado (AES-256-GCM) em cookie HttpOnly de 30 dias.
- `/api/data` (GET/PUT): lê e grava `estudos-pcba-2026.json` no Drive do usuário.
- `/api/me` e `/api/auth/logout`: sessão.
- O app salva 1,5 s após cada mudança e mantém cópia local como reserva.

Créditos de conteúdo: professor Nilberte Lima (@simplesmentenil).
