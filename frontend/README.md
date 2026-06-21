# Frontend - SURTE

Aplicação SPA para interação dos produtores e jornalistas com o sistema SURTE.

## Stack Principal
- React (JavaScript / JSX)
- Tailwind CSS
- Axios para chamadas à API
- React Router para navegação

## Como Rodar

```bash
cd frontend
npm install
npm run dev
```

## Estrutura do Projeto
- `src/components/` - componentes reutilizáveis (incluindo `ui/` e `figma/`)
- `src/pages/` - páginas/rotas principais
- `src/services/api.js` - cliente HTTP (Axios) pré-configurado
- `src/styles/` - arquivos de estilização global e tema do sistema
- `src/App.jsx` - componente central da aplicação SPA
- `src/main.jsx` - ponto de entrada do React

## Notas
- Configure a URL da API no cliente através da variável de ambiente `VITE_API_URL` (padrão `http://localhost:8000`).
- Consulte o README raiz para a visão geral do projeto: [../README.md](../README.md)
