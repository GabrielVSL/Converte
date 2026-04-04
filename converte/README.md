# Converte

Sistema de gerenciamento de dados escolares (PEI - Plano Educacional Individualizado). Recebe respostas do Google Forms via n8n, armazena em SQLite e permite consulta, edição, geração de documentos e exportação de dados.

## Funcionalidades

- Recebe dados do Google Forms via webhook (n8n)
- Cadastro, edição e exclusão de registros
- Geração de documentos .docx por aluno
- Exportação de dados (Excel, CSV, ZIP)
- Login por sessão (cookies)
- Interface com filtros por aluno, professor e etapa

## Tecnologias

- [SvelteKit 5](https://svelte.dev/) com runes
- [Tailwind CSS 4](https://tailwindcss.com/)
- SQLite ([libsql](https://turso.tech/libsql))
- [docxtemplater](https://docxtemplater.com/) + [PizZip](https://pizzip.com/)
- [Papa Parse](https://www.papaparse.com/), [JSZip](https://stuk.github.io/jszip/), [SheetJS/xlsx](https://sheetjs.com/)
- [axios](https://axios-http.com/)

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev

# open http://localhost:5173
```

## Build

```bash
npm run build

# preview da build
npm run preview
```

## Deploy

O projeto inclui `Dockerfile` e `docker-compose.yml`. Veja [DEPLOY.md](DEPLOY.md) para instruções detalhadas de deploy no servidor CasaOS.

## Estrutura

```
├── src/
│   ├── lib/
│   │   ├── components/    # Componentes Svelte (Header, Sidebar, Modal, etc)
│   │   ├── server/
│   │   │   └── db.ts      # Cliente SQLite
│   │   └── utils/
│   │       └── excel.ts   # Funções de exportação
│   └── routes/
│       ├── +page.svelte           # Página principal
│       ├── +layout.svelte         # Layout base
│       ├── login/
│       │   ├── +page.svelte       # Tela de login
│       │   └── +page.server.ts    # Autenticação
│       └── api/respostas/
│           └── +server.ts         # CRUD da tabela respostas
├── data/                   # Banco SQLite (ignorado no git)
├── Dockerfile
├── docker-compose.yml
└── DEPLOY.md
```
