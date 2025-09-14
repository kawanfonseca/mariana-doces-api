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

1. **DATABASE_URL**: URL de conexão do PostgreSQL (recomendado: Supabase)
2. **JWT_SECRET**: Chave secreta para JWT (use uma string longa e aleatória)
3. **IFOOD_FEE_PERCENT**: Percentual da taxa do iFood (ex: "25")
4. **NODE_ENV**: "production"

## Configuração do Banco de Dados

### Opção 1: Supabase (Recomendado)
1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a connection string do banco
4. Configure como `DATABASE_URL` no Vercel

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
