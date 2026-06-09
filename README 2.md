# Avistamento

App full-stack para registrar avistamentos da fauna. Backend Node.js/Express com armazenamento local em JSON e mídia em disco; frontend em HTML/CSS/JS puro.

Sem `.env`, sem JWT, sem bcrypt. Auth simples no cliente (localStorage), validações no front com avisos.

## Rodar

```bash
cd backend
yarn install
yarn start
```

Acesse http://localhost:3000

## Funcionalidades

- Cadastro/login no próprio navegador (localStorage) — sem servidor de auth
- Mural com layout masonry
- Upload com validação no cliente (jpg/png/webp/mp4, ≤25MB, até 5 arquivos)
- Botão **Sair** funcional no topo (limpa sessão e volta ao login)
- Nomes de arquivo anonimizados (UUID) e escrita atômica do JSON no backend

## Estrutura

```
avistamento/
├── backend/
│   ├── server.js
│   ├── routes/records.js
│   ├── middleware/store.js
│   ├── data/records.json
│   └── uploads/
└── frontend/
    ├── index.html  mural.html  upload.html
    ├── css/styles.css
    └── js/{api,auth,mural,upload}.js
```
