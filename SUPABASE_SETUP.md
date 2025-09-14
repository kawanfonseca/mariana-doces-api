# Configuração do Supabase com Prisma

## ✅ Sim, o Prisma funciona perfeitamente com o Supabase!

O Supabase é uma das melhores opções para usar com Prisma em produção. Aqui está o guia completo:

## 🚀 Por que Supabase + Prisma?

- **PostgreSQL nativo**: Supabase usa PostgreSQL, que é totalmente suportado pelo Prisma
- **Pooling de conexões**: Otimizado para ambientes serverless como Vercel
- **Interface visual**: Dashboard para gerenciar dados
- **APIs automáticas**: REST e GraphQL automáticos
- **Real-time**: Suporte a subscriptions em tempo real
- **Auth integrado**: Sistema de autenticação completo

## 📋 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub
4. Clique em "New Project"
5. Escolha sua organização
6. Preencha:
   - **Name**: `mariana-doces-api`
   - **Database Password**: (anote esta senha!)
   - **Region**: Escolha a mais próxima (ex: South America - São Paulo)

### 2. Obter URLs de Conexão

Após criar o projeto:

1. Vá em **Settings** > **Database**
2. Role para baixo até **Connection string**
3. Copie as duas URLs:

**Connection pooling** (para DATABASE_URL):
```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Connection string** (para DIRECT_URL):
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 3. Configurar no Vercel

No painel do Vercel:

1. Vá em **Settings** > **Environment Variables**
2. Adicione:

```
DATABASE_URL = postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL = postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
JWT_SECRET = sua-chave-secreta-super-longa-e-aleatoria
IFOOD_FEE_PERCENT = 25
NODE_ENV = production
```

### 4. Deploy e Migração

```bash
# Fazer commit das mudanças
git add .
git commit -m "Configure Supabase integration"
git push

# O Vercel fará o deploy automaticamente
# As tabelas serão criadas automaticamente via prisma db push
```

## 🔧 Comandos Úteis

```bash
# Testar conexão local
npm run db:setup

# Gerar cliente Prisma
npx prisma generate

# Criar tabelas
npx prisma db push

# Ver dados no Supabase
npx prisma studio
```

## 🎯 Vantagens do Supabase

### Performance
- **Connection pooling**: Reutiliza conexões, ideal para serverless
- **CDN global**: Dados servidos de múltiplas regiões
- **Índices automáticos**: Otimização automática de queries

### Desenvolvimento
- **Dashboard visual**: Interface para ver e editar dados
- **SQL Editor**: Execute queries diretamente no navegador
- **Logs em tempo real**: Monitore queries e performance

### Segurança
- **Row Level Security**: Controle de acesso granular
- **SSL obrigatório**: Todas as conexões são criptografadas
- **Backup automático**: Backups diários automáticos

## 🐛 Troubleshooting

### Erro de Conexão
```bash
# Teste a conexão
npm run db:setup
```

### Erro de Migração
- Verifique se ambas as URLs estão configuradas
- Confirme se a senha está correta
- Teste a conexão direta no Supabase Dashboard

### Performance Lenta
- Use sempre a URL com pooling (`?pgbouncer=true`)
- Verifique se está usando a região mais próxima
- Monitore queries no Supabase Dashboard

## 📊 Monitoramento

No Supabase Dashboard você pode:
- Ver queries em tempo real
- Monitorar performance
- Gerenciar usuários
- Configurar backups
- Ajustar configurações de segurança

## 🎉 Resultado

Após a configuração, você terá:
- ✅ Banco PostgreSQL na nuvem
- ✅ Pooling de conexões otimizado
- ✅ Interface visual para gerenciar dados
- ✅ Backup automático
- ✅ Escalabilidade automática
- ✅ Integração perfeita com Prisma