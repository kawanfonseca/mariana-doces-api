# Deploy no Vercel - Mariana Doces API

## 📋 Configurações Necessárias

### 1. Variáveis de Ambiente no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

```env
# Database (PostgreSQL obrigatório para produção)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Configurações de negócio
IFOOD_FEE_PERCENT=25
DEFAULT_LABOR_RATE_PER_HOUR=20.00

# Server
NODE_ENV=production

# CORS (URL do frontend) - OPCIONAL
# A API já está configurada para aceitar mariana-doces-app.vercel.app
CORS_ORIGIN=https://mariana-doces-app.vercel.app
```

### 2. Banco de Dados PostgreSQL

⚠️ **IMPORTANTE**: SQLite não funciona no Vercel. Use PostgreSQL.

#### Opção Recomendada: Supabase
1. Crie conta em [supabase.com](https://supabase.com)
2. Crie novo projeto com região São Paulo
3. Copie a string de conexão PostgreSQL
4. Siga o guia completo em `SUPABASE_SETUP.md`

#### Outras Opções:
- **Vercel Postgres** (integração nativa)
- **Railway** (PostgreSQL gerenciado)
- **Neon** (PostgreSQL serverless)

### 3. Configuração do Build

O projeto já está configurado com:
- ✅ `vercel.json` configurado
- ✅ Build command: `npm run build && npm run prisma:generate`
- ✅ Endpoint serverless em `/api/index.js`
- ✅ `.vercelignore` para otimizar deployment

### 4. Migrações do Banco

Após configurar o PostgreSQL, execute as migrações:

```bash
# Localmente, com DATABASE_URL configurada
npx prisma migrate deploy
npx prisma generate
```

Ou use o Prisma Data Platform para gerenciar migrações automaticamente.

### 5. Estrutura de Deploy

```
mariana-doces-api/
├── api/
│   └── index.js          # Entry point para Vercel Functions
├── dist/                 # Código TypeScript compilado
├── vercel.json          # Configuração do Vercel
├── .vercelignore        # Arquivos ignorados no deploy
└── package.json         # Dependências e scripts
```

## 🚀 Passos para Deploy

1. **Conecte o repositório ao Vercel**
2. **Configure as variáveis de ambiente**
3. **Configure o banco PostgreSQL**
4. **Execute o primeiro deploy**
5. **Teste os endpoints**

## 🔗 Endpoints da API

Após o deploy, a API estará disponível em:
- `https://seu-projeto.vercel.app/health` - Health check
- `https://seu-projeto.vercel.app/api/auth/login` - Login
- `https://seu-projeto.vercel.app/api/products` - Produtos
- etc.

## 🐛 Troubleshooting

### Erro de Database
- Verifique se `DATABASE_URL` está configurada corretamente
- Confirme que o PostgreSQL está acessível
- Execute as migrações: `npx prisma migrate deploy`

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme que o TypeScript compila: `npm run build`
- Verifique se o Prisma está gerando os tipos: `npm run prisma:generate`

### Timeout de Function
- Funções Vercel têm limite de 10s (Hobby) ou 30s (Pro)
- Otimize queries do banco de dados
- Use conexão pooling para PostgreSQL

## 📱 Integrando com Frontend

No frontend (`mariana-doces-app`), configure a variável:

```env
VITE_API_URL=https://mariana-doces-api.vercel.app
```

### 🔧 Configuração de CORS

A API já está configurada para aceitar requisições dos seguintes domínios:
- `https://mariana-doces-app.vercel.app` (produção)
- `http://localhost:3000` (desenvolvimento)
- `http://localhost:5173` (Vite dev server)

Se você precisar adicionar outros domínios, edite o arquivo `src/server.ts` na lista `allowedOrigins`.

### 🐛 Solução de Problemas de CORS

Se você receber erros de CORS como:
```
Access to XMLHttpRequest at 'https://mariana-doces-api.vercel.app/api/auth/login' 
from origin 'https://mariana-doces-app.vercel.app' has been blocked by CORS policy
```

**✅ SOLUÇÃO**: A API já está configurada para aceitar requisições do frontend. O problema foi resolvido com:

1. **Configuração CORS atualizada** em `src/server.ts` para aceitar `https://mariana-doces-app.vercel.app`
2. **Deploy da API** - faça um novo deploy para aplicar as mudanças
3. **Teste o endpoint `/health`**: `https://mariana-doces-api.vercel.app/health`

**🔧 Se precisar adicionar outros domínios**, edite a lista `allowedOrigins` em `src/server.ts`:
```typescript
const allowedOrigins = [
  'https://mariana-doces-app.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://seu-novo-dominio.com' // Adicione aqui
];
```
