# Frontend - SURTE

Aplicação SPA para interação dos produtores e jornalistas com o sistema SURTE.

Stack principal:
- React
- Tailwind CSS
- Axios para chamadas à API
- React Router para navegação

Como rodar (exemplo):

```bash
cd frontend
npm install
npm run dev
```

Estrutura sugerida:
- `src/components/` - componentes reutilizáveis
- `src/pages/` - páginas/rotas principais
- `src/services/api.js` - cliente HTTP (Axios)

Notas:
- Configure a URL da API no cliente (ex.: variável de ambiente `VITE_API_URL`).
- Consulte o README raiz para a visão geral do projeto: ../README.md
