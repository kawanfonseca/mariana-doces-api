# Guia de Deploy no Vercel

## 🚨 Problema Resolvido

O erro que você estava enfrentando:
```
error: Error validating datasource `db`: the URL must start with the protocol `file:`.
```

Foi causado porque o Vercel não suporta SQLite. Agora o projeto está configurado para usar PostgreSQL.

## 📋 Passos para Deploy

### 1. Configurar Banco de Dados

**Opção A: Supabase (Recomendado)**
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta e um novo projeto
3. Vá em Settings > Database
4. Copie as duas URLs:
   - **Connection pooling**: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Connection string**: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

**Opção B: Neon (Alternativa)**
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta e um novo projeto
3. Copie a connection string

### 2. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em Settings > Environment Variables e adicione:

```
DATABASE_URL = postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
JWT_SECRET = sua-chave-secreta-super-longa-e-aleatoria
IFOOD_FEE_PERCENT = 25
NODE_ENV = production
```

### 3. Deploy

1. Faça commit das mudanças:
```bash
git add .
git commit -m "Migrate to PostgreSQL for Vercel deployment"
git push
```

2. O Vercel fará o deploy automaticamente

### 4. Verificar Deploy

Após o deploy, teste a API:
```bash
curl https://sua-api.vercel.app/api/health
```

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco
npx prisma db push

# Verificar conexão
npm run db:setup

# Popular banco com dados iniciais
npm run prisma:seed
```

## 🐛 Troubleshooting

### Erro de Conexão
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está acessível publicamente
- Teste a conexão com `npm run db:setup`

### Erro de Build
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o PostgreSQL está nas dependências

### Erro de Migração
- Execute `npx prisma db push` localmente primeiro
- Verifique se o schema está correto

## 📝 Notas Importantes

- O Vercel é serverless, então não mantém estado entre execuções
- Use `prisma db push` em vez de `prisma migrate` para simplicidade
- O banco deve estar acessível publicamente (não localhost)
- Sempre use HTTPS em produção
