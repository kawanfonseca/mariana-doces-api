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

# CORS (URL do frontend)
CORS_ORIGIN=https://seu-frontend.vercel.app
```

### 2. Banco de Dados PostgreSQL

⚠️ **IMPORTANTE**: SQLite não funciona no Vercel. Use PostgreSQL.

Opções recomendadas:
- **Vercel Postgres** (integração nativa)
- **Supabase** (gratuito até certo limite)
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
VITE_API_URL=https://seu-api.vercel.app
```

E atualize as configurações de CORS na API para permitir o domínio do frontend.
