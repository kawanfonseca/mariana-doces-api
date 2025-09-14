# Configuração de Ambiente

## Variáveis de Ambiente Necessárias

### Para Desenvolvimento Local
Crie um arquivo `.env` na raiz do projeto com:

```env
# Database (Supabase - com pooling para melhor performance)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# iFood
IFOOD_FEE_PERCENT="25"

# Environment
NODE_ENV="development"
```

### Para Produção (Vercel)

Configure as seguintes variáveis de ambiente no painel do Vercel:

1. **DATABASE_URL**: URL de conexão com pooling (Supabase)
2. **DIRECT_URL**: URL de conexão direta (Supabase)
3. **JWT_SECRET**: Chave secreta para JWT (use uma string longa e aleatória)
4. **IFOOD_FEE_PERCENT**: Percentual da taxa do iFood (ex: "25")
5. **NODE_ENV**: "production"

## Configuração do Banco de Dados

### Opção 1: Supabase (Recomendado)
1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie as duas URLs:
   - **Connection pooling** (para DATABASE_URL)
   - **Connection string** (para DIRECT_URL)
5. Configure ambas no Vercel

**Exemplo das URLs:**
- DATABASE_URL: `postgresql://postgres.abc123:senha@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- DIRECT_URL: `postgresql://postgres:senha@db.abc123.supabase.co:5432/postgres`

### Opção 2: PostgreSQL Local
1. Instale PostgreSQL
2. Crie um banco chamado `mariana_doces`
3. Configure a URL de conexão

## Migração do Banco

Após configurar o PostgreSQL, execute:

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma db push

# (Opcional) Popular com dados iniciais
npx prisma db seed
```

## Deploy no Vercel

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático será feito
